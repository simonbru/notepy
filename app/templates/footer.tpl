% from helpers import webpack_scripts

    </div>
    % for script_url in webpack_scripts(entrypoint=get('view_name', 'common')):
      <script src="{{script_url}}"></script>
    % end
  </body>
</html>
