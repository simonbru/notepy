from bottle import view, request, error, redirect


@view('login')
def login():
    s = request.environ.get('beaker.session')
    vars = {}
    if request.method == 'POST':
        if request.forms.password != 'testtest':
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
def notes():
    return {}
    
@view('note_edit')
def note_edit(note_name):
    return {'note_name': note_name}
