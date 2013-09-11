(function(Leap){


	var speed = 700;
	var lastTimestamp;
	var currentFrame;
    
    var xCalibration = 0.0
    
    var yCalibration = -0.4
	
	var minUpdateInterval = 0.017;

    var performScroll = function(aHand) {
        
        var x = -aHand.palmNormal[0] + xCalibration;
        var y = -aHand.palmNormal[2] + yCalibration;
		
		var speedFactorX = Math.pow(Math.abs(x) + 1, 4)
		var speedFactorY = Math.pow(Math.abs(y) + 1, 4)
		
		var delta = speed * elapsedSeconds();
        
        chrome.tabs.executeScript({code:"window.scrollBy(" + x * speedFactorX * delta + ", " + y * speedFactorY * delta + ");"});
    };
    
    var checkScroll = function(aHand) {
         if(aHand.fingers.length >= 4) {
            performScroll(aHand);
         }
    };
	
	var elapsedSeconds = function() {
		return (currentFrame.timestamp - lastTimestamp) / 1000000
	}
    
    Leap.loop(function(frame){
		
		if(lastTimestamp == undefined) lastTimestamp = frame.timestamp;
		currentFrame = frame;
        
		if(elapsedSeconds() > minUpdateInterval) {

			if(frame.hands.length > 0) {
				checkScroll(frame.hands[0]);
			}
			lastTimestamp = frame.timestamp;			
		}
    });
})(Leap);