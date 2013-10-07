if(typeof window.vault === "undefined") {
	window.vault = {};
}

window.vault.background = chrome.extension.getBackgroundPage().vault;
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
	};
		
	self.bindSlider = function(sliderId, configParameterName, adapter) {
		if(!adapter) adapter = idAdapter;
		var slider = document.getElementById(sliderId);
		
		slider.value = adapter.adaptFromConfig(vault.background.config[configParameterName]);
		
		slider.addEventListener("change", function(ev) {
			self.setConfigParameter(configParameterName, adapter.adaptToConfig(ev.target.value));
		});
	};
	
	self.bindCheckbox = function(checkboxId, configParameterName) {
		var checkbox = document.getElementById(checkboxId);
		
		checkbox.checked = vault.background.config[configParameterName];
		
		checkbox.addEventListener("change", function(ev) {
			self.setConfigParameter(configParameterName, ev.target.checked);
		});
	};
	
	self.setConfigParameter = function(name, value, callback) {
		var param = {};
		param[name] = value;
		chrome.storage.sync.set(param, function() {
			vault.background.reloadConfiguration();
			if(typeof callback === "function") callback();
		});
	};
	
	self.configureStatusWidget = function() {
		self.statusToggle = widgets.createToggle($("#toggle-status"), {
			value: function() {
				return vault.background.isConnected();		
			},
			whenEnabled: function() {
				vault.background.disconnect();
			},
			whenDisabled: function() {
				vault.background.connect();
			},
			enabledText: "Disconnect",
			disabledText: "Connect"
		});
		
		self.statusDisplay = widgets.createStatusDisplay($("#status"), {
			value: function() {
				return vault.background.isConnected()?"connected":"disconnected";
			},
			//TODO: This is ugly
			values: ["connected", "disconnected"]
		});
		
		var refreshValues = function() {
			self.statusToggle.refreshValue();
			self.statusDisplay.refreshValue();
		};
		
		vault.background.on("connectionStatusUpdated", refreshValues);
		
		refreshValues();
	};

	vault.background.reloadConfiguration(function(){
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
		
		self.bindCheckbox("enable-vertical-scroll", "enableVerticalScroll");
		self.bindCheckbox("enable-horizontal-scroll", "enableHorizontalScroll");
		
		self.bindCheckbox("invert-vertical-scroll", "invertVerticalScroll");
		self.bindCheckbox("invert-horizontal-scroll", "invertHorizontalScroll");
		
		self.bindCheckbox("enable-circle-gestures", "enableCircleGestures");
		
		self.bindSlider("tab-switch-interval", "tabSwitchInterval", floatAdapter);
		
		self.bindCheckbox("enable-swipe-gestures", "enableSwipeGestures");
		self.configureStatusWidget();
	});

})();