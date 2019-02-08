jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Products in the list
// * All 3 Products have at least one Supplier

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
		"products/list/test/integration/MasterJourney",
		"products/list/test/integration/NavigationJourney",
		"products/list/test/integration/NotFoundJourney",
		"products/list/test/integration/BusyJourney",
		"products/list/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});