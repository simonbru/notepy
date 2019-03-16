% include("header", title="Connexion", view_name="login")

% if defined('error_msg'):
  <div class="alert alert-danger">{{error_msg}}</div>
% end

<form action="/login" method="post" class="form-signin">
  <h2>Connexion</h2>
  <input
    type="password"
    placeholder="Mot de passe"
    name="password"
    class="form-control"
    required
    autofocus
  />
  <button type="submit" class="btn btn-lg btn-primary btn-block">
    Se connecter
  </button>
</form>

% include("footer", view_name="login")
