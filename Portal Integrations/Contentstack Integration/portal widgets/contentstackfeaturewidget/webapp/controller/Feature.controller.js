sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"contentstackfeaturewidget/control/FeatureControl"
], function(Controller, FeatureControl) {
	"use strict";
	return Controller.extend("contentstackfeaturewidget.controller.Feature", {
		onInit: function() {
			this.view = this.getView();
			this.oCmp = this.getOwnerComponent();
			this.core = sap.ui.getCore();
			
			this.config = this.oCmp.getMetadata().getConfig();
			this.oCmp.attachEvent("open.dialog", this.openSettingsFragment.bind(this));
		},
		
		performAJAXRequest: function(query){
			var oDeferred = $.Deferred();
			$.ajax({
				url:query,
				type: "GET",
				dataType: "json",
				success: function(data) {
					oDeferred.resolve(data);
				}.bind(this),
				error: function(error) {
					alert("an error getting data from Contentstack!");
					oDeferred.reject(error);
				}
			});
			return oDeferred.promise();
		},
		
		onConfigChange: function() {
			var settings = this.getOwnerComponent().getMetadata().getManifest()["sap.cloud.portal"].settings;
			var selectedEntity = settings.selectedEntity;
			
			//this.setWidgetHeight(settings);
			
			if(selectedEntity !== ""){
				var proxyPath = jQuery.sap.getModulePath("contentstackfeaturewidget") + "/.." + "/contentstack_proxy/content_types/feature/entries/" + selectedEntity;
				this.performAJAXRequest(proxyPath).then(function(data){
					var featureControl,  cLayout = this.view.byId('FeatureLayout');
					cLayout.removeAllItems();
					if(data.hasOwnProperty("entry")){
						featureControl = this.renderEntry(data.entry);
						cLayout.addItem(featureControl);
					}else{
						for (var i = 0; i < data.entries.length; i++) {
							var entry = data.entries[i];
							featureControl = this.renderEntry(entry);
							cLayout.addItem(featureControl);
						}
					}
				}.bind(this));
			}
		},
		
		setWidgetHeight: function(settings){
			var isDT = sap.ushell.Container.getService("SiteService").isDesignTime(),
			mobile = sap.ui.Device.system.phone,
			height = "inherit";

			if (isDT || (!isDT && !mobile)) {
				height = settings.desktopHeight + "px";
			} else if (!isDT && mobile) {
				height = settings.mobileHeight + "px";
			}
			this.view.byId("FeatureLayout").setHeight(height);
			
		},
		
		renderEntry: function(entry){
			var featureControl = new FeatureControl();
			featureControl.setTitle(entry.title);
			featureControl.setImageUrl(entry.image.url);
			featureControl.setDetails(entry.details);
			featureControl.addStyleClass('feature__article');
			return featureControl;
		},
		
		openSettingsFragment: function() {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;

			this.fragment = sap.ui.xmlfragment("contentstackfeaturewidget.fragment.WidgetSettings", this);
			this.fragment.setModel(this.view.getModel("i18n"), "i18n");
			this.fragment.setModel(new sap.ui.model.json.JSONModel(jQuery.extend({}, settings)), "widgetProperties");
			this.fragment.attachAfterClose(function() {
				this.destroy();
			});
			
			this.fragment.attachBeforeOpen(function(){
				var proxyPath = jQuery.sap.getModulePath("contentstackfeaturewidget") + "/.." + "/contentstack_proxy/content_types/feature/entries";
				this.performAJAXRequest(proxyPath).then(function(data){
					var listContainer = this.core.byId('listContainer');
					listContainer.removeAllItems();
					
					var featureEntriesModel = new sap.ui.model.json.JSONModel();
					featureEntriesModel.setData(data.entries);
					this.fragment.setModel(featureEntriesModel, "featureEntriesModel");
				}.bind(this));
				
			}.bind(this));

			this.fragment.setBusyIndicatorDelay(0);
			this.fragment.open();
		},
		
		onSettingsSubmit: function(oEvent) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			var listContainer = this.core.byId('listContainer');
			var selectedItem = listContainer.getSelectedContexts()[0];
		/*	var desktopHeight =this.core.byId('widgetHeightDesktop').getValue();
			var mobileHeight = this.core.byId('widgetHeightMobile').getValue();*/
			
			var selectedEntity;
			if(typeof(selectedItem) === "undefined"){
				selectedEntity= "";
			}else{
				selectedEntity = selectedItem.getObject("uid");
			}
			
			settings = {
				"selectedEntity": selectedEntity/*,
				"desktopHeight": desktopHeight,
				"mobileHeight": mobileHeight*/
			};

			this.oCmp.fireEvent("save.settings", settings);
			oEvent.getSource().getParent().close();
		},
		
		onSettingCancel: function(oEvent) {
			oEvent.getSource().getParent().close();
		}
		
		
	});
});