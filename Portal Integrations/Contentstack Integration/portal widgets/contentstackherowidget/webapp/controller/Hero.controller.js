sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"contentstackherowidget/model/models"
], function(Controller, models) {
	"use strict";
	return Controller.extend("contentstackherowidget.controller.Hero", {
		onInit: function() {
			var proxyPath = jQuery.sap.getModulePath("contentstackherowidget") + "/.." + "/contentstack_proxy/content_types/hero/entries";
			
			$.ajax({
				url: proxyPath,
				type: "GET",
				dataType: "json",
				success: function(data) {
					var oModel = models.getContentModel();
					var oEntry = data.entries[0];
					oModel.setProperty("/title", oEntry.title);
					oModel.setProperty("/headline", oEntry.headline);
					oModel.setProperty("/videoImage", oEntry.video_image.url);
					oModel.setProperty("/videoUrl", oEntry.video_url.href);
					oModel.setProperty("/videoTooltip", oEntry.video_url.title);
					oModel.setProperty("/introHeader", oEntry.intro_header);
					oModel.setProperty("/introText", oEntry.intro_text);
					oModel.setProperty("/callToActionText", oEntry.call_to_action.title);
					oModel.setProperty("/callToActionLink", oEntry.call_to_action.href);
				}.bind(this),
				error: function() {
					alert("an error getting data from Built.io!");
				}
			});
		},
		
		onCallToActionPress: function() {
			var oModel = models.getContentModel();
			var link = oModel.getProperty("/callToActionLink");
			window.open(link, "_blank");
		},
		
		onImagePress: function() {
			var oModel = models.getContentModel();
			var link = oModel.getProperty("/videoUrl");
			window.open(link, "_blank");
		}
	});
});