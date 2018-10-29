sap.ui.define([
	"sap/ui/core/Component",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/MessageToast"
], function (Component, Button, Bar, MessageToast) {

	var FAVORITES_MODEL_ID = "favoritesModel";

	var PERSONALIZATION_FAVORITES_KEY = "persoaliztion_favorites_key";

	return Component.extend("favoritesplugin.Component", {

		metadata: {
			"manifest": "json"
		},

		fragment: null,

		init: function () {
			var rendererPromise = this._getRenderer();
			rendererPromise.then(function (oRenderer) {
				oRenderer.addHeaderEndItem("sap.ushell.ui.shell.ShellHeadItem", {
					icon: "sap-icon://favorite",
					id: "favoritesIcon",
					tooltip: "Add Favorite",
					press: function (oEvent) {
						this.openAddFavoritesDialog(oEvent.getSource());
					}.bind(this)
				}, true, false);
			}.bind(this));

			var oId = {
				container: "sap.ushell.demo.PortalSiteFavorites",
				item: "favorites"
			};

			this.core = sap.ui.getCore();
			this.oPersonalization = sap.ushell.Container.getService("Personalization");
			this.oConstants = this.oPersonalization.constants;
			this.oPersonalizer = this.oPersonalization.getPersonalizer(
				oId, {
					keyCategory: this.oConstants.keyCategory.FIXED_KEY,
					writeFrequency: this.oConstants.writeFrequency.LOW,
					clientStorageAllowed: false
				}, this);

			this.loadFavoritesModel();
		},

		loadFavoritesModel: function () {
			var that = this;
			this.oPersonalization.getContainer("sap.ushell.PortalSiteFavorites", {
					keyCategory: this.oConstants.keyCategory.FIXED_KEY,
					clientStorageAllowed: false,
					writeFrequency: this.oConstants.writeFrequency.HIGH,
					validity: "infinity"
				})
				.done(function (oContainer) {
					that.oPortalSiteFavoritesContainer = oContainer;
					that.setFavoritesModel();
				});
		},

		setFavoritesModel: function () {
			var portalSiteFavoritesModelObj = this.oPortalSiteFavoritesContainer.getItemValue(PERSONALIZATION_FAVORITES_KEY);
			if (typeof (portalSiteFavoritesModelObj) === "undefined") {
				portalSiteFavoritesModelObj = [];
			}
			var favoritesModel = this.getModel(FAVORITES_MODEL_ID);
			if (typeof (favoritesModel) === "undefined") {
				favoritesModel = new sap.ui.model.json.JSONModel();
			}
			favoritesModel.setData(portalSiteFavoritesModelObj);
			this.setModel(favoritesModel, FAVORITES_MODEL_ID);
			//favoritesModel.updateBindings();
			favoritesModel.refresh();
		},

		onAddFavorite: function (oEvent) {
			var siteService = this.getSiteService();
			if (siteService) {
				var currentTarget = siteService.getCurrentAppTarget();
				var targetTitle = siteService.getAppOrMenuTitle();
				var milli = new Date().getMilliseconds();
				var newFav = {
					name: targetTitle,
					target: currentTarget.semanticObject + "-" + currentTarget.action,
					semanticObject: currentTarget.semanticObject,
					action: currentTarget.action,
					id: targetTitle + "_" + milli
				};
				var favoritesModel = this.fragment.getModel(FAVORITES_MODEL_ID);
				favoritesModel.getData().push(newFav);
				favoritesModel.refresh();
			}
		},

		openAddFavoritesDialog: function (sourceCtrl) {
			if (this.fragment === null) {
				this.fragment = sap.ui.xmlfragment("favoritesplugin.fragment.AddFavorite", this);
				this.fragment.setModel(this.getModel("i18n"), "i18n");
				var favoritesModel = this.getModel(FAVORITES_MODEL_ID);
				this.fragment.setModel(favoritesModel, FAVORITES_MODEL_ID);

				var that = this;
				this.fragment.attachAfterClose(function () {
					//this.destroy();
					that.savePersonlaizedFavoritesModel();
				});

				this.fragment.setBusyIndicatorDelay(0);
			}

			this.fragment.openBy(sourceCtrl);
		},

		savePersonlaizedFavoritesModel: function () {
			var favoritesModel = this.fragment.getModel(FAVORITES_MODEL_ID);
			this.oPortalSiteFavoritesContainer.setItemValue(PERSONALIZATION_FAVORITES_KEY, favoritesModel.getData());

			this.oPortalSiteFavoritesContainer.save().fail(function () {
					alert("Saving personalization data failed.")
				})
				.done(function () {
					this.setFavoritesModel();
				}.bind(this));
		},

		onPopupClose: function (oEvent) {
			this.fragment.close();
		},

		onFavoriteItemPress: function (oEvent) {
			var selectedItem = oEvent.getParameter("listItem");
			var data = selectedItem.data();
			var target = {
				semanticObject: data.semanticObject,
				action: data.action
			};

			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: target
			});
		},

		onDeleteFavorite: function (oEvent) {
			var selectedItem = oEvent.getSource().getParent();
			var path2Delete = selectedItem.getBindingContextPath();
			var favoritesModel = this.fragment.getModel(FAVORITES_MODEL_ID);
			//favoritesModel.oData.splice(path2Delete.substring(1), 1);
			favoritesModel.getData().splice(path2Delete.substring(1), 1);
			favoritesModel.refresh();
		},
		
		onFavoritesReorderItems: function (oEvent) {
			//var sDropPosition = oEvent.getParameter("dropPosition");
			var oDraggedControl = oEvent.getParameter("draggedControl");
			var oDroppedControl = oEvent.getParameter("droppedControl");
			var draggedIndex = oDraggedControl.getBindingContextPath();
			var targetIndex = oDroppedControl.getBindingContextPath();
			var favoritesModel = this.fragment.getModel(FAVORITES_MODEL_ID);
			
			//var draggedElement = favoritesModel.oData.splice(draggedIndex.substring(1), 1)[0];
			var draggedElement = favoritesModel.getData().splice(draggedIndex.substring(1), 1)[0];
			//favoritesModel.oData.splice( targetIndex.substring(1), 0, draggedElement);
			favoritesModel.getData().splice( targetIndex.substring(1), 0, draggedElement);
			favoritesModel.refresh();
			
		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		},

		formPortalURL: function (url) {
			var siteSerivce = this.getSiteService();
			if (siteSerivce) {
				if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("URLHelper")) {
					var sComponentId = this.getOwnerComponent().getId();
					url = sap.ushell.Container.getService("URLHelper").createComponentURI(sComponentId, url);

				}
			}
			return url;
		},

		getSiteService: function () {
			var siteService = null;
			try {
				siteService = sap.ushell.Container.getService("SiteService");
			} catch (error) {}
			return siteService;
		},

	});
});