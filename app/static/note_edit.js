function Note(notename) {
	// Bind to the DOM elements
	this._nodeNote = $('#note_content');
	
	// Properties
	this._jqxhr = null;
	this._timeout = null;
	this.last_save = new Date();
	this.last_content = this._nodeNote.val();
	
	// Create events
	var $this = this;
	this._nodeNote.bind("input cut paste", function(e) {
		if (!$this.has_changed()) return;
		console.log("change: ", $this.has_changed(), e);
	});
}

Note.prototype.current_content = function() {
	return this._nodeNote.val();
}

Note.prototype.has_changed = function() {
	//debugger;
	return this.last_content != this.current_content();
}


// Old test function
function save() {
	$.post('/api/notes/{{note_name}}/put', {
			note_content: $('textarea').val()
		}, 
		function() {console.log("Sauvegarde réussie")}
	);
}
