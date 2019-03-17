import './common'
import '../styles/todo_edit.css'

import $ from 'jquery'
import React, {
  useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState
} from 'react'
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


function TodoApp(props) {
  // Not pure because we keep the same todoItems list when we add/remove items
  const { noteName } = props

  const [todoList,] = useState(() => {
    const list = window.gtodoList = new todotxt.TodoList()
    list.parse(props.data)
    return list
  })
  const [todoItems, setTodoItems] = useState(todoList.items)

  const [isSaving, setIsSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [editing, setEditing] = useState(null)
  const [lastVersion, setLastVersion] = useState(props.lastVersion)

  const deferTimeoutRef = useRef(null)
  const jqXHRRef = useRef(null)
  const [, forceUpdate] = useReducer(x => x + 1, 0)

  const save = useCallback((force = false) => {
    clearTimeout(deferTimeoutRef.current)
    // Abort previous saving request
    if(jqXHRRef.current) {
      jqXHRRef.current.abort()
    }
    setIsSaving(true)

    const params = {
      note_content: todoList.toString()
    }
    if (!force) {
      params['last_version'] = lastVersion.toISOString()
    }
    jqXHRRef.current = $.post(`/api/notes/${noteName}`, params)
      .done((data, textStatus, jqXHR) => {
        setLastVersion(new Date(jqXHR.getResponseHeader("Last-Modified")))
        setDirty(false)
        setIsSaving(false)
      })
      .fail((xhr, textStatus, err) => {
        if (textStatus === "abort") {
          // It just means another request has replaced this one,
          // so don't do anything
          return
        }

        setIsSaving(false)
        if (xhr.status === 409) {
          if (confirm("Conflit détecté. Voulez-vous écraser la version du serveur ?")) {
            save(true)
          }
        } else {
          alert(`Erreur lors de la sauvergarde: ${err}\n${xhr.responseText}`)
          /* eslint-disable-next-line no-console */
          console.error(xhr.responseText, xhr)
        }
      })
  }, [lastVersion, todoList, noteName, save])

  const deferSave = useCallback(() => {
    setDirty(true)
    if (deferTimeoutRef.current) clearTimeout(deferTimeoutRef.current)
    deferTimeoutRef.current = setTimeout(() => save(), 1500)
  }, [setDirty, save])

  const onItemTextChange = (itemId, text) => {
    let todoItem = todoList.findById(itemId)
    text = text.trim()

    if (text.length === 0) {
      todoList.remove(itemId)
      save()
    } else if (todoItem.text !== text) {
      todoItem.text = text
      save()
    }
    // TODO: forceUpdate ?
    setEditing(null)
  }

  const onItemEdit = (itemId) => {
    setEditing(itemId)
  }

  const newTask = useCallback(() => {
    const task = todoList.add("EMPTY")
    task.text = "" // Hack
    setEditing(task.id)
  }, [todoList])

  const onItemMove = useCallback((fromIndex, toIndex) => {
    const newTodoItems = arrayMoveItem(
      todoItems, fromIndex, toIndex
    )
    todoList.items = newTodoItems
    todoList.reindex()
    setTodoItems(newTodoItems)
    deferSave()
  }, [deferSave, todoItems, todoList])

  const onItemComplete = (itemId, isCompleted) => {
    const todoItem = todoList.findById(itemId)
    if (isCompleted) {
      todoItem.complete()
    } else {
      todoItem.uncomplete()
    }
    deferSave()
    // this.setState({todoItems: this.todoList.items})
    forceUpdate()
  }

  const { appHandleCallback } = props
  useEffect(() => {
    appHandleCallback({ newTask, save })
  }, [appHandleCallback, newTask, save])

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

    $(window).bind('keydown', shortcutsHandler)
    return () => {
      $(window).unbind('keydown', shortcutsHandler)
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

    $(window).bind('beforeunload', beforeunloadHandler)
    return () => {
      $(window).unbind('beforeunload', beforeunloadHandler)
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
        onItemMove={onItemMove}
        onItemComplete={onItemComplete}
        onItemTextChange={onItemTextChange}
        onItemEdit={onItemEdit}
      />
      <SaveStateLabel
        isSaving={isSaving}
        dirty={dirty}
      />
    </div>
  )
}


function TodoList(props) {
  const { editing, items, onItemMove } = props

  const sortableElemRef = useRef(null)

  // Optimization hack to avoid initializing Sortable too often
  // TODO: cleaner solution
  const onItemMoveRef = useRef(onItemMove)
  useEffect(() => {
    onItemMoveRef.current = onItemMove
  }, [onItemMove])

  useLayoutEffect(() => {
    const onSortableUpdate = (evt) => {
      // Restore DOM order to keep it in sync with React's order
      $(sortableElemRef.current).children().get(evt.oldIndex).before(evt.item)

      onItemMoveRef.current(evt.oldIndex, evt.newIndex)
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
  }, [])

  const renderItem = (item) => <TodoItem
    key={item.id}
    id={item.id}
    text={item.text}
    isEditing={item.id === editing}
    isCompleted={item.isCompleted()}
    onEdit={props.onItemEdit}
    onToggleComplete={props.onItemComplete}
    onTextChange={props.onItemTextChange}
  />

  return (
    <div className="list-group" ref={sortableElemRef}>
      {items.map(renderItem)}
    </div>
  )

}


function TodoItem(props) {
  const { id, isCompleted, isEditing, text } = props

  const [localText, setLocalText] = useState(text)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleComplete = (evt) => {
    props.onToggleComplete(id, !isCompleted)
    evt.preventDefault()
    evt.stopPropagation() // do not call handleEdit
  }

  const handleEdit = () => {
    props.onEdit(id)
  }

  const handleDelete = (evt) => {
    props.onTextChange(id, '')
    evt.stopPropagation() // do not call handleEdit
  }

  const handleSubmit = () => {
    // Hack to avoid Firefox getting back into editing when
    // pressing "Enter".
    // setTimeout(() => this.setState({isEditing: false}), 0)

    props.onTextChange(id, localText)
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

  $.get(`/api/notes/${initialData.noteName}`)
    .then((data, textStatus, jqXHR) => {
      const lastModifiedHeader = jqXHR.getResponseHeader("Last-Modified")
      const lastVersion = new Date(lastModifiedHeader)
      const noteText = data.note_content || ''

      const todoDiv = document.getElementById("todo_app")
      ReactDOM.render(
        <TodoApp
          noteName={initialData.noteName}
          lastVersion={lastVersion}
          data={noteText}
          appHandleCallback={handle => window.todoApp = handle}
        />,
        todoDiv
      )
    })
})
