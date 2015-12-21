'use strict';

var TodoApp = React.createClass({
	displayName: 'TodoApp',

	//mixins: [React.addons.PureRenderMixin],

	getInitialState: function getInitialState() {
		return {
			isSaving: false,
			dirty: false,
			todoItems: []
		};
	},

	componentWillMount: function componentWillMount() {
		var _this = this;

		$.get('/api/notes/' + note_name + '/get').success(function (data) {
			window.gtodoList = _this.todoList = new todotxt.TodoList();
			_this.todoList.parse(data.note_content);
			_this.setState({ todoItems: _this.todoList.items });
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
			{ id: 'todo_edit_form' },
			React.createElement(SaveStateLabel, {
				isSaving: this.state.isSaving,
				dirty: this.state.dirty
			}),
			React.createElement('br', null),
			React.createElement(TodoList, { items: this.state.todoItems })
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

var TodoList = React.createClass({
	displayName: 'TodoList',

	mixins: [React.addons.PureRenderMixin],

	//onChange: function(evt) {this.props.onChange(evt.target.value)},

	render: function render() {
		var result = function result(item) {
			return React.createElement(TodoItem, {
				key: item.id,
				text: item.text,
				isCompleted: item.isCompleted() });
		};
		return React.createElement(
			'ul',
			null,
			this.props.items.map(result)
		);
	}

});

var TodoItem = React.createClass({
	displayName: 'TodoItem',

	mixins: [React.addons.PureRenderMixin],

	//onChange: function(evt) {this.props.onChange(evt.target.value)},

	render: function render() {
		var _props = this.props;
		var text = _props.text;
		var isCompleted = _props.isCompleted;

		var content = isCompleted ? React.createElement(
			's',
			null,
			text
		) : text;
		return React.createElement(
			'li',
			null,
			content
		);
	}
});

//$(document).ready(() => {
$(window).on('load', function () {
	window.todoApp = ReactDOM.render(React.createElement(TodoApp, null), document.getElementById("todo_app"));
});
//# sourceMappingURL=todo_edit.js.map