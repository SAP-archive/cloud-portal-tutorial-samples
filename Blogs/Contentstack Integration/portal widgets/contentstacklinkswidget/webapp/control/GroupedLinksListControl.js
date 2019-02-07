sap.ui.define([
	"contentstacklinkswidget/control/GroupedLinksItemControl"
], function (GroupedLinksItemControl) {
		"use strict";
		var GroupedLinksListControl = sap.ui.core.Control.extend("GroupedLinksListControl", {

			metadata: {
				properties: {
					"title" : "string",
					"exists" : "boolean"
				},
				aggregations: {
					links : {type : "contentstacklinkswidget.control.GroupedLinksItemControl", multiple : true}
				}
			},

			renderer: {
				render: function (rm, oControl) {
					rm.write("<div");
					rm.writeClasses();
					rm.write(">");
					var title = new sap.m.Title({
						text: oControl.getTitle(), 
						level: sap.ui.core.TitleLevel.H3
					});
					title.addStyleClass("grouped_links__group_title");
					rm.renderControl(title);
					
					rm.write("<ul class='grouped_links__list'>");
					var aLinks = oControl.getLinks();
					for (var i = 0; i < aLinks.length; i++) {
						aLinks[i].addStyleClass("grouped_links__item");
						rm.renderControl(aLinks[i]);
					}
					rm.write("</ul>");
					
					rm.write("</div>");
				}
			}
		});

		return GroupedLinksListControl;
	}, true);