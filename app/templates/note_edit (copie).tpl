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
	var noteCtrl = this;
	
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

		// More optimized but buggy
		if (_oldScrollHeight != elem.prop('scrollHeight')) {
			elem.height("0px");
			elem.height(elem.prop('scrollHeight'));
			_oldScrollHeight = elem.prop('scrollHeight');
		}
	}
	

	
	$http.get('/api/notes/'+this.note_name+'/get')
	.success(function(data) {
		if (data.note_content.length == 0)
			return;
		noteCtrl.content = data.note_content;
		//console.log(noteCtrl.content);
		
		// Wait for noteContent to be actually loaded (hack)
		var wait = function() {
			var noteContent = $('#note_content');
			if (noteContent.length > 0 && noteContent.val().length > 0) {
				noteCtrl.updateScrollHeight();
				//console.log("loaded");
			} else {
				//console.log("wait");
				$timeout(wait, 50);
			}
		};
		wait();
	});
	
	
	this.save = function() {
		noteCtrl.cancelSave();
		noteCtrl.isSaving = true;
		$http.post('/api/notes/{{note_name}}/put', 
			$.param({note_content: noteCtrl.content}))
			.success(function() {
				noteCtrl.dirty = false;
				noteCtrl.isSaving = false;
				console.log("sauvegarde réussie");
			})
			.error(function(e) {
				noteCtrl.isSaving = false;
				alert("Erreur lors de la sauvergarde: "+e);
				console.log(e);
			});

	}
	
	var timeout = null;
	this.deferSave = function() {
		noteCtrl.dirty = true;
		noteCtrl.cancelSave();
		timeout = $timeout(function() {noteCtrl.save()}, 1500); 
	}
	
	this.cancelSave = function() {
		if (timeout) {
			$timeout.cancel(timeout);
		}
	}
	
	$(window).bind('keydown', function(event) {
		if (event.ctrlKey || event.metaKey) {
			switch (String.fromCharCode(event.which).toLowerCase()) {
			case 's':
				event.preventDefault();
				noteCtrl.save();
				break;
			}
		}
	});
	
	window.onbeforeunload = function (event) {
	  if (!noteCtrl.dirty) 
		return;
		
	  var message = 'Il y a des modifications non sauvegardées.';
	  if (typeof event == 'undefined') {
		event = window.event;
	  }
	  if (event) {
		event.returnValue = message;
	  }
	  return message;
	}
}]);

})();
</script>
<form ng-include="'/static/angular/note-edit-form.html'" id="note_edit_form">

</form>
% include("footer")
