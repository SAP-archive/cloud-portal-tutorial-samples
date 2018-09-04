sap.ui.define([
		"sap/ui/test/opaQunit"
	], function (opaTest) {
		"use strict";

		QUnit.module("FLP Integration");

		opaTest("Should open the share menu and display the share buttons on the detail page", function (Given, When, Then) {
			// Arrangements
			Given.iStartTheApp();

			// Actions
			When.onTheMasterPage.iRememberTheSelectedItem();

			// Assertions
			Then.onTheDetailPage.iShouldSeeTheRememberedObject();

			// Actions
			When.onTheDetailPage.iPressOnTheShareButton();

			// Assertions
			Then.onTheDetailPage.iShouldSeeTheShareEmailButton().
				and.iShouldSeeTheShareTileButton().
				and.theShareTileButtonShouldContainTheRememberedObjectName().
				and.iTeardownMyAppFrame();
		});

	}
);