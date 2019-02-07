sap.ui.define([],
function () {
	"use strict";
	var GroupedLinksLinkControl = sap.ui.core.Control.extend("GroupedLinksLinkControl", {

		metadata: {
			properties: {
				"icon" : "string",
				"title" : "string",
				"url" : "string",
				"target" : "string",
				"exists" : "boolean"
			},
			aggregations: {
			}
		},
	   
		renderer: {
			render: function (rm, oControl) {
				rm.write("<li");
				rm.writeClasses();
				rm.write(">");

				var icon = new sap.ui.core.Icon({
					src: 'sap-icon://' + oControl.getIcon()
				});
				icon.addStyleClass("grouped_links__icon");
				rm.renderControl(icon);
				
				var link = new sap.m.Link({
					text: oControl.getTitle(),
					href: oControl.getUrl(),
					target: oControl.getTarget()
				});
				link.addStyleClass("grouped_links__link");
				rm.renderControl(link);
				
				rm.write("</li>");
			}
		}
	});


	return GroupedLinksLinkControl;
}, true);