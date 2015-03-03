% include("header", title="edit")

<div ng-app="notepy" ng-controller="noteController as noteCtrl">
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.4/angular.js"></script>
<script>
(function(){
var app = angular.module('notepy', []);

app.controller('noteController', ['$http', '$timeout', function($http, $timeout) {
% #may be dangerous ?
	this.note_name = '{{note_name}}';
	this.content = "";
	this.isSaving = false;
	this.dirty = false;
	this.lastSaved = Date.now();
	
	var _noteContent;
	var _oldScrollHeight;
	this.updateScrollHeight = function() {
		if (!_noteContent)
			_noteContent = $('#note_content');
		var elem = _noteContent;

		// ugly but works well
		/*elem.height("0px");
		elem.height(elem.prop('scrollHeight'));
		return;*/

		// Optimized but buggy
		if (_oldScrollHeight != elem.prop('scrollHeight')) {
			elem.height("0px");
			elem.height(elem.prop('scrollHeight'));
			_oldScrollHeight = elem.prop('scrollHeight');
		}
	}

	var timeout = null;
	
	var noteCtrl = this;
	
	$http.get('/api/notes/'+this.note_name+'/get').success(function(data) {
		noteCtrl.content = data.note_content;
		//console.log(noteCtrl.content);
	});
	
	this.save = function() {
		noteCtrl.cancelSave();
		noteCtrl.isSaving = true;
		$http.post('/api/notes/{{note_name}}/put', 
			$.param({note_content: noteCtrl.content}))
			.success(function() {
				noteCtrl.isSaving = false;
				noteCtrl.dirty = false;
				console.log("sauvegarde réussie");
			});
	}
	
	this.deferSave = function() {
		noteCtrl.dirty = true;
		noteCtrl.cancelSave();
		timeout = $timeout(function() {noteCtrl.save()}, 3000); 
	}
	
	this.cancelSave = function() {
		if (timeout) {
			$timeout.cancel(timeout);
		}
	}
}]);

})();
</script>
<form ng-include="'/static/angular/note-edit-form.html'" id="note_edit_form">

</form>
% include("footer")
