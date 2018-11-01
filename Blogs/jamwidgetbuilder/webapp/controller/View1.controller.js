sap.ui.define([
	"sap/m/MessageToast",
	"sap/ui/core/mvc/Controller"
], function(MessageToast, Controller) {
	"use strict";

	var FEED_TYPE = {
		COMPANY: "0",
		GROUP: "1"
	};

	var JAM_HOST = "https://developer.sapjam.com";
	var JAM_FEED_BOOTSTRAP_URL = JAM_HOST + "/assets/feed_widget_v1.js";
	var JAM_ACCOUNT_FEED_PREFIX = JAM_HOST + "/c/";
	var JAM_ACCOUNT_FEED_SUFIX = "/widget/v1/feed";
	var JAM_SERVLET = "/../destinations/jam_servlet/sapjamproxy";
	var JAM_ODATA_GROUPS =  "/../destinations/jam/api/v1/OData/Groups?$top=100";

	return Controller.extend("jamWidgetBuilder.controller.View1", {

		onInit: function() {
			this.view = this.getView();
			this.oCmp = this.getOwnerComponent();
			this.core = sap.ui.getCore();

			this.view.setBusyIndicatorDelay(0);

			this.config = this.oCmp.getMetadata().getConfig();
			this.oCmp.attachEvent("open.dialog", this.openSettingsFragment.bind(this));
			this.oCmp.attachEvent("save.settings.error", function (oEvent) {
				MessageToast.show("Save failed for widget settings.");
			});
		},

		onConfigChange: function(settings) {
			this.initJamWidget(settings);
		},
		
		openSettingsFragment: function() {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;

			this.fragment = sap.ui.xmlfragment("jamWidgetBuilder.view.fragment.widgetSettings", this);
			this.fragment.setModel(this.view.getModel("i18n"), "i18n");
			
			if (!this.groupsModel) {
				var url = this.calculateURL(JAM_ODATA_GROUPS);
				this.groupsModel = new sap.ui.model.json.JSONModel(url);
				this.groupsModel.attachRequestCompleted(this.onGroupsModelRequestCompleted.bind(this));
				this.groupsModel.attachRequestFailed(this.onGroupsModelRequestFailed.bind(this));
			} 
			
			this.fragment.setModel(this.groupsModel, "GroupsData");
			this.fragment.setModel(new sap.ui.model.json.JSONModel(jQuery.extend({}, settings)), "settingsProperties");
			this.fragment.attachAfterClose(function() {
				this.destroy();
			});
			
			this.fragment.attachAfterOpen(function(){
				var groupSelectBox = this.core.byId("groupSelectBox");
				if(settings.feedType === FEED_TYPE.GROUP){
					groupSelectBox.setVisible(true);
				}else{
					groupSelectBox.setVisible(false);
				}
				var groupSelectList = this.core.byId("groupSelectList");
				if (settings.groupID) {
					groupSelectList.setSelectedKey(settings.groupID);
				}
			}.bind(this));

			this.fragment.setBusyIndicatorDelay(0);
			this.fragment.open();
		},
		
		onSettingsSubmit: function(oEvent) {
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			var feedTypeSelectList = this.core.byId("feedTypeSelectList");
			var selectedFeedType = feedTypeSelectList.getSelectedKey();
			
			var groupSelectList = this.core.byId("groupSelectList");
			var selectedGroupID = groupSelectList.getSelectedKey();

			var widgetHeightDesktop = this.core.byId("widgetHeightDesktop");
			var desktopHeight = widgetHeightDesktop.getValue();
			
			var accountDomainInput = this.core.byId("accountDomainInput");
			var accountDomain = accountDomainInput.getValue();

			settings.feedType = selectedFeedType;
			settings.groupID = selectedGroupID;
			settings.desktopHeight = desktopHeight;
			settings.accountDomain = accountDomain;
			this.oCmp.fireEvent("save.settings", settings);
			oEvent.getSource().getParent().close();
		},

		onSettingCancel: function(oEvent) {
			oEvent.getSource().getParent().close();
		},
		
		onFeedTypeChange: function(oEvent){
			var selectedItem = oEvent.getParameter("selectedItem");
			var key = selectedItem.getKey();
			var groupSelectBox = this.core.byId("groupSelectBox");
			if( key === FEED_TYPE.GROUP ){
				groupSelectBox.setVisible(true);
			}
			else if( key === FEED_TYPE.COMPANY ){
				groupSelectBox.setVisible(false);
			}
		},
		
		onGroupsModelRequestCompleted: function(oEvent) {
			if (oEvent.getParameter("errorobject")) {
				this.onGroupsModelRequestFailed();
			}
			
			var settings = this.oCmp.getMetadata().getManifest()["sap.cloud.portal"].settings;
			var groupSelectList = this.core.byId("groupSelectList");
			if (settings.groupID) {
				groupSelectList.setSelectedKey(settings.groupID);
			}

			groupSelectList.setBusy(false);
			groupSelectList.addStyleClass("groupListDataLoaded");
		},
		
		onGroupsModelRequestFailed: function() {
			sap.ui.getCore().byId("jamErrorHtml").setVisible(true);
			this.jamError = true;
			jQuery(".jamProperties").addClass("disableChange");

			this.fragment.setBusy(false);
			this.groupsModel = null;
		},
		
		setWidgetHeight: function(settings){
			var containerID = this.getView().createId("jamContainer");
			var height = settings.desktopHeight + "px";
			$("#" + containerID).height(height);
		},

		initJamWidget: function(settings) {
			
			this.setWidgetHeight(settings);
			
			if(settings.accountDomain === ""){
				MessageToast.show("SAP Jam account domain missing configuration.");
				return;
			}
		
			this.getJamAccessToken().then(function(token) {

				var jamWidgetOptions = {
					avatar: true,
					is_sso: true,
					live_update: true,
					post_mode: "inline",
					reply_mode: "inline",
					single_use_token: token
				};
				
				if(settings.feedType === FEED_TYPE.COMPANY ){
					jamWidgetOptions.type = "company";
				}
				else if(settings.feedType === FEED_TYPE.GROUP){
					jamWidgetOptions.type = "group";
					jamWidgetOptions.group_id = settings.groupID;
				}

				this.boostrapJam().then(function(res) {
					if (sapjam && sapjam.feedWidget) {
						var containerID = this.getView().createId("jamContainer");
						$("#" + containerID).empty();
						var URL = JAM_ACCOUNT_FEED_PREFIX + settings.accountDomain + JAM_ACCOUNT_FEED_SUFIX;
						sapjam.feedWidget.init(URL, "single_use_token");
						var w = sapjam.feedWidget.create(containerID, jamWidgetOptions);
					} else {
						MessageToast.show("Failed to bootstrap JAM feed.");
					}
				}.bind(this)).fail(function(error) {
					MessageToast.show("Failed to bootstrap JAM feed.");
				});
			}.bind(this)).fail(function(error) {
				MessageToast.show("Failed to get Jam access token.");
			}.bind(this));
		},

		getJamAccessToken: function() {
			var oDeferred = $.Deferred();
			var URL = this.calculateURL(JAM_SERVLET) + "?command=single_use_tokens";
			$.ajax({
				url: URL,
				method: "GET",
				success: function(result, status, xhr) {
					var xmlDoc = $.parseXML(result);
					var tokenNode = $(xmlDoc).find("single_use_token");
					if (tokenNode) {
						var token = tokenNode.attr("id");
						oDeferred.resolve(token);
					} else {
						oDeferred.reject(result);
					}
				}.bind(this),
				error: function(error) {
					oDeferred.reject(error);
				}
			});
			return oDeferred;
		},
		
		boostrapJam: function(){
			var oDeferred = $.Deferred();
		 	$.ajax({
				url:  JAM_FEED_BOOTSTRAP_URL,
				dataType: "script",
				async: false,
				success: function(result, status, xhr){
					oDeferred.resolve(result);
				}.bind(this),
				error: function(error){
					oDeferred.reject(error);
				}
			});
			return oDeferred;
		},
		
		calculateURL: function(sPath) {
			if (sap.ushell.Container) {
				return sap.ushell.Container.getService("URLHelper").createComponentURI(this.getOwnerComponent().getId(), sPath); 
			}else{
				return sPath;
			}
		},
		
		getSiteService: function(){
			try{
				return sap.ushell.Container.getService("SiteService");
			}catch(err){}
			return null;
		}

	});
});