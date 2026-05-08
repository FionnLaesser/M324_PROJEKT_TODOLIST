import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8080'
const DEFAULT_PRIORITY = 'Mittel'
const PRIORITIES = ['Niedrig', 'Mittel', 'Hoch']

function App() {
  const [todos, setTodos] = useState([])
  const [taskdescription, setTaskdescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState(DEFAULT_PRIORITY)
  const [editingTask, setEditingTask] = useState(null)
  const [editTaskdescription, setEditTaskdescription] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editPriority, setEditPriority] = useState(DEFAULT_PRIORITY)
  const [filterText, setFilterText] = useState('')
  const [filterPriority, setFilterPriority] = useState('Alle')

  const getPriority = todo => todo.priority || DEFAULT_PRIORITY

  const loadTasks = () => {
    fetch(`${API_URL}/`)
      .then(response => response.json())
      .then(data => setTodos(data))
      .catch(error => console.log(error))
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const filteredTodos = useMemo(() => {
    const normalizedFilter = filterText.trim().toLowerCase()

    return todos.filter(todo => {
      const descriptionMatches = todo.taskdescription.toLowerCase().includes(normalizedFilter)
      const priorityMatches = filterPriority === 'Alle' || getPriority(todo) === filterPriority

      return descriptionMatches && priorityMatches
    })
  }, [filterPriority, filterText, todos])

  const createTaskPayload = (description, date, taskPriority) => ({
    taskdescription: description.trim(),
    dueDate: date,
    priority: taskPriority || DEFAULT_PRIORITY,
  })

  const handleSubmit = event => {
    event.preventDefault()

    if (!taskdescription.trim()) {
      return
    }

    fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createTaskPayload(taskdescription, dueDate, priority)),
    })
      .then(() => {
        setTaskdescription('')
        setDueDate('')
        setPriority(DEFAULT_PRIORITY)
        loadTasks()
      })
      .catch(error => console.log(error))
  }

  const handleDelete = taskdescriptionToDelete => {
    fetch(`${API_URL}/delete`, {
      method: 'POST',
      body: JSON.stringify({ taskdescription: taskdescriptionToDelete }),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(() => loadTasks())
      .catch(error => console.log(error))
  }

  const startEditing = todo => {
    setEditingTask(todo.taskdescription)
    setEditTaskdescription(todo.taskdescription)
    setEditDueDate(todo.dueDate || '')
    setEditPriority(getPriority(todo))
  }

  const cancelEditing = () => {
    setEditingTask(null)
    setEditTaskdescription('')
    setEditDueDate('')
    setEditPriority(DEFAULT_PRIORITY)
  }

  const handleUpdate = event => {
    event.preventDefault()

    if (!editTaskdescription.trim()) {
      return
    }

    fetch(`${API_URL}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldTaskdescription: editingTask,
        ...createTaskPayload(editTaskdescription, editDueDate, editPriority),
      }),
    })
      .then(() => {
        cancelEditing()
        loadTasks()
      })
      .catch(error => console.log(error))
  }

  const resetFilter = () => {
    setFilterText('')
    setFilterPriority('Alle')
  }

  const renderTaskContent = todo => {
    if (editingTask === todo.taskdescription) {
      return (
        <form className="edit-form" onSubmit={handleUpdate}>
          <input
            aria-label="Task bearbeiten"
            type="text"
            value={editTaskdescription}
            onChange={event => setEditTaskdescription(event.target.value)}
          />
          <input
            aria-label="Fälligkeitsdatum bearbeiten"
            type="date"
            value={editDueDate}
            onChange={event => setEditDueDate(event.target.value)}
          />
          <select
            aria-label="Priorität bearbeiten"
            value={editPriority}
            onChange={event => setEditPriority(event.target.value)}
          >
            {PRIORITIES.map(priorityOption => (
              <option key={priorityOption} value={priorityOption}>
                {priorityOption}
              </option>
            ))}
          </select>
          <div className="task-actions">
            <button type="submit">Speichern</button>
            <button type="button" onClick={cancelEditing}>
              Abbrechen
            </button>
          </div>
        </form>
      )
    }

    return (
      <>
        <div className="task-info">
          <span className="task-title">{todo.taskdescription}</span>
          <span className="task-meta">Fällig: {todo.dueDate || 'Kein Datum'}</span>
          <span className={`priority priority-${getPriority(todo).toLowerCase()}`}>
            {getPriority(todo)}
          </span>
        </div>
        <div className="task-actions">
          <button type="button" onClick={() => startEditing(todo)}>
            Bearbeiten
          </button>
          <button type="button" onClick={() => handleDelete(todo.taskdescription)}>
            Erledigt
          </button>
        </div>
      </>
    )
  }

  return (
    <main className="app">
      <section className="todo-shell">
        <h1>ToDo Liste</h1>

        <form onSubmit={handleSubmit} className="todo-form">
          <label>
            Neues Todo
            <input
              type="text"
              value={taskdescription}
              onChange={event => setTaskdescription(event.target.value)}
            />
          </label>
          <label>
            Fälligkeitsdatum
            <input
              type="date"
              value={dueDate}
              onChange={event => setDueDate(event.target.value)}
            />
          </label>
          <label>
            Priorität
            <select value={priority} onChange={event => setPriority(event.target.value)}>
              {PRIORITIES.map(priorityOption => (
                <option key={priorityOption} value={priorityOption}>
                  {priorityOption}
                </option>
              ))}
            </select>
          </label>
          <button type="submit">Absenden</button>
        </form>

        <div className="filter-bar">
          <label>
            Filter
            <input
              type="search"
              value={filterText}
              onChange={event => setFilterText(event.target.value)}
              placeholder="Task suchen"
            />
          </label>
          <label>
            Priorität
            <select value={filterPriority} onChange={event => setFilterPriority(event.target.value)}>
              <option value="Alle">Alle</option>
              {PRIORITIES.map(priorityOption => (
                <option key={priorityOption} value={priorityOption}>
                  {priorityOption}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={resetFilter}>
            Zurücksetzen
          </button>
        </div>

        <ul className="todo-list">
          {filteredTodos.map((todo, index) => (
            <li key={todo.taskdescription} className="todo-item">
              <span className="task-number">Task {index + 1}</span>
              {renderTaskContent(todo)}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}

export default App
