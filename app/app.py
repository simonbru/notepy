#!/usr/bin/env python3

from os import path, umask

import bottle
from bottle import (
    Bottle,
    TEMPLATE_PATH,
    abort,
    redirect,
    request,
    run,
    static_file,
)
from beaker.middleware import SessionMiddleware

import views as v
import config as conf

current_dir = path.abspath(path.dirname(__file__))
umask(0o002)

# Init bottle app
TEMPLATE_PATH.append(path.join(current_dir, 'templates/'))
app = Bottle()
application = app

# Set middlewares
session_opts = {
    'session.type': 'file',
    'session.data_dir': conf.SESSION_DIR,
    'session.cookie_expires': False,
    'session.auto': True
}
app_middleware = SessionMiddleware(app, session_opts)


class StripPathMiddleware:
    def __init__(self, app):
        self.app = app

    def __call__(self, env, h):
        env['PATH_INFO'] = env['PATH_INFO'].rstrip('/')
        return self.app(env, h)


app_middleware = StripPathMiddleware(app_middleware)


# Set authorization hook
@app.hook('before_request')
def auth_check():
    s = request.environ.get('beaker.session')
    auth = s.get('auth')
    if auth:
        return
    s['auth'] = False
    if not request.urlparts.path.startswith(('/login', '/static')):
        abort(401)


# Routes
app.error(401)(v.auth_error)
app.get('/login')(v.login)
app.post('/login')(v.login)
app.get('/logout')(v.logout)
app.get('/n')(v.view_notes)
app.get('/n/<note_name>')(v.note_edit)
app.get('/t/<note_name>')(v.todo_edit)
app.post('/api/notes/<note_name>/put')(v.note_post)
app.get('/api/notes/<note_name>/get')(v.note_get)


@app.route('/')
def index():
    redirect('/n')


@app.route('/static/<filepath:path>')
def static_route(filepath):
    static_path = path.join(current_dir, 'static/')
    return static_file(filepath, root=static_path)


# CherryPy adapter does not work anymore
class CherootServer(bottle.ServerAdapter):
    def run(self, handler):
        from cheroot.wsgi import Server
        self.options['bind_addr'] = (self.host, self.port)
        self.options['wsgi_app'] = handler

        server = Server(**self.options)

        try:
            server.start()
        finally:
            server.stop()


# Monkey-patch CherryPy server adapter
bottle.server_names['cherrypy'] = CherootServer


if __name__ == '__main__':
    run(
        app=app_middleware,
        host=conf.LISTEN_IP,
        port=conf.LISTEN_PORT,
        debug=conf.DEVMODE,
        reloader=conf.DEVMODE,
        server=conf.WSGI_SERVER,
    )
