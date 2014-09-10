#!/usr/bin/env python3

from os import path

from bottle import Bottle, run, view, static_file, abort, redirect, request, response, TEMPLATE_PATH
from beaker.middleware import SessionMiddleware

import views as v

current_dir = path.abspath(path.dirname(__file__))

# Init bottle app
TEMPLATE_PATH.append(path.join(current_dir, 'templates/'))
app = Bottle()


# Set middlewares
session_opts = {
    'session.type': 'file',
    'session.data_dir': path.join(current_dir, 'session'),
    'session.auto': True
}
app_middleware = SessionMiddleware(app, session_opts)

class StripPathMiddleware(object):
  def __init__(self, app):
    self.app = app
  def __call__(self, e, h):
    e['PATH_INFO'] = e['PATH_INFO'].rstrip('/')
    return self.app(e,h)
    
app_middleware = StripPathMiddleware(app_middleware)


# Set authorization hook
@app.hook('before_request')
def auth_check():
    s = request.environ.get('beaker.session')
    auth = s.get('auth')
    if auth == True:
        return
    s['auth'] = False
    if not request.urlparts.path.startswith(('/login','/static')):
        abort(401)


# Routes
app.error(401)(v.auth_error)
app.get('/login')(v.login)
app.post('/login')(v.login)
app.get('/logout')(v.logout)

@app.route('/')
def index():
    redirect('/login')

@app.route('/static/<filepath:path>')
def static_route(filepath):
    static_path = path.join(current_dir, 'static/')
    return static_file(filepath, root=static_path)


if __name__ == '__main__':
    run(app=app_middleware, host='0.0.0.0', port=8080, debug=True, reloader=True)
