function shallowCompare(nextProps, nextState) {
	return React.addons.shallowCompare(this, nextProps, nextState);
}


class NoteApp extends React.Component {

	shouldComponentUpdate = shallowCompare

	state = {
		isSaving: false,
		dirty: false,
		textContent: this.props.textContent,
		lastSaved: Date.now()
	}

	componentWillMount() {
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
	}

	render() {
		return (
		<form id="note_edit_form">
			<SaveStateLabel
				isSaving={this.state.isSaving}
				dirty={this.state.dirty}
			/>
			<br/>
			<NoteContent
				text={this.state.textContent}
				onChange={::this.onTextChange}
			/>
		</form>
		);
	}

	onTextChange(text) {
		this.setState({
			textContent: text,
			dirty: true
		});
		//Defer saving
		if (this.timeout)
			clearTimeout(this.timeout);
		this.timeout = setTimeout(() => this.save(), 1500);
	}

	save = (() => {
		// Put jqXHR in a closure
		var jqXHR;
		return () => {
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
}


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


class NoteContent extends React.Component {

	shouldComponentUpdate = shallowCompare

	onChange(evt) {this.props.onChange(evt.target.value)}

	render() {
		let nbLines = this.props.text.split('\n').length + 1;
		return <textarea
			className="form-control"
			id="note_content"
			onChange={::this.onChange}
			value={this.props.text}
			rows={nbLines}
			ref="noteContent"
			/>;
	}
}


//$(document).ready(() => {
$(window).on('load', () => {
	$.get('/api/notes/'+note_name+'/get')
	.success((data) => {
		var noteDiv = document.getElementById("note_app");
		window.noteApp = ReactDOM.render(<NoteApp textContent={data.note_content}/>, noteDiv);
	});
});
