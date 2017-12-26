% import notes

% include("header", title="Notes")

<h2>Liste des blocs-notes</h2>
<div class="list-group">
  % for note in notes.get_list():
    % datestring = note['mtime'].strftime('%d.%m.%Y à %H:%M:%S')
    <a class="list-group-item" href="/n/{{note['name']}}">
      <h4 class="list-group-item-heading">{{note['name']}}</h4>
      <p class="list-group-item-text">
        Dernière modification le {{datestring}}
      </p>
    </a>
  % end
</div>

% include("footer")
