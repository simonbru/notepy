from bottle import view, request, error, redirect

import notes
import config as conf

@view('login')
def login():
    s = request.environ.get('beaker.session')
    vars = {}
    if request.method == 'POST':
        if request.forms.password != conf.PASSWORD:
            print("Auth error")
            vars['error_msg'] = 'Mauvais mot de passe'
            return vars
        else:
            s['auth'] = True
            redirect('/n/')
    return vars

def logout():
    s = request.environ.get('beaker.session')
    s.delete()
    redirect('/login')

@view('auth_error')
def auth_error(err):
    return {}

@view('notes')
def view_notes():
    return {}
    
def _common_edit(note_name):
    vars = {'note_name': note_name}
    vars['note_content'] = notes.get_content(note_name) or ''
    return vars

note_edit = view('note_edit')(_common_edit)
todo_edit = view('todo_edit')(_common_edit)


def note_post(note_name):
    #import time; time.sleep(5)
    notes.put_content(note_name, request.forms.note_content)

def note_get(note_name):
    #import time; time.sleep(5)
    return {'note_content': notes.get_content(note_name)}
