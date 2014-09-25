function Note(notename) {
	// Bindings
	this._nodeNote = $('#note_content');
	
	this._jqxhr = null;
	this._timeout = null;
	this.last_save = new Date();
	this.last_content = this._nodeNote.val();
}

function save() {
	$.post('/api/notes/{{note_name}}/put', {
			note_content: $('textarea').val()
		}, 
		function() {console.log("Sauvegarde réussie")}
	);
}
