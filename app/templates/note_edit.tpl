% from helpers import webpack_scripts

% include("header", title=note_name)

<div style="display: none;" class="json-data">{{json_data}}</div>

<h2 class="topbar">
  <span class="title">{{note_name}}</span>
  <div class="btn-toolbar">
    <a href="/t/{{note_name}}" class="btn btn-default">
      <span class="glyphicon glyphicon-pushpin"></span> Todo mode
    </a>

    <button class="btn btn-primary" onclick="noteApp.save()">
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

% for script in webpack_scripts('note_edit'):
  <script src="{{script}}"></script>
% end

% include("footer")
