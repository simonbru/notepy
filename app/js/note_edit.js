import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'


class NoteApp extends React.PureComponent {

	state = {
		isSaving: false,
		dirty: false,
		textContent: this.props.textContent,
		lastVersion: this.props.lastVersion,
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
			const message = 'Il y a des modifications non sauvegardées.';
			if (typeof event === 'undefined') {
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
		let jqXHR;
		const innerSave = (force = false) => {
			console.log("save");
			clearTimeout(this.timeout);
			// Abort previous saving request
			if(jqXHR) {
				jqXHR.abort();
			}
			this.setState({isSaving: true});
			const params = { note_content: this.state.textContent }
			if (!force) {
				params['last_version'] = this.state.lastVersion.toISOString()
			}
			jqXHR = $.post(`/api/notes/${this.props.noteName}`, params)
			.done(() => {
				const lastVersion = new Date(jqXHR.getResponseHeader("Last-Modified"))
				this.setState({
					dirty: false,
					isSaving: false,
					lastVersion,
				});
				console.log("sauvegarde réussie");
			})
			.fail((xhr,textStatus,err) => {
				if (textStatus === "abort") {
					// It just means another request has replaced us,
					// so don't do anything
					return;
				}

				this.setState({ isSaving: false });
				if (xhr.status === 409) {
					if (confirm("Conflit détecté. Voulez-vous écraser la version du serveur ?")) {
						innerSave(true)
					}
				} else {
					alert(`Erreur lors de la sauvergarde: ${err}\n${xhr.responseText}`);
					console.log(xhr.responseText, xhr);
				}
			});
		};
		return innerSave
	})()
}


const SaveStateLabel = ({isSaving, dirty}) => {
	// var classes = React.addons.classSet({
		// 'label': true,
		// 'pull-right': true,
		// 'label-asd': true
	// });
	let labelClass = "";
	let text = "";
	if (isSaving) {
		labelClass = 'label-warning';
		text = "Sauvegarde en cours";
	} else if (dirty) {
		labelClass = 'label-danger';
		text = "Modifications non enregistrées";
	}
	return <span className={"label pull-right "+labelClass}>{text}</span>;
};


class NoteContent extends React.PureComponent {

	static defaultProps = {text: ''}

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
	const initialData = JSON.parse(
		$('.json-data').text()
	);

	$.get(`/api/notes/${initialData.noteName}`)
	.then((data, textStatus, jqXHR) => {
		const lastModifiedHeader = jqXHR.getResponseHeader("Last-Modified")
		const lastVersion = new Date(lastModifiedHeader)
		const noteText = data.note_content || '';

		const noteDiv = document.getElementById("note_app");
		window.noteApp = ReactDOM.render(
			<NoteApp noteName={initialData.noteName} lastVersion={lastVersion} textContent={noteText}/>,
			noteDiv
		);
	});
});