jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"products/list/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"products/list/test/integration/pages/App",
	"products/list/test/integration/pages/Browser",
	"products/list/test/integration/pages/Master",
	"products/list/test/integration/pages/Detail",
	"products/list/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "products.list.view."
	});

	sap.ui.require([
		"products/list/test/integration/NavigationJourneyPhone",
		"products/list/test/integration/NotFoundJourneyPhone",
		"products/list/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});