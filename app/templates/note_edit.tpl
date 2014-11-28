% include("header", title="edit")

<h1>Édition - {{note_name}}</h1>
<div ng-app="notepy" ng-controller="noteController as noteCtrl">
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.4/angular.js"></script>
<script>
(function(){
var app = angular.module('notepy', []);

app.controller('noteController', function() {
	this.content = "";
});

})();
</script>
<form ng-include="'/static/angular/note-edit-form.html'">

</form>
% include("footer")
