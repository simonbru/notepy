'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var TodoApp = React.createClass({
	displayName: 'TodoApp',

	mixins: [React.addons.PureRenderMixin],

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
			'div',
			null,
			React.createElement(SaveStateLabel, {
				isSaving: this.state.isSaving,
				dirty: this.state.dirty
			}),
			React.createElement('br', null),
			React.createElement(TodoList, {
				items: this.state.todoItems,
				onItemComplete: this.onItemComplete,
				onItemTextChange: this.onItemTextChange
			})
		);
	},

	deferSave: function deferSave() {
		var _this2 = this;

		this.setState({ dirty: true });
		if (this.timeout) clearTimeout(this.timeout);
		this.timeout = setTimeout(function () {
			return _this2.save();
		}, 1500);
	},

	onItemComplete: function onItemComplete(itemId, isCompleted) {
		var todoItem = this.todoList.findById(itemId);
		if (isCompleted) {
			todoItem.complete();
		} else {
			todoItem.uncomplete();
		}
		this.deferSave();
		// this.setState({todoItems: this.todoList.items});
		this.forceUpdate();
	},

	onItemTextChange: function onItemTextChange(itemId, text) {
		var todoItem = this.todoList.findById(itemId);
		if (todoItem.text != text) {
			todoItem.text = text;
			this.save();
		}
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
			var textContent = this.todoList.toString();
			this.setState({ isSaving: true });
			jqXHR = $.post('/api/notes/' + note_name + '/put', $.param({ note_content: textContent })).done(function () {
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

	// mixins: [React.addons.PureRenderMixin],

	render: function render() {
		var _this4 = this;

		var renderItem = function renderItem(item) {
			return React.createElement(TodoItem, {
				key: item.id,
				id: item.id,
				text: item.text,
				isCompleted: item.isCompleted(),
				onToggleComplete: _this4.props.onItemComplete,
				onTextChange: _this4.props.onItemTextChange });
		};

		return React.createElement(
			'div',
			{ className: 'list-group' },
			this.props.items.map(renderItem)
		);
	}

});

var TodoItem = React.createClass({
	displayName: 'TodoItem',

	mixins: [React.addons.PureRenderMixin, React.addons.LinkedStateMixin],

	getInitialState: function getInitialState() {
		return {
			text: this.props.text,
			isEditing: false
		};
	},

	componentDidUpdate: function componentDidUpdate() {
		if (this.state.isEditing) {
			$(this.refs.input).focus();
		}
	},

	handleComplete: function handleComplete(evt) {
		var _props = this.props;
		var id = _props.id;
		var isCompleted = _props.isCompleted;
		var onToggleComplete = _props.onToggleComplete;

		onToggleComplete(id, !isCompleted);
		evt.preventDefault();
		evt.stopPropagation(); // do not call handleEdit
	},

	handleEdit: function handleEdit(evt) {
		console.log('edit');
		this.setState({ isEditing: true });
		evt.preventDefault();
	},

	handleSubmit: function handleSubmit(evt) {
		console.log('trigger: change');
		var text = this.refs.input.value;
		this.setState({
			text: text,
			isEditing: false
		});
		var _props2 = this.props;
		var id = _props2.id;
		var onTextChange = _props2.onTextChange;

		onTextChange(id, text);
		evt.preventDefault();
	},

	render: function render() {
		var isCompleted = this.props.isCompleted;
		var _state = this.state;
		var text = _state.text;
		var isEditing = _state.isEditing;

		var icon = isCompleted ? 'check' : 'unchecked';

		var textContainer = undefined;
		if (isEditing) {
			textContainer = React.createElement(
				'form',
				{ onSubmit: this.handleSubmit },
				React.createElement('input', {
					onBlur: this.handleSubmit,
					ref: 'input',
					valueLink: this.linkState('text')
				})
			);
		} else {
			textContainer = React.createElement(
				'p',
				{ className: isCompleted && 'striked' },
				text
			);
		}

		return React.createElement(
			'a',
			{
				href: '#',
				className: 'list-group-item todo-item',
				onClick: this.handleEdit,
				ref: 'container'
			},
			React.createElement(Icon, {
				names: icon,
				className: 'item-checkbox',
				onClick: this.handleComplete }),
			textContainer
		);
	}
});

var Icon = function Icon(_ref2) {
	var names = _ref2.names;
	var className = _ref2.className;

	var other = _objectWithoutProperties(_ref2, ['names', 'className']);

	var classes = names.trim().split(' ').map(function (x) {
		return 'glyphicon-' + x;
	});
	classes.push('glyphicon');
	if (className) classes.push(className);
	var finalClass = classes.join(' ');
	return React.createElement('span', _extends({}, other, { className: finalClass, 'aria-hidden': 'true' }));
};

//$(document).ready(() => {
$(window).on('load', function () {
	window.todoApp = ReactDOM.render(React.createElement(TodoApp, null), document.getElementById("todo_app"));
});
//# sourceMappingURL=todo_edit.js.map