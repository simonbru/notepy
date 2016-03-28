% include("header", title="Todo")
% import config as conf

<div>

<script>
% #may be dangerous ?
window.note_name = '{{note_name}}';
</script>
<h2>{{note_name}}
    <div class="btn-toolbar pull-right">
        <button class="btn btn-primary" onclick="todoApp.newTask()">
            <span class="glyphicon glyphicon-plus"></span> Nouvelle tâche
        </button>
        <button class="btn btn-primary" onclick="todoApp.save()">
            <span class="glyphicon glyphicon-floppy-disk"></span> Sauvegarder
        </button>
    </div>
</h2>
<div id="todo_app"></div>
<button class="btn btn-primary" onclick="todoApp.newTask()">
    <span class="glyphicon glyphicon-plus"></span> Nouvelle tâche
</button>
% if conf.DEVMODE:
<script src="/static/react-with-addons.js"></script>
<script src="/static/react-dom.js"></script>
% else:
<script src="/static/react-with-addons.min.js"></script>
<script src="/static/react-dom.min.js"></script>
%end

<script src="/static/todotxt.js"></script>
<script src="/static/todo_edit.js"></script>
% include("footer")
