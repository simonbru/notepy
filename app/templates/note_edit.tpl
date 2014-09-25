% include("header", title="edit")

<h1>Édition - {{note_name}}</h1>
<button class="btn btn-primary" onclick="save()">Sauvegarder</button>
<br><br>
<textarea class="form-control" id="note_content">{{note_content}}</textarea>
<script type="text/javascript" src="/static/note_edit.js"></script>
% include("footer")
