from pathlib import Path
from os import path
from datetime import datetime

#FIXME
notes_dir = Path(__file__).parent / 'notes'
#notes_dir = path.join(path.abspath(path.dirname(__file__)), 'notes')
 

def list():
    for note in notes_dir.iterdir():
        yield {
            'name': "".join(note.name.split('.')[:-1]),
            'mtime': datetime.fromtimestamp(note.stat().st_mtime)
        }
        
def get_content(name):
    note_path = notes_dir / (name + '.md')
    if not note_path.is_file():
        return None
    with note_path.open(encoding='utf8') as f:
        return f.read()
        
def put_content(name, content):
    note_path = notes_dir / (name + '.md')
    with note_path.open('w', encoding='utf8') as f:
        return f.write(content)