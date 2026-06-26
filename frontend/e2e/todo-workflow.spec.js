import { expect, test } from '@playwright/test'

const corsHeaders = {
  'access-control-allow-headers': 'authorization, content-type',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-origin': '*',
}

const visibleDelay = Number(process.env.PLAYWRIGHT_VISIBLE_DELAY || 0)

const showProgress = async page => {
  if (visibleDelay > 0) {
    await page.waitForTimeout(visibleDelay)
  }
}

const readJson = request => {
  const body = request.postData()
  return body ? JSON.parse(body) : {}
}

const respondJson = (route, body, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    headers: corsHeaders,
    body: JSON.stringify(body),
  })

const respondEmpty = (route, status = 204) =>
  route.fulfill({
    status,
    headers: corsHeaders,
  })

const setupApiMock = async page => {
  let nextListId = 1
  let nextTodoId = 1
  let lists = []
  const todosByList = new Map()

  await page.route('**/api/v1/**', async route => {
    const request = route.request()
    const method = request.method()
    const path = new URL(request.url()).pathname

    if (method === 'OPTIONS') {
      return respondEmpty(route)
    }

    if (method === 'POST' && path === '/api/v1/auth/login') {
      return respondJson(route, { token: 'e2e-token', userId: 1, username: 'lisa' })
    }

    if (method === 'GET' && path === '/api/v1/lists') {
      return respondJson(route, lists)
    }

    if (method === 'POST' && path === '/api/v1/lists') {
      const body = readJson(request)
      const list = {
        id: nextListId,
        name: body.name,
        role: 'OWNER',
        ownerUsername: 'lisa',
      }
      nextListId += 1
      lists = [...lists, list]
      todosByList.set(String(list.id), [])
      return respondJson(route, list, 201)
    }

    const todosPath = path.match(/^\/api\/v1\/lists\/(\d+)\/todos$/)
    if (todosPath) {
      const listId = todosPath[1]

      if (method === 'GET') {
        return respondJson(route, todosByList.get(listId) || [])
      }

      if (method === 'POST') {
        const body = readJson(request)
        const todo = {
          id: nextTodoId,
          listId: Number(listId),
          taskdescription: body.taskdescription,
          dueDate: body.dueDate,
          priority: body.priority,
        }
        nextTodoId += 1
        todosByList.set(listId, [...(todosByList.get(listId) || []), todo])
        return respondJson(route, todo, 201)
      }
    }

    const todoPath = path.match(/^\/api\/v1\/lists\/(\d+)\/todos\/(\d+)$/)
    if (todoPath) {
      const [, listId, todoId] = todoPath
      const currentTodos = todosByList.get(listId) || []

      if (method === 'PUT') {
        const body = readJson(request)
        const updatedTodos = currentTodos.map(todo =>
          String(todo.id) === todoId
            ? {
                ...todo,
                taskdescription: body.taskdescription,
                dueDate: body.dueDate,
                priority: body.priority,
              }
            : todo,
        )
        todosByList.set(listId, updatedTodos)
        return respondJson(route, updatedTodos.find(todo => String(todo.id) === todoId))
      }

      if (method === 'DELETE') {
        todosByList.set(
          listId,
          currentTodos.filter(todo => String(todo.id) !== todoId),
        )
        return respondEmpty(route)
      }
    }

    return respondJson(route, { message: `Kein Mock für ${method} ${path}` }, 404)
  })
}

test.describe('sichtbare Frontend-Tests', () => {
  test('zeigt Login, Liste, Todo, Filter, Bearbeiten und Erledigen im Browser', async ({ page }) => {
    await setupApiMock(page)

    await test.step('Login Formular öffnen', async () => {
      await page.goto('/')
      await expect(page.getByRole('heading', { name: 'Todo App' })).toBeVisible()
      await showProgress(page)
    })

    await test.step('Benutzer anmelden', async () => {
      await page.getByLabel('Benutzername').fill('lisa')
      await page.getByLabel('Passwort').fill('geheim')
      await page.getByRole('button', { name: 'Einloggen' }).click()
      await expect(page.locator('.app-header')).toContainText('Angemeldet als lisa')
      await showProgress(page)
    })

    await test.step('Liste erstellen', async () => {
      await page.getByLabel('Neue Liste').fill('Schule')
      await page.getByRole('button', { name: 'Erstellen' }).click()
      await expect(page.getByRole('heading', { name: 'Schule' })).toBeVisible()
      await showProgress(page)
    })

    await test.step('Todo erfassen', async () => {
      const todoForm = page.locator('.todo-form')
      await todoForm.getByLabel('Neues Todo').fill('Playwright Test zeigen')
      await todoForm.getByLabel('Fälligkeitsdatum').fill('2026-06-20')
      await todoForm.getByLabel('Priorität').selectOption('Hoch')
      await todoForm.getByRole('button', { name: 'Absenden' }).click()
      await expect(page.getByText('Playwright Test zeigen')).toBeVisible()
      await showProgress(page)
    })

    await test.step('Todo filtern', async () => {
      const filterBar = page.locator('.filter-bar')
      await filterBar.getByLabel('Filter').fill('Playwright')
      await filterBar.getByLabel('Priorität').selectOption('Hoch')
      await expect(page.getByText('Playwright Test zeigen')).toBeVisible()
      await page.getByRole('button', { name: 'Zurücksetzen' }).click()
      await showProgress(page)
    })

    await test.step('Todo bearbeiten', async () => {
      await page.getByRole('button', { name: 'Bearbeiten' }).click()
      await page.getByLabel('Todo bearbeiten').fill('Playwright Test sichtbar zeigen')
      await page.getByLabel('Fälligkeitsdatum bearbeiten').fill('2026-06-21')
      await page.getByLabel('Priorität bearbeiten').selectOption('Mittel')
      await page.getByRole('button', { name: 'Speichern' }).click()
      await expect(page.getByText('Playwright Test sichtbar zeigen')).toBeVisible()
      await showProgress(page)
    })

    await test.step('Todo erledigen', async () => {
      await page.getByRole('button', { name: 'Erledigt' }).click()
      await expect(page.getByText('Playwright Test sichtbar zeigen')).toBeHidden()
      await expect(page.getByText('Noch keine Todos vorhanden.')).toBeVisible()
      await showProgress(page)
    })
  })
})
