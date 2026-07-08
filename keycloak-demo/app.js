const CONFIG = {
  keycloakUrl: 'http://localhost:8081',
  realm: 'todo-app',
  clientId: 'todo-frontend',
  apiBaseUrl: 'http://localhost:8080/api',
}

const STORAGE = {
  state: 'todo.demo.keycloak.state',
  verifier: 'todo.demo.keycloak.verifier',
  accessToken: 'todo.demo.auth.accessToken',
  refreshToken: 'todo.demo.auth.refreshToken',
  idToken: 'todo.demo.auth.idToken',
}

const realmUrl = `${CONFIG.keycloakUrl}/realms/${CONFIG.realm}`
const elements = {}

const getRedirectUri = () => `${window.location.origin}${window.location.pathname}`

const query = selector => document.querySelector(selector)

const setText = (id, value) => {
  elements[id].textContent = value || '-'
}

const base64UrlEncode = bytes => {
  const binary = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

const decodeBase64Url = value => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = Array.from(binary, char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
  return decodeURIComponent(bytes.join(''))
}

const decodeJwtPayload = token => {
  try {
    const payload = token.split('.')[1]
    return payload ? JSON.parse(decodeBase64Url(payload)) : {}
  } catch {
    return {}
  }
}

const createRandomString = () => {
  const bytes = new Uint8Array(32)
  window.crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

const createCodeChallenge = async verifier => {
  const data = new TextEncoder().encode(verifier)
  const digest = await window.crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(digest)
}

const readErrorMessage = async response => {
  try {
    const payload = await response.json()
    return payload.error_description || payload.error || payload.message || response.statusText
  } catch {
    return response.statusText
  }
}

const requestToken = async body => {
  const response = await fetch(`${realmUrl}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CONFIG.clientId,
      ...body,
    }),
  })

  if (!response.ok) {
    throw new Error(await readErrorMessage(response))
  }

  return response.json()
}

const saveSession = tokenResponse => {
  localStorage.setItem(STORAGE.accessToken, tokenResponse.access_token || '')
  localStorage.setItem(STORAGE.refreshToken, tokenResponse.refresh_token || '')
  localStorage.setItem(STORAGE.idToken, tokenResponse.id_token || '')
}

const clearSession = () => {
  Object.values(STORAGE).forEach(key => {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  })
}

const getSession = () => ({
  accessToken: localStorage.getItem(STORAGE.accessToken) || '',
  refreshToken: localStorage.getItem(STORAGE.refreshToken) || '',
  idToken: localStorage.getItem(STORAGE.idToken) || '',
})

const setBackendResult = (message, status = '') => {
  elements.backendResult.textContent = message
  elements.backendResult.classList.remove('ok', 'error')

  if (status) {
    elements.backendResult.classList.add(status)
  }
}

const renderSession = () => {
  const session = getSession()
  const accessPayload = decodeJwtPayload(session.accessToken)
  const idPayload = decodeJwtPayload(session.idToken)
  const profile = session.idToken ? idPayload : accessPayload
  const roles = accessPayload.realm_access?.roles || []
  const groups = profile.groups || accessPayload.groups || []
  const expiry = accessPayload.exp
    ? new Date(accessPayload.exp * 1000).toLocaleString('de-CH')
    : '-'

  const isAuthenticated = Boolean(session.accessToken)

  elements.authTitle.textContent = isAuthenticated ? 'Angemeldet' : 'Nicht angemeldet'
  elements.authMessage.textContent = isAuthenticated
    ? 'Dieser Login läuft über denselben Keycloak Realm und Client wie die Todo App.'
    : 'Melde dich über Keycloak an, um die gemeinsamen Token-Daten zu sehen.'

  setText('userValue', profile.preferred_username || profile.name || '')
  setText('realmValue', CONFIG.realm)
  setText('clientValue', accessPayload.azp || CONFIG.clientId)
  setText('expiryValue', expiry)
  setText('rolesValue', roles.join(', '))
  setText('groupsValue', groups.join(', '))
  setText('issuerValue', accessPayload.iss || '')

  elements.loginButton.disabled = isAuthenticated
  elements.logoutButton.disabled = !isAuthenticated
  elements.refreshButton.disabled = !isAuthenticated || !session.refreshToken
}

const beginLogin = async () => {
  const state = createRandomString()
  const verifier = createRandomString()
  const challenge = await createCodeChallenge(verifier)

  sessionStorage.setItem(STORAGE.state, state)
  sessionStorage.setItem(STORAGE.verifier, verifier)

  const params = new URLSearchParams({
    client_id: CONFIG.clientId,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'openid profile email roles',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  window.location.assign(`${realmUrl}/protocol/openid-connect/auth?${params}`)
}

const completeLoginIfNeeded = async () => {
  const params = new URLSearchParams(window.location.search)
  const error = params.get('error')
  const code = params.get('code')
  const state = params.get('state')

  if (!error && !code) {
    return
  }

  if (error) {
    throw new Error(params.get('error_description') || 'Keycloak Anmeldung abgebrochen')
  }

  const expectedState = sessionStorage.getItem(STORAGE.state)
  const verifier = sessionStorage.getItem(STORAGE.verifier)

  if (!expectedState || state !== expectedState || !verifier) {
    throw new Error('Keycloak Antwort ist ungültig')
  }

  const tokenResponse = await requestToken({
    grant_type: 'authorization_code',
    code,
    code_verifier: verifier,
    redirect_uri: getRedirectUri(),
  })

  saveSession(tokenResponse)
  sessionStorage.removeItem(STORAGE.state)
  sessionStorage.removeItem(STORAGE.verifier)
  window.history.replaceState({}, '', window.location.pathname)
}

const refreshSession = async () => {
  const session = getSession()

  if (!session.refreshToken) {
    return
  }

  const tokenResponse = await requestToken({
    grant_type: 'refresh_token',
    refresh_token: session.refreshToken,
  })

  saveSession({
    ...tokenResponse,
    refresh_token: tokenResponse.refresh_token || session.refreshToken,
  })
  renderSession()
}

const logout = () => {
  const { idToken } = getSession()
  const params = new URLSearchParams({
    client_id: CONFIG.clientId,
    post_logout_redirect_uri: getRedirectUri(),
  })

  if (idToken) {
    params.set('id_token_hint', idToken)
  }

  clearSession()
  window.location.assign(`${realmUrl}/protocol/openid-connect/logout?${params}`)
}

const checkBackend = async () => {
  const session = getSession()
  setBackendResult('Prüfung läuft.')

  try {
    const versionResponse = await fetch(`${CONFIG.apiBaseUrl}/version`, {
      headers: {
        'X-API-Version': '1',
      },
    })

    if (!versionResponse.ok) {
      throw new Error(`Version Endpoint: HTTP ${versionResponse.status}`)
    }

    const versionPayload = await versionResponse.json()
    let protectedResult = 'Für den geschützten Listen-Endpunkt zuerst anmelden.'

    if (session.accessToken) {
      const listsResponse = await fetch(`${CONFIG.apiBaseUrl}/lists`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'X-API-Version': '1',
        },
      })

      if (!listsResponse.ok) {
        throw new Error(`Listen Endpoint: HTTP ${listsResponse.status}`)
      }

      const lists = await listsResponse.json()
      protectedResult = `${lists.length} Todo Listen mit demselben Token geladen.`
    }

    setBackendResult(
      [
        `Version Endpoint: ${versionPayload.message || 'OK'}`,
        `API Version: ${versionPayload.version || '1'}`,
        protectedResult,
      ].join('\n'),
      'ok',
    )
  } catch (error) {
    setBackendResult(`Backend Prüfung fehlgeschlagen: ${error.message}`, 'error')
  }
}

const cacheElements = () => {
  elements.authTitle = query('#auth-title')
  elements.authMessage = query('#auth-message')
  elements.loginButton = query('#login-button')
  elements.backendButton = query('#backend-button')
  elements.refreshButton = query('#refresh-button')
  elements.logoutButton = query('#logout-button')
  elements.backendResult = query('#backend-result')
  elements.userValue = query('#user-value')
  elements.realmValue = query('#realm-value')
  elements.clientValue = query('#client-value')
  elements.expiryValue = query('#expiry-value')
  elements.rolesValue = query('#roles-value')
  elements.groupsValue = query('#groups-value')
  elements.issuerValue = query('#issuer-value')
}

const init = async () => {
  cacheElements()

  elements.loginButton.addEventListener('click', beginLogin)
  elements.backendButton.addEventListener('click', checkBackend)
  elements.refreshButton.addEventListener('click', refreshSession)
  elements.logoutButton.addEventListener('click', logout)

  try {
    await completeLoginIfNeeded()
  } catch (error) {
    clearSession()
    setBackendResult(`Anmeldung fehlgeschlagen: ${error.message}`, 'error')
    window.history.replaceState({}, '', window.location.pathname)
  }

  renderSession()
}

init()
