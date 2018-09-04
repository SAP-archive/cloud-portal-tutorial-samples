sap.ui.define([
		"products/list/model/GroupSortState",
		"sap/ui/model/json/JSONModel"
	], function (GroupSortState, JSONModel) {
	"use strict";

	QUnit.module("GroupSortState - grouping and sorting", {
		beforeEach: function () {
			this.oModel = new JSONModel({});
			// System under test
			this.oGroupSortState = new GroupSortState(this.oModel, function() {});
		}
	});

	QUnit.test("Should always return a sorter when sorting", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.sort("Price").length, 1, "The sorting by Price returned a sorter");
		assert.strictEqual(this.oGroupSortState.sort("Name").length, 1, "The sorting by Name returned a sorter");
	});

	QUnit.test("Should return a grouper when grouping", function (assert) {
		// Act + Assert
		assert.strictEqual(this.oGroupSortState.group("Price").length, 1, "The group by Price returned a sorter");
		assert.strictEqual(this.oGroupSortState.group("None").length, 0, "The sorting by None returned no sorter");
	});


	QUnit.test("Should set the sorting to Price if the user groupes by Price", function (assert) {
		// Act + Assert
		this.oGroupSortState.group("Price");
		assert.strictEqual(this.oModel.getProperty("/sortBy"), "Price", "The sorting is the same as the grouping");
	});

	QUnit.test("Should set the grouping to None if the user sorts by Name and there was a grouping before", function (assert) {
		// Arrange
		this.oModel.setProperty("/groupBy", "Price");

		this.oGroupSortState.sort("Name");

		// Assert
		assert.strictEqual(this.oModel.getProperty("/groupBy"), "None", "The grouping got reset");
	});
});