import re
from crypt import crypt

from bottle import view, request, redirect

import config as conf
import notes


@view('login')
def login():
    s = request.environ.get('beaker.session')
    vars = {}
    if request.method == 'POST':
        challenge_pass = crypt(request.forms.password, salt=conf.PASSWORD)
        if challenge_pass != conf.PASSWORD:
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


@view('note_edit')
def note_edit(note_name):
    vars = {'note_name': note_name}
    vars['note_content'] = notes.get_content(note_name) or ''
    return vars


@view('todo_edit')
def todo_edit(note_name):
    vars = {'note_name': note_name}
    note_content = notes.get_content(note_name) or ''
    vars['items'] = []
    for line in note_content.split('\n'):
        item = {}
        item['complete'] = line.startswith('x ')
        # Remove e.g. 'x 2015-02-02 '
        item['text'] = re.sub(r'^x \d{4}-\d{2}-\d{2} ', '', line)
        vars['items'].append(item)
    return vars


def note_post(note_name):
    #import time; time.sleep(5)
    notes.put_content(note_name, request.forms.note_content)


def note_get(note_name):
    #import time; time.sleep(5)
    return {'note_content': notes.get_content(note_name)}
