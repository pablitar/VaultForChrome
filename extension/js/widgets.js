(function() {
	var self = window.widgets = {};
	
	var jQueryied = function(element) {
		if (!( element instanceof jQuery)) {
			element = $(element);
		}
		
		return element;
	};
	
	var defaultWidgetConstructor = function(widget, $element, options) {
		widget.$element = $element;
		$.extend(widget, options);	
	};

	self.ToggleWidget = function($element, options) {
		defaultWidgetConstructor(this, $element, options);
		
		var widget = this;
		$element.click(function() {
			widget.performAction();
		});
	};

	self.ToggleWidget.prototype = {
		refreshValue : function() {
			this.$element.text(this.value() ? this.enabledText : this.disabledText);
		},

		performAction : function() {
			if (this.value()) {
				this.whenEnabled();
			} else {
				this.whenDisabled();
			}
		}
	};
	
	self.StatusDisplay = function($element, options) {
		defaultWidgetConstructor(this, $element, options);
	};
	
	self.StatusDisplay.prototype = {
		refreshValue : function() {
			var value = this.value();
			this.$element.text(utils.capitalize(value));
			var widget = this;
			this.values.forEach(function(aValue) {
				widget.$element.removeClass(aValue);
			});
			
			this.$element.addClass(value);
		}
	};
	
	self.createStatusDisplay = function($element, options) {
		return new self.StatusDisplay(jQueryied($element), options);
	};

	self.createToggle = function($element, options) {
		return new self.ToggleWidget(jQueryied($element), options);
	};

})();
