(function(){
	var self = window.behaviours = {};
	
	var callOn$ = function(object, method, args) {
		var $obj = $(object);
		$obj[method].apply($obj, args); 
	};
	
	self.Events = {};
	
	["on", "one", "off", "trigger"].forEach(function(method){
		self.Events[method] = function() {
			callOn$(this, method, arguments);
		};
	});
	
})();
