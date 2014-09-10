% import notes

% include("header", title="Notes")

<h1>Liste des blocs-notes</h1>
<div class="list-group">
    % for note in notes.list():
    % datestring = note['mtime'].strftime('%d.%m.%Y � %H:%M:%S')
    <a class="list-group-item" href="/n/{{note['name']}}">
        <h4 class="list-group-item-heading">{{note['name']}}</h4>
        <p class="list-group-item-text">Derni�re modification le {{datestring}}</p>
    </a>
    % end
</div>
% include("footer")
