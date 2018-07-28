% include("header", title=note_name)


<div style="display: none;" class="json-data">{{json_data}}</div>

<h2 class="topbar">
  <span class="title">{{note_name}}</span>
  <div class="btn-toolbar">
    <button class="btn btn-primary" onclick="todoApp.newTask()">
      <span class="glyphicon glyphicon-plus"></span> Nouvelle tâche
    </button>
    <button class="btn btn-primary" onclick="todoApp.save()">
      <span class="glyphicon glyphicon-floppy-disk"></span> Sauvegarder
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

<button class="btn btn-primary" onclick="todoApp.newTask()">
  <span class="glyphicon glyphicon-plus"></span> Nouvelle tâche
</button>

% if debug:
  <script src="/static/react/react.development.js"></script>
  <script src="/static/react-dom/react-dom.development.js"></script>
  <script src="/static/sortablejs/Sortable.js"></script>
% else:
  <script src="/static/react/react.production.min.js"></script>
  <script src="/static/react-dom/react-dom.production.min.js"></script>
  <script src="/static/sortablejs/Sortable.min.js"></script>
%end

<script src="/static/todotxt.js"></script>
<script src="/static/todo_edit.js"></script>

% include("footer")
