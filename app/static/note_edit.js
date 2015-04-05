var NoteApp = React.createClass({displayName: "NoteApp",
	getInitialState: function() {
		return {
			isSaving: false,
			dirty: false,
			textContent: "",
			lastSaved: Date.now()
		};
	},

	componentWillMount: function() {
		$.get('/api/notes/'+note_name+'/get')
		.success(function(data)  {
			if (data.note_content.length == 0)
				return;
			this.setState({
				textContent: data.note_content,
			});
		}.bind(this));

		$(window).bind('keydown', function(event)  {
			if (event.ctrlKey || event.metaKey) {
				switch (String.fromCharCode(event.which).toLowerCase()) {
				case 's':
					event.preventDefault();
					this.save();
					break;
				}
			}
		}.bind(this));

		$(window).bind('beforeunload', function(event)  {
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
		}.bind(this));
	},

	render: function() {
		return (
		React.createElement("form", {id: "note_edit_form"}, 
			React.createElement(SaveStateLabel, {
				isSaving: this.state.isSaving, 
				dirty: this.state.dirty}
			), 
			React.createElement("br", null), 
			React.createElement(NoteContent, {
				text: this.state.textContent, 
				onChange: this.onTextChange}
			)
		)
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
		this.timeout = setTimeout(function()  {return this.save();}.bind(this), 1500); 
	},
	
	save: function() {
		console.log("save");
		clearTimeout(this.timeout);
		this.setState({isSaving: true});
		$.post('/api/notes/'+note_name+'/put', 
			$.param({note_content: this.state.textContent}))
		.done(function()  {
			this.setState({
				dirty: false,
				isSaving: false
			});
			console.log("sauvegarde réussie");
		}.bind(this))
		.fail(function(xhr,textStatus,err)  {
			this.setState({
				isSaving: false
			});
			alert("Erreur lors de la sauvergarde: "+err+"\n"+xhr.responseText);
			console.log(xhr.responseText);
		}.bind(this));
	}
});


var SaveStateLabel = React.createClass({displayName: "SaveStateLabel",
	getDefaultProps: function() {
		return {
			isSaving: false,
			dirty: false
		};
	},
	
	render: function() {
		// var classes = React.addons.classSet({
			// 'label': true,
			// 'pull-right': true,
			// 'label-asd': true
		// });
		var labelClass = text = "";
		if (this.props.isSaving) {
			var labelClass = 'label-warning';
			var text = "Sauvegarde en cours";
		} else if (this.props.dirty) {
			var labelClass = 'label-danger';
			var text = "Modifications non enregistrées";
		}
		return React.createElement("span", {className: "label pull-right "+labelClass}, 
				text);
	}
});


var NoteContent = React.createClass({displayName: "NoteContent",

	onChange: function(evt) {this.props.onChange(evt.target.value)},

	render: function() {
		return React.createElement("textarea", {
			className: "form-control", 
			id: "note_content", 
			onChange: this.onChange, 
			value: this.props.text, 
			ref: "noteContent"}
			);
	},

	componentDidUpdate: function() {
		var elem = $(React.findDOMNode(this.refs.noteContent));
		
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

window.noteApp = React.render(React.createElement(NoteApp, null), document.getElementById("note_app"));
