sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"contentstacklinkswidget/model/models",
	"contentstacklinkswidget/control/GroupedLinksListControl",
	"contentstacklinkswidget/control/GroupedLinksItemControl"
], function(Controller, models, GroupedLinksListControl, GroupedLinksItemControl) {
	"use strict";
	return Controller.extend("contentstacklinkswidget.controller.GroupedLinks", {
		
		onInit: function() {
			var includeNestedReferences = "include[]=link_group.links";
			var language = sap.ui.getCore().getConfiguration().getLanguage();
			if (language === "he") {
				language = "?locale=he-il&" + includeNestedReferences;
			} else if (language === "de") {
				language = "?locale=de-de&" + includeNestedReferences;
			}
			else {
				language = "?" + includeNestedReferences;
			}

			var proxyPath = jQuery.sap.getModulePath("contentstacklinkswidget") + "/.." + "/contentstack_proxy/content_types/grouped_links/entries" + language;
			
			var onSuccess = function(data) {
				var view = this.getView();
				
				var oModel = models.getContentModel();
				var oEntry = data.entries[0];
				oModel.setProperty("/title", oEntry.title);
				
				var oGroupLayout = view.byId('GroupedLinksGroupLayout');
				oGroupLayout.removeAllItems();
				
				var listControl, itemControl;
				
				for (var g = 0; g < oEntry.link_group.length; g++) {
					var linkGroup = oEntry.link_group[g];
					listControl = new GroupedLinksListControl({});
					listControl.setTitle(linkGroup.title);
					
					for (var l = 0; l < linkGroup.links.length; l++) {
						var link = linkGroup.links[l];
						itemControl = new GroupedLinksItemControl({});
						itemControl.setTitle(link.title);
						itemControl.setIcon(link.icon);
						itemControl.setUrl(link.url);
						itemControl.setTarget(link.target);
						listControl.addLink(itemControl);
					}
					
					oGroupLayout.addItem(listControl);
				}
			};
			
			$.ajax({
				url: proxyPath,
				type: "GET",
				dataType: "json",
				success: onSuccess.bind(this),
				error: function() {
					if (language === "") {
						//alert("an error getting data from build!");
					} else {
						language = "";
						
						proxyPath = jQuery.sap.getModulePath("contentstacklinkswidget") + "/.." + "/contentstack_proxy/content_types/grouped_links/entries" + language;
						$.ajax({
							url: proxyPath,
							type: "GET",
							dataType: "json",
							success: onSuccess.bind(this),
							error: function() {
								//alert("an error getting data from build!");
							}
						});
					}
					
				}.bind(this)
			});
		},
		
		oAfterRendering: function() {
			var view = this.getView();
			var oGroupLayout = view.byId('GroupedLinksGroupLayout');
			var groups = oGroupLayout.getContent();
			for (var i=0 ; i< groups.length; i++) {
				if (!groups[i].getExists()) {
					oGroupLayout.removeContent(groups[i]);
					oGroupLayout.rerender();
				}
			}
		}
	});
});