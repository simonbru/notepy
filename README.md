# Notepy
Online notepad and todolist following the KISS philosophy.
Notes and todo lists are stored as text files, todolist follow [Todo.txt](http://todotxt.org/) conventions.

## Setup

```
pipenv install
yarn install
yarn build
cp app/config.py.sample app/config.py
```

Edit `app/config.py` to configure the app.
Make sure that `NOTES_DIR` exists and is writable.

# Run
Start the server with `pipenv run app/app.py`

# Development

Run `yarn watch` to compile JS files anytime they change.

Set `DEVMODE = True` in `config.py` for verbose errors and auto-reloading.

# Limitations
* UI only available in French
* Partial support for Todo.txt conventions
* Password hash stored in configuration file
