sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"teched/supplierlookup/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("teched.supplierlookup.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);
			
			var serviceURL = this.calculateServiceURL("/sap/opu/odata/sap/EPM_REF_APPS_PROD_MAN_SRV/");
			var oES5Model = new sap.ui.model.odata.v2.ODataModel(serviceURL);
			this.setModel(oES5Model, "oES5Model");

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.controller = this.getAggregation("rootControl").getController();
		},
		
		calculateServiceURL: function(sPath) {
			if (sap.ushell.Container) {
				return sap.ushell.Container.getService("URLHelper").createComponentURI(/*this.getOwnerComponent().getId()*/this.getId(), sPath); 
			}else{
				return sPath;
			}
		},
		
		onConfigChange: function() {
			this.controller.onConfigChange();
		}
	});
});