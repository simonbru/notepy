% include("header", title="edit")

<div style="display: none;" class="json-data">{{json_data}}</div>

<h2>
  {{note_name}}

  <div class="pull-right">
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

% if debug:
  <script src="/static/react/react.development.js"></script>
  <script src="/static/react-dom/react-dom.development.js"></script>
% else:
  <script src="/static/react/react.production.min.js"></script>
  <script src="/static/react-dom/react-dom.production.min.js"></script>
%end

<script src="/static/note_edit.js"></script>

% include("footer")
