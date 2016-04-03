var TodoApp = React.createClass({
	// mixins: [React.addons.PureRenderMixin],
	// Not pure because we keep the same todoItems list when we add/remove items

	getInitialState: function() {
		return {
			isSaving: false,
			dirty: false,
			editing: null,
			todoItems: []
		};
	},

	componentWillMount: function() {
		$.get('/api/notes/'+note_name+'/get')
		.success((data) => {
			window.gtodoList = this.todoList = new todotxt.TodoList();
			this.todoList.parse(data.note_content);
			this.setState({todoItems: this.todoList.items});
		});

		$(window).bind('keydown', (event) => {
			if (event.ctrlKey || event.metaKey) {
				switch (String.fromCharCode(event.which).toLowerCase()) {
				case 's':
					event.preventDefault();
					this.save();
					break;
				}
			}
		});

		$(window).bind('beforeunload', (event) => {
			if (!this.state.dirty)
				return;

			this.save();
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

	render: function() {
		return (
		<div>
			<SaveStateLabel
				isSaving={this.state.isSaving}
				dirty={this.state.dirty}
			/>
			<br/>
			<TodoList
				items={this.state.todoItems}
				editing={this.state.editing}
				onItemComplete={this.onItemComplete}
				onItemTextChange={this.onItemTextChange}
				onItemEdit={this.onItemEdit}
			/>
		</div>
		);
	},

	deferSave: function() {
		this.setState({dirty: true});
		if (this.timeout)
			clearTimeout(this.timeout);
		this.timeout = setTimeout(() => this.save(), 1500);
	},

	onItemComplete: function(itemId, isCompleted) {
		let todoItem = this.todoList.findById(itemId);
		if (isCompleted) {
			todoItem.complete();
		} else {
			todoItem.uncomplete();
		}
		this.deferSave();
		// this.setState({todoItems: this.todoList.items});
		this.forceUpdate();
	},

	onItemTextChange: function(itemId, text) {
		let todoItem = this.todoList.findById(itemId);
		text = text.trim();

		if (text.length == 0) {
			this.todoList.remove(itemId);
			this.save();
		} else if (todoItem.text != text) {
			todoItem.text = text;
			this.save();
		}

		this.setState({editing: null})
	},

	onItemEdit: function(itemId) {
		this.setState({editing: itemId});
	},

	newTask: function() {
		var task = this.todoList.add("EMPTY");
		task.text = ""; // Hack
		this.setState({editing: task.id});
	},

	save: (function() {
		// Put jqXHR in a closure
		var jqXHR;
		return function() {
			console.log("save");
			clearTimeout(this.timeout);
			// Abort previous saving request
			if(jqXHR) {
				jqXHR.abort();
			}
			let textContent = this.todoList.toString();
			this.setState({isSaving: true});
			jqXHR = $.post('/api/notes/'+note_name+'/put',
				$.param({note_content: textContent}))
			.done(() => {
				this.setState({
					dirty: false,
					isSaving: false
				});
				console.log("sauvegarde réussie");
			})
			.fail((xhr,textStatus,err) => {
				if (textStatus == "abort") {
					// It just means another request has replaced us,
					// so don't do anything
					return;
				}
				this.setState({
					isSaving: false
				});
				alert("Erreur lors de la sauvergarde: "+err+"\n"+xhr.responseText);
				console.log(xhr.responseText);
			});
		};
	})()
});


var SaveStateLabel = ({isSaving, dirty}) => {
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
	return <span className={"label pull-right "+labelClass}>{text}</span>;
};


var TodoList = React.createClass({
	// mixins: [React.addons.PureRenderMixin],

	render: function() {
		let renderItem = (item) => (<TodoItem
			key={item.id}
			id={item.id}
			text={item.text}
			isEditing={item.id === this.props.editing}
			isCompleted={item.isCompleted()}
			onEdit={this.props.onItemEdit}
			onToggleComplete={this.props.onItemComplete}
			onTextChange={this.props.onItemTextChange} />
		);

		return (
			<div className="list-group">
				{this.props.items.map(renderItem)}
			</div>
		);
	},

});


var TodoItem = React.createClass({
	mixins: [React.addons.PureRenderMixin,
			 React.addons.LinkedStateMixin],

	getInitialState: function() {
		return {
			text: this.props.text
		};
	},

	componentDidUpdate: function() {
		if (this.props.isEditing) {
			$(this.refs.input).focus();
		}
	},

	componentDidMount: function() {
		this.componentDidUpdate();
	},

	handleComplete: function(evt) {
		let {id, isCompleted, onToggleComplete} = this.props;
		onToggleComplete(id, !isCompleted);
		evt.preventDefault();
		evt.stopPropagation(); // do not call handleEdit
	},

	handleEdit: function(evt) {
		console.log('edit');
		this.props.onEdit(this.props.id);
		evt.preventDefault();
	},

	handleSubmit: function(evt) {
		console.log('trigger: change');
		// Hack to avoid Firefox getting back into editing when
		// pressing "Enter".
		// setTimeout(() => this.setState({isEditing: false}), 0);

		let {id, onTextChange} = this.props;
		onTextChange(id, this.state.text);
		evt.preventDefault();
	},

	render: function() {
		let {isCompleted, isEditing} = this.props;
		let {text} = this.state;
		let icon = isCompleted ? 'check' : 'unchecked';

		let textContainer;
		if (isEditing) {
			textContainer = (
				<form onSubmit={this.handleSubmit}>
					<input
						onBlur={this.handleSubmit}
						ref="input"
						valueLink={this.linkState('text')}
						/>
				</form>
			);
		} else {
			textContainer = <p className={isCompleted && 'striked'}>{text}</p>;
		}

		return (
			<li
				href="#"
				className="list-group-item todo-item"
				onClick={this.handleEdit}
				ref="container"
				>

				<Icon
					names={icon}
					className="item-checkbox"
					onClick={this.handleComplete}/>
				{textContainer}

			</li>
		);
	},
})

var Icon = ({names, className, ...other}) => {
	let classes = names.trim().split(' ').map((x) => 'glyphicon-' + x);
	classes.push('glyphicon');
	if (className) classes.push(className);
	let finalClass = classes.join(' ');
	return <span {...other} className={finalClass} aria-hidden="true"/>;
}

//$(document).ready(() => {
$(window).on('load', () => {
	window.todoApp = ReactDOM.render(<TodoApp/>, document.getElementById("todo_app"));
});
