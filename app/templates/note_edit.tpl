% include("header", title="edit")

<h1>Édition - {{note_name}}</h1>
<button class="btn btn-primary" onclick="save()">Sauvegarder</button>
<br><br>
<textarea class="form-control" id="note_content">{{note_content}}</textarea>
<script type="text/javascript" src="/static/note_edit.js"></script>
<script type="text/javascript">
document.addEventListener("DOMContentLoaded", function(event) {
	window.note = new Note("{{note_name}}");
});
</script>
% include("footer")
