Selectize.define('fast_click', function(options) {
	var self = this;

	this.render = (function() {
		var original = self.render;
		return function(templateName, data) {
			var html = original.apply(this, arguments);
			var $output = $(html).addClass('needsclick');
			return $output.get(0).outerHTML;
		};
	})();

});
