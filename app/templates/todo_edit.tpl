% include("header", title="Todo")
% import re
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
<div id="todo_app">
    <br>
    <div class="list-group">
        % for line in note_content.split('\n'):
        % icon = 'check' if line.startswith('x ') else 'unchecked'
        % item = re.sub(r'x \d{4}-\d{2}-\d{2} ', '', line)
        <li class="list-group-item todo-item">
            <span class="glyphicon-{{icon}} glyphicon item-checkbox"></span>
            <p>{{item}}</p>
        </li>
        % end
    </div>
</div>
<button class="btn btn-primary" onclick="todoApp.newTask()">
    <span class="glyphicon glyphicon-plus"></span> Nouvelle tâche
</button>
% if conf.DEVMODE:
<script src="/static/react-with-addons.js"></script>
<script src="/static/react-dom.js"></script>
% else:
<script src="/static/react-with-addons.min.js"></script>
<script src="/static/react-dom.min.js"></script>
% end

<script src="/static/todotxt.js"></script>
<script src="/static/todo_edit.js"></script>
% include("footer")
