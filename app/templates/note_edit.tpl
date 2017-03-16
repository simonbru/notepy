% include("header", title="edit")
% import config as conf


<script>
  % #may be dangerous ?
  window.note_name = '{{note_name}}';
</script>

<h2>
  {{note_name}}

  <div class="pull-right">
    <a href="/t/{{note_name}}" class="btn btn-default">
      <span class="glyphicon glyphicon-pushpin"></span> Todo mode
    </a>

    <button class="btn btn-primary" onclick="todoApp.save()">
      <span class="glyphicon glyphicon-floppy-disk"></span> Sauvegarder
    </button>
  </div>
</h2>

<div id="note_app">
  <!-- To be replaced by React component -->
  <form id="note_edit_form">
    <br>
    <textarea
      class="form-control"
      id="note_content"
      rows="{{note_content.count('\n') + 1}}"
      disabled
    >{{note_content}}</textarea>
  </form>
</div>

% if conf.DEVMODE:
  <script src="/static/react/react-with-addons.js"></script>
  <script src="/static/react-dom/react-dom.js"></script>
% else:
  <script src="/static/react/react-with-addons.min.js"></script>
  <script src="/static/react-dom/react-dom.min.js"></script>
%end

<script src="/static/note_edit.js"></script>

% include("footer")
