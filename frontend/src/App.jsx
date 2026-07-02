import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { API_BASE_URL, API_VERSION, API_VERSION_HEADER } from './config.js'
import {
  beginKeycloakLogin,
  completeKeycloakLogin,
  createKeycloakLogoutUrl,
  isTokenExpired,
  refreshKeycloakAuth,
} from './keycloakAuth.js'

const DEFAULT_PRIORITY = 'Mittel'
const PRIORITIES = ['Niedrig', 'Mittel', 'Hoch']
const KEYCLOAK_ROLE_ORDER = ['todo-user', 'todo-admin']
const POLLING_INTERVAL_MS = 10000
const AUTH_TOKEN_KEY = 'todo.auth.token'
const AUTH_REFRESH_TOKEN_KEY = 'todo.auth.refreshToken'
const AUTH_ID_TOKEN_KEY = 'todo.auth.idToken'
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

const removeStoredAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY)
  localStorage.removeItem(AUTH_ID_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
}

const getStoredAuth = () => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY)
  const refreshToken = localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) || ''
  const idToken = localStorage.getItem(AUTH_ID_TOKEN_KEY) || ''
  const userJson = localStorage.getItem(AUTH_USER_KEY)

  if (!token || !userJson) {
    return { token: '', refreshToken: '', idToken: '', user: null }
  }

  try {
    return { token, refreshToken, idToken, user: JSON.parse(userJson) }
  } catch {
    removeStoredAuth()
    return { token: '', refreshToken: '', idToken: '', user: null }
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
  const [authReady, setAuthReady] = useState(false)
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

  const isAuthenticated = authReady && Boolean(auth.token)
  const activeList = lists.find(list => String(list.id) === String(activeListId))
  const canCreateInvite = activeList?.role === 'OWNER'
  const authDetails = useMemo(() => {
    if (!auth.user) {
      return []
    }

    const visibleRoles = (auth.user.roles || [])
      .filter(role => role.startsWith('todo-'))
      .sort((leftRole, rightRole) => {
        const leftIndex = KEYCLOAK_ROLE_ORDER.indexOf(leftRole)
        const rightIndex = KEYCLOAK_ROLE_ORDER.indexOf(rightRole)

        if (leftIndex === -1 || rightIndex === -1) {
          return leftRole.localeCompare(rightRole)
        }

        return leftIndex - rightIndex
      })
    const groups = auth.user.groups || []

    return [
      auth.user.realm ? `Realm: ${auth.user.realm}` : '',
      auth.user.clientId ? `Client: ${auth.user.clientId}` : '',
      visibleRoles.length > 0 ? `Rollen: ${visibleRoles.join(', ')}` : '',
      groups.length > 0 ? `Gruppen: ${groups.join(', ')}` : '',
    ].filter(Boolean)
  }, [auth.user])

  const saveAuth = useCallback(data => {
    localStorage.setItem(AUTH_TOKEN_KEY, data.token)
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, data.refreshToken || '')
    localStorage.setItem(AUTH_ID_TOKEN_KEY, data.idToken || '')
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user))
    setAuth({
      token: data.token,
      refreshToken: data.refreshToken || '',
      idToken: data.idToken || '',
      user: data.user,
    })
  }, [])

  const clearSession = useCallback(() => {
    removeStoredAuth()
    setAuth({ token: '', refreshToken: '', idToken: '', user: null })
    setLists([])
    setTodos([])
    setActiveListId('')
    setGeneratedInviteLink('')
  }, [])

  useEffect(() => {
    let isMounted = true

    const applyInviteFromReturnPath = returnTo => {
      const queryStart = returnTo.indexOf('?')

      if (queryStart < 0) {
        return
      }

      const returnedInviteToken = new URLSearchParams(returnTo.slice(queryStart)).get('invite')

      if (returnedInviteToken) {
        setInviteToken(returnedInviteToken)
      }
    }

    const initializeAuth = async () => {
      try {
        const callbackAuth = await completeKeycloakLogin()

        if (!isMounted) {
          return
        }

        if (callbackAuth) {
          saveAuth(callbackAuth)
          applyInviteFromReturnPath(callbackAuth.returnTo)
          window.history.replaceState({}, '', callbackAuth.returnTo || '/')
          setAppMessage(`Angemeldet als ${callbackAuth.user.username}`)
          return
        }

        const storedAuth = getStoredAuth()

        if (storedAuth.token && storedAuth.refreshToken && isTokenExpired(storedAuth.token)) {
          const refreshedAuth = await refreshKeycloakAuth(storedAuth.refreshToken)

          if (isMounted) {
            saveAuth(refreshedAuth)
          }
        } else if (storedAuth.token) {
          setAuth(storedAuth)
        }
      } catch (error) {
        if (isMounted) {
          clearSession()
          setAuthError(error.message)
          window.history.replaceState({}, '', window.location.pathname)
        }
      } finally {
        if (isMounted) {
          setAuthReady(true)
        }
      }
    }

    initializeAuth()

    return () => {
      isMounted = false
    }
  }, [clearSession, saveAuth])

  const request = useCallback(
    async (path, options = {}) => {
      const headers = {
        [API_VERSION_HEADER]: API_VERSION,
        ...(options.headers || {}),
      }

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

  useEffect(() => {
    if (!isAuthenticated) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      loadLists().catch(error => setAppError(error.message))

      if (activeListId) {
        loadTodos(activeListId).catch(error => setAppError(error.message))
      }
    }, POLLING_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [activeListId, isAuthenticated, loadLists, loadTodos])

  const filteredTodos = useMemo(() => {
    const normalizedFilter = filterText.trim().toLowerCase()

    return todos.filter(todo => {
      const description = todo.taskdescription || ''
      const descriptionMatches = description.toLowerCase().includes(normalizedFilter)
      const priorityMatches = filterPriority === 'Alle' || getPriority(todo) === filterPriority

      return descriptionMatches && priorityMatches
    })
  }, [filterPriority, filterText, todos])

  const handleKeycloakLogin = async () => {
    setAuthError('')

    try {
      await beginKeycloakLogin(`${window.location.pathname}${window.location.search}`)
    } catch (error) {
      setAuthError(error.message)
    }
  }

  const handleLogout = () => {
    const logoutUrl = createKeycloakLogoutUrl(auth.idToken)
    clearSession()
    window.location.assign(logoutUrl)
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

  if (!authReady) {
    return (
      <main className="app auth-view">
        <section className="auth-panel" aria-label="Anmeldung">
          <h1>Todo App</h1>
          <p className="info-message">Anmeldung wird geprüft.</p>
        </section>
      </main>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="app auth-view">
        <section className="auth-panel" aria-label="Anmeldung">
          <h1>Todo App</h1>
          <div className="auth-form">
            {authError && <p className="error-message">{authError}</p>}
            {inviteToken && (
              <p className="info-message">
                Nach der Anmeldung kannst du die geteilte Liste annehmen.
              </p>
            )}
            <button type="button" onClick={handleKeycloakLogin}>
              Mit Keycloak anmelden
            </button>
          </div>
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
          {authDetails.length > 0 && <p>{authDetails.join(' | ')}</p>}
        </div>
        <button type="button" className="secondary-button" onClick={handleLogout}>
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
