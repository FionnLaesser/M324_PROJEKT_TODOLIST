import { afterEach, describe, expect, jest, test } from '@jest/globals'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App.jsx'

const AUTH_TOKEN_KEY = 'todo.auth.token'
const AUTH_REFRESH_TOKEN_KEY = 'todo.auth.refreshToken'
const AUTH_ID_TOKEN_KEY = 'todo.auth.idToken'
const AUTH_USER_KEY = 'todo.auth.user'
const KEYCLOAK_STATE_KEY = 'todo.keycloak.state'
const KEYCLOAK_VERIFIER_KEY = 'todo.keycloak.verifier'
const KEYCLOAK_RETURN_KEY = 'todo.keycloak.return'

const encodeBase64Url = value =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')

const createToken = payload => `${encodeBase64Url({ alg: 'RS256', typ: 'JWT' })}.${encodeBase64Url(payload)}.signature`

const jsonResponse = (body, status = 200) =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: name => (name.toLowerCase() === 'content-type' ? 'application/json' : ''),
    },
    json: () => Promise.resolve(body),
  })

const mockFetch = implementation => {
  globalThis.fetch = jest.fn(implementation)
  return globalThis.fetch
}

const setupAuthenticatedSession = () => {
  localStorage.setItem(AUTH_TOKEN_KEY, 'session-token')
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, 'refresh-token')
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ id: 1, username: 'lisa' }))
}

afterEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
  window.history.replaceState({}, '', '/')
})

describe('App', () => {
  test('verarbeitet Keycloak Callback und speichert die Sitzung', async () => {
    const accessToken = createToken({
      sub: 'keycloak-user-id',
      preferred_username: 'lisa',
      exp: Math.floor(Date.now() / 1000) + 300,
      realm_access: { roles: ['todo-user', 'todo-admin'] },
      groups: ['todo-gruppe'],
    })
    const idToken = createToken({
      sub: 'keycloak-user-id',
      preferred_username: 'lisa',
      exp: Math.floor(Date.now() / 1000) + 300,
    })

    localStorage.setItem(KEYCLOAK_STATE_KEY, 'callback-state')
    localStorage.setItem(KEYCLOAK_VERIFIER_KEY, 'code-verifier')
    localStorage.setItem(KEYCLOAK_RETURN_KEY, '/')
    window.history.replaceState({}, '', '/?code=auth-code&state=callback-state')

    const fetchMock = mockFetch(url => {
      if (String(url).includes('/realms/todo-app/protocol/openid-connect/token')) {
        return jsonResponse({
          access_token: accessToken,
          refresh_token: 'refresh-token',
          id_token: idToken,
        })
      }

      if (String(url).endsWith('/api/lists')) {
        return jsonResponse([])
      }

      return jsonResponse({ message: 'Nicht gefunden' }, 404)
    })

    render(<App />)

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8081/realms/todo-app/protocol/openid-connect/token',
        expect.objectContaining({ method: 'POST' }),
      ),
    )
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe(accessToken)
    expect(localStorage.getItem(AUTH_REFRESH_TOKEN_KEY)).toBe('refresh-token')
    expect(localStorage.getItem(AUTH_ID_TOKEN_KEY)).toBe(idToken)
    expect(await screen.findAllByText('Angemeldet als lisa')).toHaveLength(2)
  })

  test('filtert geladene Todos nach Priorität', async () => {
    setupAuthenticatedSession()
    const user = userEvent.setup()
    mockFetch(url => {
      if (String(url).endsWith('/api/lists')) {
        return jsonResponse([{ id: 10, name: 'Schule', role: 'OWNER', ownerUsername: 'lisa' }])
      }

      if (String(url).endsWith('/api/lists/10/todos')) {
        return jsonResponse([
          {
            id: 1,
            listId: 10,
            taskdescription: 'Mathe lernen',
            dueDate: '2026-06-15',
            priority: 'Hoch',
          },
          {
            id: 2,
            listId: 10,
            taskdescription: 'Deutsch lesen',
            dueDate: '',
            priority: 'Niedrig',
          },
        ])
      }

      return jsonResponse({ message: 'Nicht gefunden' }, 404)
    })

    render(<App />)

    expect(await screen.findByText('Mathe lernen')).toBeInTheDocument()
    expect(screen.getByText('Deutsch lesen')).toBeInTheDocument()

    const filterBar = screen.getByLabelText('Filter').closest('.filter-bar')
    const priorityFilter = within(filterBar).getByLabelText('Priorität')
    await user.selectOptions(priorityFilter, 'Hoch')

    expect(screen.getByText('Mathe lernen')).toBeInTheDocument()
    expect(screen.queryByText('Deutsch lesen')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Zurücksetzen' }))
    expect(screen.getByText('Deutsch lesen')).toBeInTheDocument()
  })

  test('aktualisiert geladene Daten per Polling', async () => {
    setupAuthenticatedSession()
    let pollCallback = null
    let todoRequests = 0
    const setIntervalSpy = jest.spyOn(window, 'setInterval').mockImplementation(callback => {
      pollCallback = callback
      return 123
    })
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval').mockImplementation(() => {})

    try {
      mockFetch(url => {
        if (String(url).endsWith('/api/lists')) {
          return jsonResponse([{ id: 10, name: 'Schule', role: 'OWNER', ownerUsername: 'lisa' }])
        }

        if (String(url).endsWith('/api/lists/10/todos')) {
          todoRequests += 1
          return jsonResponse([
            {
              id: 1,
              listId: 10,
              taskdescription: 'Mathe lernen',
              dueDate: '2026-06-15',
              priority: 'Hoch',
            },
            ...(todoRequests > 1
              ? [
                  {
                    id: 2,
                    listId: 10,
                    taskdescription: 'Polling sichtbar',
                    dueDate: '',
                    priority: 'Mittel',
                  },
                ]
              : []),
          ])
        }

        return jsonResponse({ message: 'Nicht gefunden' }, 404)
      })

      render(<App />)

      expect(await screen.findByText('Mathe lernen')).toBeInTheDocument()
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 10000)
      expect(pollCallback).toEqual(expect.any(Function))

      await act(async () => {
        pollCallback()
        await Promise.resolve()
      })

      expect(await screen.findByText('Polling sichtbar')).toBeInTheDocument()
    } finally {
      setIntervalSpy.mockRestore()
      clearIntervalSpy.mockRestore()
    }
  })
})
