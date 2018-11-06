sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"northwind/customerList/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("northwind.customerList.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			this.controller = this.getAggregation("rootControl").getController();
		},
		
		onConfigChange: function() {
			var settings = this.getMetadata().getManifest()["sap.cloud.portal"].settings;
			if(settings){
				this.controller.setScrollerHeight(settings.height.value + "px");
				//this.getAggregation("rootControl").$().css("height", settings.height.value + "px");
			}
			
		}
	});
});