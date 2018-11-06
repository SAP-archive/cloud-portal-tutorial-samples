sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("northwind.customerList.controller.View1", {
		
		onInit: function(){
			var sUrl = this.formPortalURL("/../destinations/northwind/V2/Northwind/Northwind.svc/");
			var oDataModel = new sap.ui.model.odata.v2.ODataModel(sUrl, true);
			oDataModel.setUseBatch(false);
			this.getView().setModel(oDataModel);
		},
		
		onListItemPress: function (evt) {
			var source = evt.getSource();
			var selectedObj = source._getBindingContext().getObject();
			var address = selectedObj.Address + " " + selectedObj.City + " " + selectedObj.PostalCode + " " + selectedObj.Country;
			
			var eventBus = sap.ui.getCore().getEventBus();
			eventBus.publish("google.maps", "location-search-and-change", {address: address});
		},
		
		formPortalURL: function(url) {
			var siteSerivce = this.getSiteService();
			if (siteSerivce) {
				if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("URLHelper")) {
					var sComponentId = this.getOwnerComponent().getId();
					url = sap.ushell.Container.getService("URLHelper").createComponentURI(sComponentId, url);
				}
			}
			return url;
		},
		
		setScrollerHeight: function(height){
			var view = this.getView();
			var customerListScrollContainer = view.byId("customerListScrollContainer");
			customerListScrollContainer.setHeight(height);
		},
		
		getSiteService: function(){
			var siteService = null;
			try{
				siteService = sap.ushell.Container.getService("SiteService");
			}catch(error){}
			return siteService;
		}

	});
});