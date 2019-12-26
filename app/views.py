import functools
import hmac
import re
from crypt import crypt
from wsgiref.handlers import format_date_time

import arrow
import bottle
import json
from bottle import request, redirect, response, SimpleTemplate

import config as conf
import notes


class TemplateAdapter(SimpleTemplate):
    """Inject some variables into every template context"""
    defaults = {
        'debug': conf.DEVMODE,
        'request': request,
    }


template_view = functools.partial(bottle.view, template_adapter=TemplateAdapter)


@template_view('login')
def login():
    s = request.environ.get('beaker.session')
    vars = {}
    if request.method == 'POST':
        challenge_hash = crypt(request.forms.password, salt=conf.PASSWORD)
        correct_hash = conf.PASSWORD.encode()
        if not hmac.compare_digest(challenge_hash, correct_hash):
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


@template_view('auth_error')
def auth_error(err):
    return {}


@template_view('notes')
def view_notes():
    notelist = list(notes.get_list())
    for note in notelist:
        note['pretty_mtime'] = note['mtime'].to('local').strftime(
            '%d.%m.%Y à %H:%M:%S'
        )
    return {
        'notes': notelist
    }


@template_view('note_edit')
def note_edit(note_name):
    note = notes.get_note(note_name)
    json_data = {
        'noteName': note_name,
    }
    vars = {
        'note_name': note_name,
        'note_content': note.get('content') if note else '',
        'json_data': json.dumps(json_data),
    }
    return vars


@template_view('todo_edit')
def todo_edit(note_name):
    vars = {'note_name': note_name}
    note = notes.get_note(note_name)
    vars['items'] = []
    if note:
        for line in note['content'].split('\n'):
            item = {}
            item['complete'] = line.startswith('x ')
            # Remove e.g. 'x 2015-02-02 '
            item['text'] = re.sub(r'^x \d{4}-\d{2}-\d{2} ', '', line)
            vars['items'].append(item)
    vars['json_data'] = json.dumps({
        'noteName': note_name,
    })
    return vars


def note_post(note_name):
    """
    Overwrite note `note_name` with content from `note_content` param.

    If `last_version` param is present, check that
    the note to be overwrited is on the same version on the client
    and the server. `last_version` must be a date in ISO 8601 format.
    """
    client_mtime_string = request.forms.get('last_version')
    note = notes.get_note(note_name, meta_only=True)
    if client_mtime_string and note:
        client_mtime = arrow.get(client_mtime_string)
        server_mtime = note['mtime']
        delta = abs(client_mtime - server_mtime).total_seconds()
        if delta < 10:
            notes.put_content(note_name, request.forms.note_content)
        else:
            response.status = "409 Conflict"
    else:
        notes.put_content(note_name, request.forms.note_content)

    current_mtime = notes.get_note(note_name, meta_only=True)['mtime']
    response.add_header(
        'Last-Modified',
        format_date_time(current_mtime.timestamp)
    )


def note_get(note_name):
    note = notes.get_note(note_name) or {}
    mtime = note.get('mtime') or arrow.now()

    response.add_header(
        'Last-Modified',
        format_date_time(mtime.timestamp)
    )
    response.add_header('Cache-Control', 'no-cache')
    return {
        'note_content': note.get('content')
    }


def note_head(note_name):
    note = notes.get_note(note_name, meta_only=True) or {}
    mtime = note.get('mtime') or arrow.now()

    response.add_header(
        'Last-Modified',
        format_date_time(mtime.timestamp)
    )
    response.add_header('Cache-Control', 'no-cache')
