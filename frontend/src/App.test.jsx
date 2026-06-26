import { afterEach, describe, expect, jest, test } from '@jest/globals'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App.jsx'

const AUTH_TOKEN_KEY = 'todo.auth.token'
const AUTH_USER_KEY = 'todo.auth.user'

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
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ id: 1, username: 'lisa' }))
}

afterEach(() => {
  jest.clearAllMocks()
  localStorage.clear()
  window.history.replaceState({}, '', '/')
})

describe('App', () => {
  test('meldet Benutzer an und speichert die Sitzung', async () => {
    const user = userEvent.setup()
    const fetchMock = mockFetch(url => {
      if (String(url).endsWith('/api/auth/login')) {
        return jsonResponse({ token: 'jwt-token', userId: 5, username: 'lisa' })
      }

      if (String(url).endsWith('/api/lists')) {
        return jsonResponse([])
      }

      return jsonResponse({ message: 'Nicht gefunden' }, 404)
    })

    render(<App />)

    await user.type(screen.getByLabelText('Benutzername'), 'lisa')
    await user.type(screen.getByLabelText('Passwort'), 'geheim')
    await user.click(screen.getByRole('button', { name: 'Einloggen' }))

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        'http://localhost:8080/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-API-Version': '1',
          }),
          body: JSON.stringify({ username: 'lisa', password: 'geheim' }),
        }),
      ),
    )
    expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('jwt-token')
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
})
