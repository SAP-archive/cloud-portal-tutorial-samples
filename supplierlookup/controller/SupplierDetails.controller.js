sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/m/MessageToast"
], function (Controller, JSONModel, Filter, FilterOperator, FilterType, MessageToast) {
	"use strict";

	var oAppModel;

	return Controller.extend("teched.supplierlookup.controller.SupplierDetails", {

		onInit: function () {
			this.oView = this.getView();
			this.oCmp = this.getOwnerComponent();
			this.bundle = this.oCmp.getModel("i18n");
			this.core = sap.ui.getCore();

			this.config = this.oCmp.getMetadata().getConfig();
			this.oCmp.attachEvent("open.dialog", this.openSettingsFragment.bind(this));
		},

		onAfterRendering: function () {
			this.oView.setBusy(true);
			this.oSF = this.oView.byId("searchField");
			oAppModel = this.oCmp.getModel("app");
			oAppModel.setProperty("/supplierLoaded", false);
			oAppModel.setProperty("/errorMsg", "Could not establish connection...");

			var oDataModel = this.oCmp.getModel("data");
			oDataModel.read("/Suppliers", {
				success: this.setSuppliersModel.bind(this),
				error: function (e) {
					MessageToast.show("Failed to read list of Suppliers: " + e);
				}.bind(this)
			});
		},

		onConfigChange: function () {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.oSF.setEnableSuggestions(settings.enable_search_suggestions);
		},

		setSuppliersModel: function (oSuppliers) {
			var oModel = new JSONModel();
			oModel.setData(oSuppliers.results);
			this.oView.setModel(oModel, "oSuppliers");
			this.oView.setBusy(false);
		},

		onSearch: function (event) {
			if (this.oSF.getEnableSuggestions()) {
				this.oView.setBusy(true);
				var item = event.getParameter("suggestionItem");
				if (item) {
					var key = item.getKey();
					var oDataModel = this.oCmp.getModel("data");
					var odataObjID = "/Suppliers('" + key + "')";
					oDataModel.read(odataObjID, {
						success: this.setSupplierDetails.bind(this),
						error: function (e) {
							MessageToast.show("Search failed: " + e);
						}.bind(this)
					});
				}
			} else {
				var query = event.getParameter("query");
				var aFilters = [];
				if (query && query.length > 0) {
					var filter = new Filter("Name", sap.ui.model.FilterOperator.Contains, query);
					aFilters.push(filter);
				}
				var oDataModel = this.oCmp.getModel("data");
				oDataModel.read("/Suppliers", {
					filters: aFilters,
					success: function (response) {
						if (response.results !== null && response.results.length > 0) {
							this.setSupplierDetails(response.results[0]);
						}
					}.bind(this),
					error: function (e) {
						MessageToast.show("Search failed: " + e);
					}
				});
			}

		},

		onSuggest: function (event) {
			var value = event.getParameter("suggestValue");
			var filters = [];
			if (value) {
				filters = [
					new Filter([
						new sap.ui.model.Filter("Name", function (sDes) {
							return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
						})
					], false)
				];
			}
			this.oSF.getBinding("suggestionItems").filter(filters);
			this.oSF.suggest();
		},

		setSupplierDetails: function (oSupplier) {
			this.oView.setBusy(false);
			this._isSupplierInitialized = true;
			oAppModel.setProperty("/supplier", oSupplier || {});
			oAppModel.setProperty("/supplierLoaded", true);
		},

		openSettingsFragment: function () {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			this.fragment = sap.ui.xmlfragment("teched.supplierlookup.view.fragment.WidgetSettings", this);
			this.fragment.setModel(this.bundle, "i18n");
			this.fragment.attachAfterClose(function () {
				this.destroy();
			});

			this.fragment.attachBeforeOpen(function (settings) {
				var searchSuggestionsSwitch = this.core.byId("searchSuggestionsSwitch");
				searchSuggestionsSwitch.setState(settings.enable_search_suggestions);
			}.bind(this, settings));

			this.fragment.setBusyIndicatorDelay(0);
			this.fragment.open();
		},

		onSettingsSubmit: function (oEvent) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			settings = {
				"enable_search_suggestions": sap.ui.getCore().byId("searchSuggestionsSwitch").getState()
			};
			this.oCmp.fireEvent("save.settings", settings);
			oEvent.getSource().getParent().close();
		},

		onSettingCancel: function (oEvent) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			oEvent.getSource().getParent().close();
		}

	});
});