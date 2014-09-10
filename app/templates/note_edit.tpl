% import notes

% include("header", title="edit")

<h1>Edition - {{note_name}}</h1>
<pre contenteditable>
    {{notes.get_content(note_name)}}
</pre>
% include("footer")
