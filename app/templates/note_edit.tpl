% include("header", title="edit")
% import config as conf


<script>
  % #may be dangerous ?
  window.note_name = '{{note_name}}';
</script>

<h2>
  {{note_name}}
  <button class="btn btn-primary pull-right" onclick="todoApp.save()">
    <span class="glyphicon glyphicon-floppy-disk"></span> Sauvegarder
  </button>
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
  <script src="/static/react-with-addons.js"></script>
  <script src="/static/react-dom.js"></script>
% else:
  <script src="/static/react-with-addons.min.js"></script>
  <script src="/static/react-dom.min.js"></script>
%end

<script src="/static/note_edit.js"></script>

% include("footer")
