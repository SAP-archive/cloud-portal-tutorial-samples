sap.ui.define([],
	function () {
		"use strict";
			var FeatureControl = sap.ui.core.Control.extend("FeatureControl", {

				metadata: {
					properties: {
						"title": "string",
						"imageUrl": "string",
						"details": "string",
						"entityID": "string"
					},
					aggregations: {
					}
				},

				renderer: {
					render: function (rm, oControl) {
						rm.write("<div");
						rm.writeClasses();
						rm.write(">");
						
						var title = new sap.m.Title({
							text: oControl.getTitle(),
							level: sap.ui.core.TitleLevel.H2
						});
						title.addStyleClass("feature__title");
						rm.renderControl(title);
						
						var img = new sap.m.Image();
						img.setSrc(oControl.getImageUrl());
						img.setWidth("400px");
						img.setHeight("300px");
						img.addStyleClass("feature__image");
						rm.write("<div>");
						rm.renderControl(img);
						rm.write("</div>");
						
						var text = new sap.m.Text();
						text.addStyleClass("feature__text");
						text.setText(oControl.getDetails());
						rm.renderControl(text);

						rm.write("</div>");
					}
				}
			});


		return FeatureControl;
	}, true);