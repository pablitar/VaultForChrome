(function(Leap){
	var self = window.vault = {};
	var defaultConfig = {
		speed : 700,
		xCalibration : 0.0,
		yCalibration : -0.4,
		minUpdateInterval : 0.017,
		enableVerticalScroll : true,
		enableHorizontalScroll : true,
		tabSwitchInterval : 500000
	};
	
	self.reloadConfiguration = function(callback) {
		chrome.storage.sync.get(null, function(items) {
			self.config = $.extend({}, defaultConfig, items);
			if(typeof callback === "function") callback();
		});
	};

    self.performScroll = function(aHand) {
        
        var x = -aHand.palmNormal[0] + this.config.xCalibration;
        var y = -aHand.palmNormal[2] + this.config.yCalibration;
		
		var speedFactorX = this.config.enableHorizontalScroll?Math.pow(Math.abs(x) + 1, 4):0;
		var speedFactorY = this.config.enableVerticalScroll?Math.pow(Math.abs(y) + 1, 4):0;
		
		var delta = this.config.speed * this.elapsedSeconds();
        
        chrome.tabs.executeScript({code:"window.scrollBy(" + x * speedFactorX * delta + ", " + y * speedFactorY * delta + ");"});
    };
    
    self.checkScroll = function(aHand) {
         if(aHand.fingers.length >= 4) {
            this.performScroll(aHand);
         }
    };
	
	self.elapsedSeconds = function() {
		return (this.currentFrame.timestamp - this.lastTimestamp) / 1000000;
	};
	
	self.checkCircle = function(aCircleGesture) {
		if(self.currentCircle == undefined || self.currentCircle.id != aCircleGesture.id) {
			self.startCircleGesture(aCircleGesture);
		} else {
			self.continueCircleGesture(aCircleGesture);
		}
	};
	
	self.continueCircleGesture = function(aCircleGesture) {
		if(aCircleGesture.duration - self.lastTabSwitchStamp > self.config.tabSwitchInterval) {
			self.performTabSwitch(aCircleGesture);
		}
	};
	
	self.startCircleGesture = function(aCircleGesture) {
		self.currentCircle = aCircleGesture;
		
		self.performTabSwitch(aCircleGesture);
	};
	
	self.activateTabByIndex = function(tabIndex) {
		chrome.tabs.query({index: tabIndex}, function(tabs){
			chrome.tabs.update(tabs[0].id, {active: true});
        });
	};
	
	self.switchTab = function(indexCalculator) {
		chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
			if(tabs.length) {
				var activeTab = tabs[0];
				chrome.tabs.query({currentWindow: true}, function (moreTabs) {
					var nextIndex = (indexCalculator(activeTab.index) + moreTabs.length) % moreTabs.length;
					
					self.activateTabByIndex(nextIndex);
				});
			}
		});
	};
	
	self.tabNext = function() {
		self.switchTab(function(anIndex) {return anIndex + 1});
	};
	
	self.tabPrevious = function() {
		self.switchTab(function(anIndex) {return anIndex - 1});
	};
	
	self.performTabSwitch = function(aCircleGesture) {
		if(aCircleGesture.normal[2] <= 0) {
			self.tabNext();
		} else {
			self.tabPrevious();
		}
		
		self.lastTabSwitchStamp = aCircleGesture.duration;
	};
	
	self.checkGestures = function(gestures) {
		gestures.forEach(function(aGesture) {
			if(aGesture.type == "circle") {
				self.checkCircle(aGesture);
			}
		});
	};
	
	self.reloadConfiguration(function(){
		Leap.loop(function(frame){
		
			if(self.lastTimestamp == undefined) self.lastTimestamp = frame.timestamp;
			self.currentFrame = frame;
        
			if(self.elapsedSeconds() > self.config.minUpdateInterval) {

				if(frame.hands.length > 0) {
					self.checkScroll(frame.hands[0]);
				}
				
				self.checkGestures(frame.gestures);
				
				self.lastTimestamp = frame.timestamp;			
			}
		});
	});
    
    
})(Leap);