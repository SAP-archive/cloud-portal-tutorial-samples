sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";
	
	return {
	
		oDeviceModel: null,
		oContentModel : null,
		
		createDeviceModel: function() {
			this.oDeviceModel = new JSONModel(Device);
			this.oDeviceModel.setDefaultBindingMode("OneWay");
			return this.oDeviceModel;
		},
		
		createContentModel: function() {
			this.oContentModel = new JSONModel({
				featureItems : []
			});
			return this.oContentModel;
		},
		
		getContentModel: function() {
			return this.oContentModel;
		}
	};

});