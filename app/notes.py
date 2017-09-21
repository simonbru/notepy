from datetime import datetime
from pathlib import Path

from config import NOTES_DIR

notes_dir = Path(NOTES_DIR)


def list():
    for note in sorted(notes_dir.glob("*.md")):
        yield {
            'name': "".join(note.name.split('.')[:-1]),
            'mtime': datetime.fromtimestamp(note.stat().st_mtime)
        }


def get_note(name, meta_only=False):
    note_path = notes_dir / (name + '.md')
    if not note_path.is_file():
        return None
    mtime = datetime.fromtimestamp(note_path.stat().st_mtime)
    note = {
        'name': name,
        'mtime': mtime,
    }
    if not meta_only:
        with note_path.open(encoding='utf8') as f:
            note['content'] = f.read()
    return note


def put_content(name, content):
    note_path = notes_dir / (name + '.md')
    with note_path.open('w', encoding='utf8') as f:
        return f.write(content)
