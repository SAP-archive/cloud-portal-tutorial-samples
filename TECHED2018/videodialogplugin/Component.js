sap.ui.define([
	"sap/ui/core/Component",
	"sap/m/Button",
	"sap/m/Bar",
	"sap/m/MessageToast"
], function (Component, Button, Bar, MessageToast) {

	return Component.extend("videodialogplugin.Component", {

		metadata: {
			"manifest": "json"
		},

		DEFAULT_VIDEO_URL: "https://www.youtube.com/embed/zVj5LnEYjAw?autoplay=1&rel=0",

		init: function () {
			var rendererPromise = this._getRenderer();

			rendererPromise.then(function (oRenderer) {
				oRenderer.addHeaderEndItem("sap.ushell.ui.shell.ShellHeadItem", {
					id: "videoBtn",
					icon: "sap-icon://video",
					tooltip: "Show welcome video",
					press: this.showVideoPopup.bind(this)
				}, true, false);
			}.bind(this));

		},

		showVideoPopup: function () {
			var componentData = this.getComponentData();
			var config = componentData.config;
			var videoURL = this.DEFAULT_VIDEO_URL;
			if (config && config.video_url) {
				videoURL = config.video_url;
			}
			var isMobile = sap.ui.Device.system.phone,
				frameWidth = isMobile ? "268px" : "853px",
				frameHeight = isMobile ? "150px" : "480px",
				contentWidth = isMobile ? "288px" : "893px",
				contentHeight = isMobile ? "170px" : "520px";

			var videoDialog = new sap.m.Dialog({
				showHeader: false,
				contentWidth: contentWidth,
				contentHeight: contentHeight,
				content: new sap.ui.core.HTML({
					content: '<iframe id="videoDialogFrame" src=' + videoURL + ' frameborder="0" allowfullscreen width="' +
						frameWidth + '" height="' + frameHeight + '" autoplay></iframe><div id="videoDialogCloseButton">X</div>'
				})
			}).addStyleClass(isMobile ? "videoDialog mobile" : "videoDialog");

			videoDialog.attachAfterClose(function () {
				jQuery("#videoDialogFrame").remove();
				this.destroy(); // view is destroyed as a video plays inside
			});
			videoDialog.open();
			videoDialog.attachAfterOpen(function () {
				jQuery("#videoDialogCloseButton").click(function () {
					videoDialog.close();
				});
			});
		},

		/**
		 * Returns the shell renderer instance in a reliable way,
		 * i.e. independent from the initialization time of the plug-in.
		 * This means that the current renderer is returned immediately, if it
		 * is already created (plug-in is loaded after renderer creation) or it
		 * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
		 * before the renderer is created).
		 *
		 *  @returns {object}
		 *      a jQuery promise, resolved with the renderer instance, or
		 *      rejected with an error message.
		 */
		_getRenderer: function () {
			var that = this,
				oDeferred = new jQuery.Deferred(),
				oRenderer;

			that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
			if (!that._oShellContainer) {
				oDeferred.reject(
					"Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
			} else {
				oRenderer = that._oShellContainer.getRenderer();
				if (oRenderer) {
					oDeferred.resolve(oRenderer);
				} else {
					// renderer not initialized yet, listen to rendererCreated event
					that._onRendererCreated = function (oEvent) {
						oRenderer = oEvent.getParameter("renderer");
						if (oRenderer) {
							oDeferred.resolve(oRenderer);
						} else {
							oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
						}
					};
					that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
				}
			}
			return oDeferred.promise();
		}
	});
});