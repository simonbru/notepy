var NoteApp = React.createClass({
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
		.success((data) => {
			if (data.note_content.length == 0)
				return;
			this.setState({
				textContent: data.note_content,
			});
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
		<form id="note_edit_form">
			<SaveStateLabel 
				isSaving={this.state.isSaving} 
				dirty={this.state.dirty}
			/>
			<br/>
			<NoteContent 
				text={this.state.textContent} 
				onChange={this.onTextChange}
			/>
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
	
	save: function() {
		console.log("save");
		clearTimeout(this.timeout);
		this.setState({isSaving: true});
		$.post('/api/notes/'+note_name+'/put', 
			$.param({note_content: this.state.textContent}))
		.done(() => {
			this.setState({
				dirty: false,
				isSaving: false
			});
			console.log("sauvegarde réussie");
		})
		.fail((xhr,textStatus,err) => {
			this.setState({
				isSaving: false
			});
			alert("Erreur lors de la sauvergarde: "+err+"\n"+xhr.responseText);
			console.log(xhr.responseText);
		});
	}
});


var SaveStateLabel = React.createClass({
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
		return <span className={"label pull-right "+labelClass}>
				{text}</span>;
	}
});


var NoteContent = React.createClass({

	onChange: function(evt) {this.props.onChange(evt.target.value)},

	render: function() {
		return <textarea 
			className="form-control" 
			id="note_content"
			onChange={this.onChange}
			value={this.props.text}
			ref="noteContent"
			/>;
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

window.noteApp = React.render(<NoteApp/>, document.getElementById("note_app"));
