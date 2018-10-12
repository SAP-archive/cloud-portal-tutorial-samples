sap.ui.define([
	"sap/ui/core/Component",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/MessageToast"
], function (Component, Button, Bar, MessageToast) {

	return Component.extend("langselectorplugin.Component", {

		metadata: {
			"manifest": "json"
		},

		init: function () {
			//this.oBundle = this.getModel("i18n");
			var rendererPromise = this._getRenderer();
			rendererPromise.then(function (oRenderer) {
				this.UserInfoService = sap.ushell.Container.getService("UserInfo");
				this.UserInfoService.getLanguageList().then(function (oRenderer, langJSON) {
					this.createLanguageModel(langJSON);
					this._createLaunchpadButton(oRenderer);
				}.bind(this, oRenderer));
			}.bind(this));
		},

		createLanguageModel: function (langJSON) {
			var locale = navigator.language;
			locale = locale.substr(0, locale.indexOf("-"));
			langJSON.forEach(function (lang) {
				if (lang.text === "Browser Language") {
					lang.key = locale;
				}
			});
			var oModel = new sap.ui.model.json.JSONModel();
			oModel.setData(langJSON);
			this.setModel(oModel, "languages");
		},

		_createLaunchpadButton: function (oRenderer) {
			oRenderer.addHeaderEndItem("sap.ushell.ui.shell.ShellHeadItem", {
				id: "langSwitchPlugIn",
				icon: "sap-icon://world",
				tooltip: "Change Language", //this.oBundle.getProperty("switch_language"), //,
				press: this._showLanguageMenu.bind(this)
			}, true, false);
		},

		_showLanguageMenu: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._languageMenu) {
				this._languageMenu = sap.ui.xmlfragment("langselectorplugin.fragment.LanguageMenu", this);
				this._languageMenu.setModel(this.getModel("languages"), "languages");

				this._languageMenu.attachBeforeOpen(function () {
					var user = this.UserInfoService.getUser();
					var userLanguage = user.getLanguage();
					var languageActionSheet = sap.ui.getCore().byId("languageActionSheet");
					var buttons = languageActionSheet.getButtons();

					var userLangBtn = buttons.find(function (btn) {
						var k = btn.data("key");
						if ( k === userLanguage) {
							return btn;
						}
					});

					userLangBtn.setType(sap.m.ButtonType.Emphasized);
					userLangBtn.setIcon("sap-icon://accept");
				}.bind(this));

				this._languageMenu.openBy(oButton);
			}
		},

		onLanguageSelected: function (oEvent) {
			var sSelectedLanguageCode = oEvent.getSource().data("key");
			var sCurrentLanguageCode = sap.ui.getCore().getConfiguration().getLanguage();

			if (sSelectedLanguageCode !== sCurrentLanguageCode) {
				var user = this.UserInfoService.getUser();
				user.setLanguage(sSelectedLanguageCode);
				this.UserInfoService.updateUserPreferences(user);

				location.reload();
			}
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
					// renderer not initialized yet, listen to rendererCreated event
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
		}
	});
});