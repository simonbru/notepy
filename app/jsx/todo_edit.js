var TodoApp = React.createClass({
	//mixins: [React.addons.PureRenderMixin],

	getInitialState: function() {
		return {
			isSaving: false,
			dirty: false,
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
		<form id="todo_edit_form">
			<SaveStateLabel
				isSaving={this.state.isSaving}
				dirty={this.state.dirty}
			/>
			<br/>
			<TodoList items={this.state.todoItems} />
		</form>
		);
	},

	onTextChange: function(text) {
		this.setState({
			textContent: text,
			dirty: true
		});
		//Defer saving
		if (this.timeout)
			clearTimeout(this.timeout);
		this.timeout = setTimeout(() => this.save(), 1500);
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
			this.setState({isSaving: true});
			jqXHR = $.post('/api/notes/'+note_name+'/put',
				$.param({note_content: this.state.textContent}))
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
	mixins: [React.addons.PureRenderMixin],

	//onChange: function(evt) {this.props.onChange(evt.target.value)},

	render: function() {
		let result = (item) => (<TodoItem
			key={item.id}
			text={item.text}
			isCompleted={item.isCompleted()} />
		);
		return (
			<div className="list-group">
				{this.props.items.map(result)}
			</div>
		);
	},

});

var TodoItem = React.createClass({
	mixins: [React.addons.PureRenderMixin],

	//onChange: function(evt) {this.props.onChange(evt.target.value)},

	render: function() {
		let {text, isCompleted} = this.props;
		let content = isCompleted ? <s>{text}</s> : text;
		let icon = isCompleted ? 'check' : 'unchecked';
		return (
			<a href="#" className="list-group-item">
				<Icon names={icon} />
				{content}
			</a>
		);
	},
})

var Icon = ({names, className}) => {
	let classes = names.trim().split(' ').map((x) => 'glyphicon-' + x);
	classes.push('glyphicon');
	className && classes.push(className);
	let finalClass = classes.join(' ');
	return <span className={finalClass} aria-hidden="true"/>;
}

//$(document).ready(() => {
$(window).on('load', () => {
	window.todoApp = ReactDOM.render(<TodoApp/>, document.getElementById("todo_app"));
});
