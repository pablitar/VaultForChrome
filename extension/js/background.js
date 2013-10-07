(function(Leap) {
	var X = 0;
	var Y = 1;
	var Z = 2;

	var self = window.vault = {
		connected : false
	};
	var defaultConfig = {
		speed : 700,
		xCalibration : 0.0,
		yCalibration : -0.4,
		minUpdateInterval : 0.017,
		enableVerticalScroll : true,
		enableHorizontalScroll : true,
		invertVerticalScroll : false,
		invertHorizontalScroll : false,
		enableCircleGestures : true,
		tabSwitchInterval : 500000,
		enableSwipeGestures : true
	};
	
	$.extend(self, behaviours.Events);

	self.isConnected = function() {
		return self.connected;
	};

	self.reloadConfiguration = function(callback) {
		chrome.storage.sync.get(null, function(items) {
			self.config = $.extend({}, defaultConfig, items);
			if ( typeof callback === "function")
				callback();
		});
	};

	self.performScroll = function(aHand) {

		function axisValue(normalValue, calibration, invert) {
			return (-normalValue + calibration) * ( invert ? -1 : 1);
		}

		function speedFactor(enabled, axisValue) {
			return enabled ? Math.pow(Math.abs(axisValue) + 1, 4) : 0;
		}

		var x = axisValue(aHand.palmNormal[X], this.config.xCalibration, this.config.invertHorizontalScroll);
		var y = axisValue(aHand.palmNormal[Z], this.config.yCalibration, this.config.invertVerticalScroll);

		var speedFactorX = speedFactor(this.config.enableHorizontalScroll, x);
		var speedFactorY = speedFactor(this.config.enableVerticalScroll, y);

		var delta = this.config.speed * this.elapsedSeconds();

		self.executeScript("window.scrollBy(" + x * speedFactorX * delta + ", " + y * speedFactorY * delta + ");");
	};

	self.executeScript = function(code) {
		chrome.tabs.executeScript({
			code : code
		});
	};

	self.checkScroll = function(aHand) {
		if (aHand.fingers.length >= 4) {
			this.performScroll(aHand);
		}
	};

	self.elapsedSeconds = function() {
		return (this.currentFrame.timestamp - this.lastTimestamp) / 1000000;
	};

	self.checkCircle = function(aCircleGesture) {
		if (self.currentCircle == undefined || self.currentCircle.id != aCircleGesture.id) {
			self.startCircleGesture(aCircleGesture);
		} else {
			self.continueCircleGesture(aCircleGesture);
		}
	};

	self.continueCircleGesture = function(aCircleGesture) {
		if (aCircleGesture.duration - self.lastTabSwitchStamp > self.config.tabSwitchInterval) {
			self.performTabSwitch(aCircleGesture);
		}
	};

	self.startCircleGesture = function(aCircleGesture) {
		self.currentCircle = aCircleGesture;
		self.lastTabSwitchStamp = aCircleGesture.duration - self.config.tabSwitchInterval / 1.2;
	};

	self.activateTabByIndex = function(tabIndex) {
		chrome.tabs.query({
			index : tabIndex
		}, function(tabs) {
			chrome.tabs.update(tabs[0].id, {
				active : true
			});
		});
	};

	self.switchTab = function(indexCalculator) {
		chrome.tabs.query({
			active : true,
			currentWindow : true
		}, function(tabs) {
			if (tabs.length) {
				var activeTab = tabs[0];
				chrome.tabs.query({
					currentWindow : true
				}, function(moreTabs) {
					var nextIndex = (indexCalculator(activeTab.index) + moreTabs.length) % moreTabs.length;

					self.activateTabByIndex(nextIndex);
				});
			}
		});
	};

	self.tabNext = function() {
		self.switchTab(function(anIndex) {
			return anIndex + 1;
		});
	};

	self.tabPrevious = function() {
		self.switchTab(function(anIndex) {
			return anIndex - 1;
		});
	};

	self.performTabSwitch = function(aCircleGesture) {
		if (aCircleGesture.normal[Z] <= 0) {
			self.tabNext();
		} else {
			self.tabPrevious();
		}

		self.lastTabSwitchStamp = aCircleGesture.duration;
	};

	self.performNavigation = function(aSwipeGesture) {
		if (aSwipeGesture.direction[X] > 0) {
			self.executeScript("history.forward();");
		} else {
			self.executeScript("history.back();");
		}
	};

	self.checkSwipe = function(aGesture) {
		if (aGesture.state == "start") {
			self.performNavigation(aGesture);
		}
	};

	self.checkGestures = function(gestures) {
		gestures.forEach(function(aGesture) {
			if (aGesture.type == "circle" && self.config.enableCircleGestures) {
				self.checkCircle(aGesture);
			} else if (aGesture.type == "swipe" && self.config.enableSwipeGestures) {
				self.checkSwipe(aGesture);
			}
		});
	};

	self.triggerStatusUpdate = function() {
		self.trigger("connectionStatusUpdated", self.connected);
	};

	self.initController = function() {
		self.leapController = new Leap.Controller({
			enableGestures : true
		});

		self.leapController.on("connect", function() {
			self.connected = true;
			self.triggerStatusUpdate();
		});

		self.leapController.on("disconnect", function() {
			self.connected = false;
			self.triggerStatusUpdate();
		});

		self.leapController.connect();

		self.leapController.on("frame", function(frame) {

			if (self.lastTimestamp == undefined)
				self.lastTimestamp = frame.timestamp;
			self.currentFrame = frame;

			if (self.elapsedSeconds() > self.config.minUpdateInterval) {

				if (frame.hands.length > 0) {
					self.checkScroll(frame.hands[0]);
				}

				self.checkGestures(frame.gestures);

				self.lastTimestamp = frame.timestamp;
			}
		});

	};

	self.connect = function() {
		self.leapController.connect();
	};

	self.disconnect = function() {
		self.leapController.disconnect();
	};

	self.restartController = function() {
		if (self.leapController) {
			self.leapController.once("disconnect", function() {
				self.connect();
			});
			self.disconnect();
		} else {
			self.initController();
		}
	};
	


	self.reloadConfiguration(function() {
		self.restartController();
	});

})(Leap);
