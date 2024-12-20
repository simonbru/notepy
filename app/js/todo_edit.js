import './common'
import '../styles/todo_edit.css'

import $ from 'jquery'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Sortable from 'sortablejs'
import todotxt from 'todotxt.js'

import { SaveStateLabel } from './lib/components'


function arrayMoveItem(array, fromIndex, toIndex) {
  const dest = array.slice()
  const objectToMove = dest.splice(fromIndex, 1)[0]
  dest.splice(toIndex, 0, objectToMove)
  return dest
}


class TodoStore extends React.Component {

  state = {
    isSaving: false,
    dirty: false,
    editing: null,
    todoItems: [],
    lastVersion: this.props.lastVersion,
  }

  constructor(props) {
    super(props)
    this.todoList = new todotxt.TodoList()
    this.todoList.parse(this.props.data)
    this.state.todoItems = this.todoList.items

    this.actions = {
      deferSave: this.deferSave,
      save: this.save,
      newItem: this.newItem,
      completeItem: this.completeItem,
      editItem: (taskId) => {
        this.setState({ editing: taskId })
      },
      moveItem: this.moveItem,
      updateItem: this.updateItem,
    }
  }

  render() {
    return <>
      { this.props.children(this.state, this.actions) }
    </>
  }

  completeItem = (itemId, isCompleted) => {
    let todoItem = this.todoList.findById(itemId)
    if (isCompleted) {
      todoItem.complete()
    } else {
      todoItem.uncomplete()
    }
    this.deferSave()
    this.forceUpdate()
  }

  updateItem = (itemId, text) => {
    let todoItem = this.todoList.findById(itemId)
    text = text.trim()

    if (text.length === 0) {
      this.todoList.remove(itemId)
      this.save()
    } else if (todoItem.text !== text) {
      todoItem.text = text
      this.save()
    }

    this.setState({editing: null})
  }

  newItem = () => {
    const task = this.todoList.add("EMPTY")
    task.text = "" // Hack
    this.setState({editing: task.id})
  }

  moveItem = (fromIndex, toIndex) => {
    const todoItems = arrayMoveItem(
      this.state.todoItems, fromIndex, toIndex
    )
    this.todoList.items = todoItems
    this.todoList.reindex()
    this.setState({ todoItems })
    this.deferSave()
  }

  deferSave = () => {
    this.setState({dirty: true})
    if (this.timeout) clearTimeout(this.timeout)
    this.timeout = setTimeout(() => this.save(), 1500)
  }

  save = (() => {
    // Put jqXHR in a closure
    let jqXHR
    const innerSave = (force = false) => {
      clearTimeout(this.timeout)
      // Abort previous saving request
      if(jqXHR) {
        jqXHR.abort()
      }
      this.setState({isSaving: true})

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
          })
        })
        .fail((xhr,textStatus,err) => {
          if (textStatus === "abort") {
            // It just means another request has replaced us,
            // so don't do anything
            return
          }

          this.setState({ isSaving: false })
          if (xhr.status === 409) {
            if (confirm("Conflit détecté. Voulez-vous écraser la version du serveur ?")) {
              innerSave(true)
            }
          } else {
            alert(`Erreur lors de la sauvergarde: ${err}\n${xhr.responseText}`)
            /* eslint-disable-next-line no-console */
            console.error(xhr.responseText, xhr)
          }
        })
    }
    return innerSave
  })()
}


function TodoApp({ todoState, todoActions }) {
  // Not pure because we keep the same todoItems list when we add/remove items

  const {
    todoItems,
    isSaving,
    dirty,
    editing,
  } = todoState

  const { save } = todoActions

  useEffect(() => {
    const shortcutsHandler = (event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
          event.preventDefault()
          save()
          break
        }
      }
    }

    $(window).on('keydown', shortcutsHandler)
    return () => {
      $(window).off('keydown', shortcutsHandler)
    }
  }, [save])

  useEffect(() => {
    // TODO: avoid triggering effect so often ?
    if (!dirty) return

    const beforeunloadHandler = (event) => {
      save()
      const message = 'Il y a des modifications non sauvegardées.'
      if (typeof event === 'undefined') {
        event = window.event
      }
      if (event) {
        event.returnValue = message
      }
      return message
    }

    $(window).on('beforeunload', beforeunloadHandler)
    return () => {
      $(window).off('beforeunload', beforeunloadHandler)
    }
  }, [dirty, save])

  return (
    <div>
      <SaveStateLabel
        isSaving={isSaving}
        dirty={dirty}
      />
      <br/>
      <TodoList
        items={todoItems}
        editing={editing}
        actions={todoActions}
      />
      <SaveStateLabel
        isSaving={isSaving}
        dirty={dirty}
      />
    </div>
  )
}


function TodoList(props) {
  const { editing, items, actions } = props
  const { moveItem } = actions

  const sortableElemRef = useRef(null)

  useLayoutEffect(() => {
    const onSortableUpdate = (evt) => {
      // Restore DOM order to keep it in sync with React's order
      $(sortableElemRef.current).children().get(evt.oldIndex).before(evt.item)

      moveItem(evt.oldIndex, evt.newIndex)
    }

    const sortable = new Sortable(sortableElemRef.current, {
      draggable: ".todo-item",
      handle: ".drag-handle",
      sort: true,
      onUpdate: onSortableUpdate,
    })
    return () => {
      sortable.destroy()
    }
  }, [moveItem])

  const renderItem = (item) => <TodoItem
    key={item.id}
    id={item.id}
    text={item.text}
    isEditing={item.id === editing}
    isCompleted={item.isCompleted()}
    actions={actions}
  />

  return (
    <div className="list-group" ref={sortableElemRef}>
      {items.map(renderItem)}
    </div>
  )

}


function TodoItem(props) {
  const { id, isCompleted, isEditing, text, actions } = props

  const [localText, setLocalText] = useState(text)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleComplete = (evt) => {
    actions.completeItem(id, !isCompleted)
    evt.preventDefault()
    evt.stopPropagation() // do not call handleEdit
  }

  const handleEdit = () => {
    actions.editItem(id)
  }

  const handleDelete = (evt) => {
    if (confirm(`Supprimer "${localText}" ?`)) {
      actions.updateItem(id, '')
    }
    evt.stopPropagation() // do not call handleEdit
  }

  const handleSubmit = (evt) => {
    // Hack to avoid Firefox getting back into editing when
    // pressing "Enter".
    // setTimeout(() => this.setState({isEditing: false}), 0)

    evt.preventDefault()
    actions.updateItem(id, localText)
  }

  let icon = isCompleted ? 'check' : 'unchecked'

  let textContainer
  if (isEditing) {
    textContainer = (
      <form onSubmit={handleSubmit}>
        <input
          onBlur={handleSubmit}
          ref={inputRef}
          value={localText}
          onChange={evt => setLocalText(evt.target.value)}
        />
      </form>
    )
  } else {
    textContainer = <p className={isCompleted ? 'striked' : ''}>
      {localText}
    </p>
  }

  let trashIcon = <Icon
    names="trash"
    className="item-trash pull-right text-danger"
    onClick={handleDelete}
  />

  return (
    <li
      className="list-group-item todo-item"
      onClick={handleEdit}
    >
      <span className="drag-handle" onClick={evt => evt.stopPropagation()}>
        <img src="/static/drag-icon.svg" alt="drag"/>
      </span>

      <Icon
        names={icon}
        className="item-checkbox"
        onClick={handleComplete}
      />
      {isEditing ? null : trashIcon}
      {textContainer}
    </li>
  )
}

const Icon = ({names, className, ...other}) => {
  let classes = names.trim().split(' ').map((x) => 'glyphicon-' + x)
  classes.push('glyphicon')
  if (className) classes.push(className)
  let finalClass = classes.join(' ')
  return <span {...other} className={finalClass} aria-hidden="true"/>
}

//$(document).ready(() => {
$(window).on('load', () => {
  const initialData = JSON.parse(
    $('.json-data').text()
  )

  function renderTodoApp(state, actions) {
    window.todoApp = actions
    return <TodoApp todoState={state} todoActions={actions} />
  }

  $.get(`/api/notes/${initialData.noteName}`)
    .then((data, textStatus, jqXHR) => {
      const lastModifiedHeader = jqXHR.getResponseHeader("Last-Modified")
      const lastVersion = new Date(lastModifiedHeader)
      const noteText = data.note_content || ''

      const todoDiv = document.getElementById("todo_app")
      const root = createRoot(todoDiv)
      root.render(
        <TodoStore
          noteName={initialData.noteName}
          lastVersion={lastVersion}
          data={noteText}
        >{renderTodoApp}</TodoStore>
      )
    })
})
