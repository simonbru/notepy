'use strict';

var TodoApp = React.createClass({
	displayName: 'TodoApp',

	mixins: [React.addons.PureRenderMixin],

	getInitialState: function getInitialState() {
		return {
			isSaving: false,
			dirty: false,
			todoList: new todotxt.TodoList()
		};
	},

	componentWillMount: function componentWillMount() {
		var _this = this;

		$.get('/api/notes/' + note_name + '/get').success(function (data) {
			window.todoList = _this.state.todoList;
			todoList.parse(data.note_content);
			if (data.note_content.length == 0) return;
			// this.setState({
			// 	textContent: data.note_content,
			// });
		});

		$(window).bind('keydown', function (event) {
			if (event.ctrlKey || event.metaKey) {
				switch (String.fromCharCode(event.which).toLowerCase()) {
					case 's':
						event.preventDefault();
						_this.save();
						break;
				}
			}
		});

		$(window).bind('beforeunload', function (event) {
			if (!_this.state.dirty) return;

			_this.save();
			var message = 'Il y a des modifications non sauvegardées.';
			if (typeof event == 'undefined') {
				event = window.event;
			}
			if (event) {
				event.returnValue = message;
			}
			return message;
		});
	},

	render: function render() {
		return React.createElement(
			'form',
			{ id: 'note_edit_form' },
			React.createElement(SaveStateLabel, {
				isSaving: this.state.isSaving,
				dirty: this.state.dirty
			}),
			React.createElement('br', null),
			React.createElement(NoteContent, {
				text: this.state.textContent,
				onChange: this.onTextChange
			})
		);
	},

	onTextChange: function onTextChange(text) {
		var _this2 = this;

		this.setState({
			textContent: text,
			dirty: true
		});
		//Defer saving
		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(function () {
			return _this2.save();
		}, 1500);
	},

	save: (function () {
		// Put jqXHR in a closure
		var jqXHR;
		return function () {
			var _this3 = this;

			console.log("save");
			clearTimeout(this.timeout);
			// Abort previous saving request
			if (jqXHR) {
				jqXHR.abort();
			}
			this.setState({ isSaving: true });
			jqXHR = $.post('/api/notes/' + note_name + '/put', $.param({ note_content: this.state.textContent })).done(function () {
				_this3.setState({
					dirty: false,
					isSaving: false
				});
				console.log("sauvegarde réussie");
			}).fail(function (xhr, textStatus, err) {
				if (textStatus == "abort") {
					// It just means another request has replaced us,
					// so don't do anything
					return;
				}
				_this3.setState({
					isSaving: false
				});
				alert("Erreur lors de la sauvergarde: " + err + "\n" + xhr.responseText);
				console.log(xhr.responseText);
			});
		};
	})()
});

var SaveStateLabel = function SaveStateLabel(_ref) {
	var isSaving = _ref.isSaving;
	var dirty = _ref.dirty;

	// var classes = React.addons.classSet({
	// 'label': true,
	// 'pull-right': true,
	// 'label-asd': true
	// });
	var labelClass = text = "";
	if (isSaving) {
		var labelClass = 'label-warning';
		var text = "Sauvegarde en cours";
	} else if (dirty) {
		var labelClass = 'label-danger';
		var text = "Modifications non enregistrées";
	}
	return React.createElement(
		'span',
		{ className: "label pull-right " + labelClass },
		text
	);
};

var NoteContent = React.createClass({
	displayName: 'NoteContent',

	mixins: [React.addons.PureRenderMixin],

	onChange: function onChange(evt) {
		this.props.onChange(evt.target.value);
	},

	render: function render() {
		return React.createElement('textarea', {
			className: 'form-control',
			id: 'note_content',
			onChange: this.onChange,
			value: this.props.text,
			ref: 'noteContent'
		});
	},

	componentDidUpdate: function componentDidUpdate() {
		var elem = $(this.refs.noteContent);

		// ugly but works well
		/*elem.height("0px");
  elem.height(elem.prop('scrollHeight'));
  return;*/

		// More optimized but buggy
		if (this._oldScrollHeight != elem.prop('scrollHeight')) {
			var win = $(window);
			var oldWinScroll = win.scrollTop();

			elem.height("0px");
			elem.height(elem.prop('scrollHeight'));
			win.scrollTop(oldWinScroll);

			//console.log(this._oldScrollHeight, " vs ", elem.prop('scrollHeight'));
			this._oldScrollHeight = elem.prop('scrollHeight');
		}
	}
});

//$(document).ready(() => {
$(window).on('load', function () {
	window.todoApp = React.render(React.createElement(TodoApp, null), document.getElementById("todo_app"));
});
//# sourceMappingURL=todo_edit.js.map