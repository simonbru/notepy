import $ from 'jquery'
import React from 'react'
import ReactDOM from 'react-dom'
import Sortable from 'sortablejs'
import todotxt from 'todotxt.js'

import { SaveStateLabel } from './lib/components'


function arrayMoveItem(array, fromIndex, toIndex) {
	const dest = array.slice()
	const objectToMove = dest.splice(fromIndex, 1)[0]
	dest.splice(toIndex, 0, objectToMove)
	return dest
}


class TodoApp extends React.Component {
	// mixins: [React.addons.PureRenderMixin],
	// Not pure because we keep the same todoItems list when we add/remove items

	state = {
		isSaving: false,
		dirty: false,
		editing: null,
		todoItems: [],
		lastVersion: this.props.lastVersion,
	}

	componentWillMount() {
		window.gtodoList = this.todoList = new todotxt.TodoList();
		this.todoList.parse(this.props.data);
		this.setState({todoItems: this.todoList.items});

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
		<div>
			<SaveStateLabel
				isSaving={this.state.isSaving}
				dirty={this.state.dirty}
			/>
			<br/>
			<TodoList
				items={this.state.todoItems}
				editing={this.state.editing}
				onItemMove={::this.onItemMove}
				onItemComplete={::this.onItemComplete}
				onItemTextChange={::this.onItemTextChange}
				onItemEdit={::this.onItemEdit}
			/>
			<SaveStateLabel
				isSaving={this.state.isSaving}
				dirty={this.state.dirty}
			/>
		</div>
		);
	}

	deferSave() {
		this.setState({dirty: true});
		if (this.timeout)
			clearTimeout(this.timeout);
		this.timeout = setTimeout(() => this.save(), 1500);
	}

	onItemComplete(itemId, isCompleted) {
		let todoItem = this.todoList.findById(itemId);
		if (isCompleted) {
			todoItem.complete();
		} else {
			todoItem.uncomplete();
		}
		this.deferSave();
		// this.setState({todoItems: this.todoList.items});
		this.forceUpdate();
	}

	onItemTextChange(itemId, text) {
		let todoItem = this.todoList.findById(itemId);
		text = text.trim();

		if (text.length === 0) {
			this.todoList.remove(itemId);
			this.save();
		} else if (todoItem.text !== text) {
			todoItem.text = text;
			this.save();
		}

		this.setState({editing: null})
	}

	onItemEdit(itemId) {
		this.setState({editing: itemId});
	}

	newTask() {
		const task = this.todoList.add("EMPTY");
		task.text = ""; // Hack
		this.setState({editing: task.id});
	}

	onItemMove(fromIndex, toIndex) {
		const todoItems = arrayMoveItem(
			this.state.todoItems, fromIndex, toIndex
		)
		this.todoList.items = todoItems
		this.todoList.reindex()
		this.setState({ todoItems })
		this.deferSave()
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

			const params = {
				note_content: this.todoList.toString()
			}
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


class TodoList extends React.Component {

	componentDidMount() {
		this.sortable = new Sortable(this.sortableElem, {
			draggable: ".todo-item",
			handle: ".drag-handle",
			sort: true,
			onUpdate: this.onSortableUpdate.bind(this),
		})
	}

	componentWillUnmount() {
		this.sortable.destroy()
		this.sortable = null
	}

	onSortableUpdate(evt) {
		// Restore DOM order to keep it in sync with React's order
		$(this.sortableElem).children().get(evt.oldIndex).before(evt.item)

		this.props.onItemMove(evt.oldIndex, evt.newIndex)
	}

	render() {
		let renderItem = (item) => (<TodoItem
			key={item.id}
			id={item.id}
			text={item.text}
			isEditing={item.id === this.props.editing}
			isCompleted={item.isCompleted()}
			onEdit={this.props.onItemEdit}
			onToggleComplete={this.props.onItemComplete}
			onTextChange={this.props.onItemTextChange}/>
		);

		return (
			<div className="list-group" ref={e => this.sortableElem = e}>
				{this.props.items.map(renderItem)}
			</div>
		);
	}
}


class TodoItem extends React.PureComponent {

	state = {
		text: this.props.text
	}

	componentDidUpdate() {
		if (this.props.isEditing) {
			$(this.refs.input).focus();
		}
	}

	componentDidMount() {
		this.componentDidUpdate();
	}

	handleComplete(evt) {
		let {id, isCompleted, onToggleComplete} = this.props;
		onToggleComplete(id, !isCompleted);
		evt.preventDefault();
		evt.stopPropagation(); // do not call handleEdit
	}

	handleEdit(evt) {
		console.log('edit');
		this.props.onEdit(this.props.id);
		evt.preventDefault();
	}

	handleDelete(evt) {
		let {id, onTextChange} = this.props;
		this::onTextChange(id, '');
		evt.preventDefault();
		evt.stopPropagation(); // do not call handleEdit
	}

	handleSubmit(evt) {
		console.log('trigger: change');
		// Hack to avoid Firefox getting back into editing when
		// pressing "Enter".
		// setTimeout(() => this.setState({isEditing: false}), 0);

		let {id, onTextChange} = this.props;
		this::onTextChange(id, this.state.text);
		evt.preventDefault();
	}

	handleChange(evt) {
		this.setState({text: evt.target.value});
	}

	render() {
		let {isCompleted, isEditing} = this.props;
		let {text} = this.state;
		let icon = isCompleted ? 'check' : 'unchecked';

		let textContainer;
		if (isEditing) {
			textContainer = (
				<form onSubmit={::this.handleSubmit}>
					<input
						onBlur={::this.handleSubmit}
						ref="input"
						value={this.state.text}
						onChange={::this.handleChange}
						/>
				</form>
			);
		} else {
			textContainer = <p className={isCompleted ? 'striked' : ''}>
				{text}
			</p>;
		}

		let trashIcon = <Icon
			names="trash"
			className="item-trash pull-right text-danger"
			onClick={::this.handleDelete}
			/>;

		return (
			<li
				className="list-group-item todo-item"
				onClick={::this.handleEdit}
				ref="container"
				>

				<span className="drag-handle" onClick={evt => evt.stopPropagation()}>
					<img src="/static/drag-icon.svg" alt="drag"/>
				</span>

				<Icon
					names={icon}
					className="item-checkbox"
					onClick={::this.handleComplete}
				
				/>
				{isEditing ? null : trashIcon}
				{textContainer}
			</li>
		);
	}
}

const Icon = ({names, className, ...other}) => {
	let classes = names.trim().split(' ').map((x) => 'glyphicon-' + x);
	classes.push('glyphicon');
	if (className) classes.push(className);
	let finalClass = classes.join(' ');
	return <span {...other} className={finalClass} aria-hidden="true"/>;
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

		const todoDiv = document.getElementById("todo_app");
		window.todoApp = ReactDOM.render(
			<TodoApp noteName={initialData.noteName} lastVersion={lastVersion} data={noteText}/>,
			todoDiv
		);
	});
});
