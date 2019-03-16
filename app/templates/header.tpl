% from helpers import webpack_styles
% session = request.environ.get('beaker.session')

<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, user-scalable=no"
    />
    <title>{{title}} - Notepy</title>
    <link rel="shortcut icon" href="/static/favicon.png" type="image/png" />

    % for css_url in webpack_styles(get('view_name', 'common')):
      <link href="{{css_url}}" rel="stylesheet">
    % end

  </head>
  <body>
    % if session['auth'] == True:
      <div class="navbar navbar-inverse" role="navigation">
        <div class="container">
          <div class="navbar-header">
            <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
              <span class="sr-only">Toggle navigation</span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
              <span class="icon-bar"></span>
            </button>
            <a class="navbar-brand" href="/">Notepy</a>
          </div>
          <div class="collapse navbar-collapse">
            <ul class="nav navbar-nav">
              %links = [
              %  ('/n/', 'Bloc-notes')
              %]
              %for url, name in links:
              %  if request.urlparts.path.startswith(url):
                <li class="active">
              %  else:
                <li>
              %  end
                <a href="{{url}}">{{name}}</a></li>
              %end
            </ul>
            <ul class="nav navbar-nav navbar-right">
              <li class="navbar-right">
                <a href="/logout">Se déconnecter</a>
              </li>
            </ul>
          </div><!--/.nav-collapse -->
        </div>
      </div>
    % end
    <div class="container">
