% include("header", title="edit")

<h1>Édition - {{note_name}}</h1>
<button class="btn btn-primary" onclick="save()">Sauvegarder</button>
<br><br>
<textarea class="form-control">{{note_content}}</textarea>
<script>
function save() {
    $.post('/api/notes/{{note_name}}/put', {
            note_content: $('textarea').val()
        }, 
        function() {console.log("Sauvegarde réussie")}
    );
}
</script>
% include("footer")
