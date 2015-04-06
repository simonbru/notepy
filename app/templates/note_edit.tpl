% include("header", title="edit")

<div>

<script>
% #may be dangerous ?
window.note_name = '{{note_name}}';
</script>
<h2>{{note_name}}
    <button class="btn btn-primary pull-right" onclick="noteApp.save()">Sauvegarder</button>
</h2>
<div id="note_app"></div>
<script src="/static/react-with-addons.js"></script>
<script src="/static/note_edit.js"></script>
% include("footer")
