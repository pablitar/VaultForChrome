(function(Leap){
	var self = window.vault = {};
	var defaultConfig = {
		speed : 700,
		xCalibration : 0.0,
		yCalibration : -0.4,
		minUpdateInterval : 0.017
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
		
		var speedFactorX = Math.pow(Math.abs(x) + 1, 4)
		var speedFactorY = Math.pow(Math.abs(y) + 1, 4)
		
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
	
	self.reloadConfiguration(function(){
		Leap.loop(function(frame){
		
			if(self.lastTimestamp == undefined) self.lastTimestamp = frame.timestamp;
			self.currentFrame = frame;
        
			if(self.elapsedSeconds() > self.config.minUpdateInterval) {

				if(frame.hands.length > 0) {
					self.checkScroll(frame.hands[0]);
				}
				self.lastTimestamp = frame.timestamp;			
			}
		});
	});
    
    
})(Leap);