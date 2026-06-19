import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { API_BASE_URL } from './config.js'

const DEFAULT_PRIORITY = 'Mittel'
const PRIORITIES = ['Niedrig', 'Mittel', 'Hoch']
const AUTH_TOKEN_KEY = 'todo.auth.token'
const AUTH_USER_KEY = 'todo.auth.user'

const emptyTodoForm = {
  taskdescription: '',
  dueDate: '',
  priority: DEFAULT_PRIORITY,
}

const getInitialInviteToken = () => {
  const params = new URLSearchParams(window.location.search)
  return params.get('invite') || ''
}

const extractInviteToken = value => {
  const trimmedValue = value.trim()

  if (!trimmedValue.includes('invite=')) {
    return trimmedValue
  }

  try {
    return new URL(trimmedValue).searchParams.get('invite') || ''
  } catch {
    const queryStart = trimmedValue.indexOf('?')
    const query = queryStart >= 0 ? trimmedValue.slice(queryStart) : trimmedValue
    return new URLSearchParams(query).get('invite') || ''
  }
}

const getStoredAuth = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  const userJson = localStorage.getItem(AUTH_USER_KEY)

  if (!token || !userJson) {
    return { token: '', user: null }
  }

  try {
    return { token, user: JSON.parse(userJson) }
  } catch {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    return { token: '', user: null }
  }
}

const getPriority = todo => todo.priority || DEFAULT_PRIORITY

const getErrorMessage = payload => {
  if (!payload) {
    return 'Anfrage fehlgeschlagen'
  }

  if (Array.isArray(payload.details) && payload.details.length > 0) {
    return payload.details.join(', ')
  }

  return payload.message || 'Anfrage fehlgeschlagen'
}

function App() {
  const [auth, setAuth] = useState(getStoredAuth)
  const [authMode, setAuthMode] = useState('login')
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [authError, setAuthError] = useState('')

  const [lists, setLists] = useState([])
  const [activeListId, setActiveListId] = useState('')
  const [newListName, setNewListName] = useState('')
  const [inviteToken, setInviteToken] = useState(getInitialInviteToken)
  const [manualInviteToken, setManualInviteToken] = useState('')
  const [generatedInviteLink, setGeneratedInviteLink] = useState('')

  const [todos, setTodos] = useState([])
  const [todoForm, setTodoForm] = useState(emptyTodoForm)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editForm, setEditForm] = useState(emptyTodoForm)
  const [filterText, setFilterText] = useState('')
  const [filterPriority, setFilterPriority] = useState('Alle')
  const [appMessage, setAppMessage] = useState('')
  const [appError, setAppError] = useState('')

  const isAuthenticated = Boolean(auth.token)
  const activeList = lists.find(list => String(list.id) === String(activeListId))
  const canCreateInvite = activeList?.role === 'OWNER'

  const clearSession = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    setAuth({ token: '', user: null })
    setLists([])
    setTodos([])
    setActiveListId('')
    setGeneratedInviteLink('')
  }, [])

  const request = useCallback(
    async (path, options = {}) => {
      const headers = { ...(options.headers || {}) }

      if (options.body !== undefined) {
        headers['Content-Type'] = 'application/json'
      }

      if (auth.token) {
        headers.Authorization = `Bearer ${auth.token}`
      }

      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers,
      })
      const contentType = response.headers.get('content-type') || ''
      const payload = contentType.includes('application/json') ? await response.json() : null

      if (response.status === 401 && !path.startsWith('/auth/')) {
        clearSession()
        throw new Error('Sitzung abgelaufen')
      }

      if (!response.ok) {
        throw new Error(getErrorMessage(payload))
      }

      return payload
    },
    [auth.token, clearSession],
  )

  const loadLists = useCallback(async () => {
    const data = await request('/lists')
    setLists(data)
    setActiveListId(current =>
      data.some(list => String(list.id) === String(current)) ? current : String(data[0]?.id || ''),
    )
    return data
  }, [request])

  const loadTodos = useCallback(
    async listId => {
      if (!listId) {
        setTodos([])
        return
      }

      const data = await request(`/lists/${listId}/todos`)
      setTodos(data)
    },
    [request],
  )

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    loadLists().catch(error => setAppError(error.message))
  }, [isAuthenticated, loadLists])

  useEffect(() => {
    if (!isAuthenticated || !activeListId) {
      return
    }

    loadTodos(activeListId).catch(error => setAppError(error.message))
  }, [activeListId, isAuthenticated, loadTodos])

  const filteredTodos = useMemo(() => {
    const normalizedFilter = filterText.trim().toLowerCase()

    return todos.filter(todo => {
      const description = todo.taskdescription || ''
      const descriptionMatches = description.toLowerCase().includes(normalizedFilter)
      const priorityMatches = filterPriority === 'Alle' || getPriority(todo) === filterPriority

      return descriptionMatches && priorityMatches
    })
  }, [filterPriority, filterText, todos])

  const saveAuth = data => {
    const user = { id: data.userId, username: data.username }
    localStorage.setItem(AUTH_TOKEN_KEY, data.token)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    setAuth({ token: data.token, user })
  }

  const handleAuthSubmit = async event => {
    event.preventDefault()
    setAuthError('')

    try {
      const path = authMode === 'login' ? '/auth/login' : '/auth/register'
      const data = await request(path, {
        method: 'POST',
        body: JSON.stringify(credentials),
      })

      saveAuth(data)
      setCredentials({ username: '', password: '' })
      setAppMessage(`Angemeldet als ${data.username}`)
    } catch (error) {
      setAuthError(error.message)
    }
  }

  const handleCreateList = async event => {
    event.preventDefault()
    setAppError('')
    setAppMessage('')

    try {
      const list = await request('/lists', {
        method: 'POST',
        body: JSON.stringify({ name: newListName }),
      })
      setNewListName('')
      await loadLists()
      setActiveListId(String(list.id))
      setAppMessage('Liste erstellt')
    } catch (error) {
      setAppError(error.message)
    }
  }

  const handleCreateInvite = async () => {
    if (!activeListId) {
      return
    }

    setAppError('')
    setAppMessage('')

    try {
      const invite = await request(`/lists/${activeListId}/invites`, { method: 'POST' })
      const url = `${window.location.origin}${window.location.pathname}?invite=${encodeURIComponent(
        invite.inviteToken,
      )}`
      setGeneratedInviteLink(url)
      setAppMessage('Einladungslink erstellt')
    } catch (error) {
      setAppError(error.message)
    }
  }

  const handleJoinInvite = async tokenToJoin => {
    const normalizedToken = tokenToJoin.trim()

    if (!normalizedToken) {
      setAppError('Einladungstoken fehlt')
      return
    }

    setAppError('')
    setAppMessage('')

    try {
      const list = await request(`/invitations/${encodeURIComponent(normalizedToken)}/join`, {
        method: 'POST',
      })
      await loadLists()
      setActiveListId(String(list.id))
      setInviteToken('')
      setManualInviteToken('')
      window.history.replaceState({}, '', window.location.pathname)
      setAppMessage('Einladung angenommen')
    } catch (error) {
      setAppError(error.message)
    }
  }

  const createTaskPayload = form => ({
    taskdescription: form.taskdescription.trim(),
    dueDate: form.dueDate,
    priority: form.priority || DEFAULT_PRIORITY,
  })

  const handleSubmit = async event => {
    event.preventDefault()

    if (!todoForm.taskdescription.trim() || !activeListId) {
      return
    }

    setAppError('')
    setAppMessage('')

    try {
      await request(`/lists/${activeListId}/todos`, {
        method: 'POST',
        body: JSON.stringify(createTaskPayload(todoForm)),
      })
      setTodoForm(emptyTodoForm)
      await loadTodos(activeListId)
    } catch (error) {
      setAppError(error.message)
    }
  }

  const handleDelete = async todoId => {
    setAppError('')
    setAppMessage('')

    try {
      await request(`/lists/${activeListId}/todos/${todoId}`, { method: 'DELETE' })
      await loadTodos(activeListId)
    } catch (error) {
      setAppError(error.message)
    }
  }

  const startEditing = todo => {
    setEditingTaskId(todo.id)
    setEditForm({
      taskdescription: todo.taskdescription,
      dueDate: todo.dueDate || '',
      priority: getPriority(todo),
    })
  }

  const cancelEditing = () => {
    setEditingTaskId(null)
    setEditForm(emptyTodoForm)
  }

  const handleUpdate = async event => {
    event.preventDefault()

    if (!editForm.taskdescription.trim() || !activeListId || !editingTaskId) {
      return
    }

    setAppError('')
    setAppMessage('')

    try {
      await request(`/lists/${activeListId}/todos/${editingTaskId}`, {
        method: 'PUT',
        body: JSON.stringify(createTaskPayload(editForm)),
      })
      cancelEditing()
      await loadTodos(activeListId)
    } catch (error) {
      setAppError(error.message)
    }
  }

  const resetFilter = () => {
    setFilterText('')
    setFilterPriority('Alle')
  }

  const getEmptyMessage = () => {
    if (!activeListId) {
      return 'Wähle oder erstelle zuerst eine Liste.'
    }

    if (todos.length === 0) {
      return 'Noch keine Todos vorhanden.'
    }

    return 'Keine Todos passen zum aktuellen Filter.'
  }

  const renderTaskContent = todo => {
    if (editingTaskId === todo.id) {
      return (
        <form className="edit-form" onSubmit={handleUpdate}>
          <input
            aria-label="Todo bearbeiten"
            type="text"
            value={editForm.taskdescription}
            onChange={event => setEditForm({ ...editForm, taskdescription: event.target.value })}
          />
          <input
            aria-label="Fälligkeitsdatum bearbeiten"
            type="date"
            value={editForm.dueDate}
            onChange={event => setEditForm({ ...editForm, dueDate: event.target.value })}
          />
          <select
            aria-label="Priorität bearbeiten"
            value={editForm.priority}
            onChange={event => setEditForm({ ...editForm, priority: event.target.value })}
          >
            {PRIORITIES.map(priorityOption => (
              <option key={priorityOption} value={priorityOption}>
                {priorityOption}
              </option>
            ))}
          </select>
          <div className="task-actions">
            <button type="submit">Speichern</button>
            <button type="button" className="secondary-button" onClick={cancelEditing}>
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
          <button type="button" className="secondary-button" onClick={() => startEditing(todo)}>
            Bearbeiten
          </button>
          <button type="button" onClick={() => handleDelete(todo.id)}>
            Erledigt
          </button>
        </div>
      </>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="app auth-view">
        <section className="auth-panel" aria-label="Anmeldung">
          <h1>Todo App</h1>
          <div className="auth-tabs" role="tablist" aria-label="Authentifizierung">
            <button
              type="button"
              className={authMode === 'login' ? 'tab-button active' : 'tab-button'}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'tab-button active' : 'tab-button'}
              onClick={() => setAuthMode('register')}
            >
              Registrierung
            </button>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <label>
              Benutzername
              <input
                type="text"
                autoComplete="username"
                value={credentials.username}
                onChange={event => setCredentials({ ...credentials, username: event.target.value })}
              />
            </label>
            <label>
              Passwort
              <input
                type="password"
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                value={credentials.password}
                onChange={event => setCredentials({ ...credentials, password: event.target.value })}
              />
            </label>
            {authError && <p className="error-message">{authError}</p>}
            {inviteToken && (
              <p className="info-message">
                Nach der Anmeldung kannst du die geteilte Liste annehmen.
              </p>
            )}
            <button type="submit">{authMode === 'login' ? 'Einloggen' : 'Registrieren'}</button>
          </form>
        </section>
      </main>
    )
  }

  return (
    <main className="app">
      <header className="app-header">
        <div>
          <h1>ToDo Listen</h1>
          <p>Angemeldet als {auth.user?.username}</p>
        </div>
        <button type="button" className="secondary-button" onClick={clearSession}>
          Logout
        </button>
      </header>

      {(appError || appMessage) && (
        <div className={appError ? 'banner error-message' : 'banner info-message'}>
          {appError || appMessage}
        </div>
      )}

      <div className="workspace">
        <aside className="list-panel" aria-label="Todo-Listen">
          <form className="list-form" onSubmit={handleCreateList}>
            <label>
              Neue Liste
              <input
                type="text"
                value={newListName}
                onChange={event => setNewListName(event.target.value)}
                placeholder="Listenname"
              />
            </label>
            <button type="submit">Erstellen</button>
          </form>

          <div className="list-selector">
            {lists.map(list => (
              <button
                key={list.id}
                type="button"
                className={String(list.id) === String(activeListId) ? 'list-button active' : 'list-button'}
                onClick={() => {
                  setActiveListId(String(list.id))
                  setGeneratedInviteLink('')
                }}
              >
                <span>{list.name}</span>
                <small>{list.role === 'OWNER' ? 'Besitzer' : 'Mitglied'}</small>
              </button>
            ))}
          </div>

          <div className="join-panel">
            <label>
              Einladung
              <input
                type="text"
                value={manualInviteToken || inviteToken}
                onChange={event => {
                  setManualInviteToken(event.target.value)
                  setInviteToken('')
                }}
                placeholder="Token oder Link"
              />
            </label>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                const rawValue = manualInviteToken || inviteToken
                handleJoinInvite(extractInviteToken(rawValue))
              }}
            >
              Annehmen
            </button>
          </div>
        </aside>

        <section className="todo-shell">
          <div className="list-header">
            <div>
              <h2>{activeList?.name || 'Keine Liste'}</h2>
              {activeList && (
                <p>
                  Besitzer: {activeList.ownerUsername}, Rolle:{' '}
                  {activeList.role === 'OWNER' ? 'Besitzer' : 'Mitglied'}
                </p>
              )}
            </div>
            {canCreateInvite && (
              <button type="button" className="secondary-button" onClick={handleCreateInvite}>
                Einladungslink
              </button>
            )}
          </div>

          {generatedInviteLink && (
            <label className="invite-link">
              Link
              <input type="text" readOnly value={generatedInviteLink} />
            </label>
          )}

          <form onSubmit={handleSubmit} className="todo-form">
            <label>
              Neues Todo
              <input
                type="text"
                value={todoForm.taskdescription}
                onChange={event => setTodoForm({ ...todoForm, taskdescription: event.target.value })}
                disabled={!activeListId}
              />
            </label>
            <label>
              Fälligkeitsdatum
              <input
                type="date"
                value={todoForm.dueDate}
                onChange={event => setTodoForm({ ...todoForm, dueDate: event.target.value })}
                disabled={!activeListId}
              />
            </label>
            <label>
              Priorität
              <select
                value={todoForm.priority}
                onChange={event => setTodoForm({ ...todoForm, priority: event.target.value })}
                disabled={!activeListId}
              >
                {PRIORITIES.map(priorityOption => (
                  <option key={priorityOption} value={priorityOption}>
                    {priorityOption}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={!activeListId}>
              Absenden
            </button>
          </form>

          <div className="filter-bar">
            <label>
              Filter
              <input
                type="search"
                value={filterText}
                onChange={event => setFilterText(event.target.value)}
                placeholder="Todo suchen"
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
            <button type="button" className="secondary-button" onClick={resetFilter}>
              Zurücksetzen
            </button>
          </div>

          <ul className="todo-list">
            {filteredTodos.length === 0 ? (
              <li className="todo-empty">{getEmptyMessage()}</li>
            ) : (
              filteredTodos.map((todo, index) => (
                <li key={todo.id} className="todo-item">
                  <span className="task-number">Todo {index + 1}</span>
                  {renderTaskContent(todo)}
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </main>
  )
}

export default App
