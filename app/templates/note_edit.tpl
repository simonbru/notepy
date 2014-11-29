% include("header", title="edit")

<h1>Édition - {{note_name}}</h1>
<div ng-app="notepy" ng-controller="noteController as noteCtrl">
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.4/angular.js"></script>
<script>
(function(){
var app = angular.module('notepy', []);

app.controller('noteController', ['$http', '$timeout', function($http, $timeout) {
	this.content = "";
	this.isSaving = false;
	this.dirty = false;
	this.lastSaved = Date.now();
	
	var timeout = null;
	
	var noteCtrl = this;
	
	$http.get('/api/notes/{{note_name}}/get').success(function(data) {
		noteCtrl.content = data.note_content;
		console.log(noteCtrl.content);
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
<form ng-include="'/static/angular/note-edit-form.html'">

</form>
% include("footer")
