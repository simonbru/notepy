% include("header", title=note_name, view_name="todo_edit")

<div style="display: none;" class="json-data">{{json_data}}</div>

<h2 class="topbar">
  <span class="title">{{note_name}}</span>
  <div class="btn-toolbar">
    <button class="btn btn-primary" onclick="todoApp.newItem()">
      <span class="glyphicon glyphicon-plus"></span> Nouvelle tâche
    </button>
    <button class="btn btn-primary" onclick="todoApp.save()">
      <span class="glyphicon glyphicon-floppy-disk"></span> Sauvegarder
    </button>
    <button class="btn btn-primary" onclick="location.hash = '#bottom'">
      <span class="glyphicon glyphicon-arrow-down"> </span>
    </button>
  </div>
</h2>

<div id="todo_app">
  <span class="label label-warning pull-right">Chargement...</span>
  <br>
  <div class="list-group">
    % for item in items:
      % icon = 'check' if item['complete'] else 'unchecked'
      % p_class = item['complete'] and 'striked'
      <li class="list-group-item todo-item">
        <span class="drag-handle">
          <img src="/static/drag-icon.svg" alt="drag"/>
        </span><span class="glyphicon-{{icon}} glyphicon item-checkbox">
        </span><p class="{{p_class}}">{{item['text']}}</p>
      </li>
    % end
  </div>
  <span class="label label-warning pull-right">Chargement...</span>
</div>

<span id="bottom"></span>

<button class="btn btn-primary" onclick="todoApp.newItem()">
  <span class="glyphicon glyphicon-plus"></span> Nouvelle tâche
</button>

% include("footer", view_name="todo_edit")
