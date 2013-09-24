window.vault = chrome.extension.getBackgroundPage().vault;
(function() {
	var self = {};
	
	var idAdapter = {
		adaptFromConfig : function(configValue) {
			return configValue;
		},
		
		adaptToConfig : function(sliderValue) {
			return sliderValue;
		}
	};
	
	var floatAdapter = {
		adaptFromConfig : idAdapter.adaptFromConfig,
		adaptToConfig : function(sliderValue) {
			return parseFloat(sliderValue);
		}
	}
		
	self.bindSlider = function(sliderId, configParameterName, adapter) {
		if(!adapter) adapter = idAdapter;
		var slider = document.getElementById(sliderId);
		
		slider.value = adapter.adaptFromConfig(vault.config[configParameterName]);
		
		slider.addEventListener("change", function(ev) {
			self.setConfigParameter(configParameterName, adapter.adaptToConfig(ev.target.value));
		});
	};
	
	self.setConfigParameter = function(name, value, callback) {
		var param = {};
		param[name] = value;
		chrome.storage.sync.set(param, function() {
			vault.reloadConfiguration();
			if(typeof callback === "function") callback();
		});
	};

	vault.reloadConfiguration(function(){
		self.bindSlider("sensitivity", "speed", floatAdapter);
		self.bindSlider("refresh-rate", "minUpdateInterval", {
			adaptFromConfig: function(updateInterval) {
				return 1 / updateInterval;
			},
			
			adaptToConfig: function(refreshRate) {
				return 1 / refreshRate;
			}
		});
		
		self.bindSlider("vertical-bias", "yCalibration", floatAdapter);
	});

})();