% include("header", title="Notes")

<h2>Liste des blocs-notes</h2>
<div class="list-group">
  % for note in notes:
    <a class="list-group-item" href="/n/{{note['name']}}">
      <h4 class="list-group-item-heading">{{note['name']}}</h4>
      <p class="list-group-item-text">
        Dernière modification le {{note['pretty_mtime']}}
      </p>
    </a>
  % end
</div>

% include("footer")
