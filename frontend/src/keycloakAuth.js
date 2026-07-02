import { KEYCLOAK_CLIENT_ID, KEYCLOAK_REALM, KEYCLOAK_URL } from './config.js'

export const KEYCLOAK_STATE_KEY = 'todo.keycloak.state'
export const KEYCLOAK_VERIFIER_KEY = 'todo.keycloak.verifier'
export const KEYCLOAK_RETURN_KEY = 'todo.keycloak.return'

const keycloakRealmUrl = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`

const base64UrlEncode = bytes => {
  const binary = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
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

const getRedirectUri = () => `${window.location.origin}${window.location.pathname}`

const decodeBase64Url = value => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
  const binary = atob(padded)
  const bytes = Array.from(binary, char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
  return decodeURIComponent(bytes.join(''))
}

export const decodeJwtPayload = token => {
  try {
    const payload = token.split('.')[1]
    return payload ? JSON.parse(decodeBase64Url(payload)) : {}
  } catch {
    return {}
  }
}

export const isTokenExpired = (token, skewSeconds = 30) => {
  const payload = decodeJwtPayload(token)

  if (!payload.exp) {
    return false
  }

  return payload.exp * 1000 <= Date.now() + skewSeconds * 1000
}

const createAuthFromTokenResponse = tokenResponse => {
  const accessToken = tokenResponse.access_token || ''
  const idToken = tokenResponse.id_token || ''
  const accessPayload = decodeJwtPayload(accessToken)
  const idPayload = decodeJwtPayload(idToken)
  const profilePayload = idToken ? idPayload : accessPayload
  const realmAccess = accessPayload.realm_access || idPayload.realm_access || {}

  return {
    token: accessToken,
    refreshToken: tokenResponse.refresh_token || '',
    idToken,
    user: {
      id: profilePayload.sub || '',
      username: profilePayload.preferred_username || profilePayload.name || 'keycloak-user',
      realm: KEYCLOAK_REALM,
      clientId: KEYCLOAK_CLIENT_ID,
      roles: realmAccess.roles || [],
      groups: profilePayload.groups || accessPayload.groups || [],
    },
  }
}

const requestToken = async body => {
  const response = await fetch(`${keycloakRealmUrl}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      ...body,
    }),
  })

  if (!response.ok) {
    throw new Error('Keycloak Anmeldung fehlgeschlagen')
  }

  return response.json()
}

export const beginKeycloakLogin = async returnTo => {
  const state = createRandomString()
  const verifier = createRandomString()
  const challenge = await createCodeChallenge(verifier)

  localStorage.setItem(KEYCLOAK_STATE_KEY, state)
  localStorage.setItem(KEYCLOAK_VERIFIER_KEY, verifier)
  localStorage.setItem(KEYCLOAK_RETURN_KEY, returnTo || `${window.location.pathname}${window.location.search}`)

  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    redirect_uri: getRedirectUri(),
    response_type: 'code',
    scope: 'openid profile email roles',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  window.location.assign(`${keycloakRealmUrl}/protocol/openid-connect/auth?${params}`)
}

export const completeKeycloakLogin = async () => {
  const params = new URLSearchParams(window.location.search)
  const error = params.get('error')
  const code = params.get('code')
  const state = params.get('state')

  if (!error && !code) {
    return null
  }

  if (error) {
    throw new Error(params.get('error_description') || 'Keycloak Anmeldung abgebrochen')
  }

  const expectedState = localStorage.getItem(KEYCLOAK_STATE_KEY)
  const verifier = localStorage.getItem(KEYCLOAK_VERIFIER_KEY)
  const returnTo = localStorage.getItem(KEYCLOAK_RETURN_KEY) || '/'

  if (!expectedState || state !== expectedState || !verifier) {
    throw new Error('Keycloak Antwort ist ungültig')
  }

  const tokenResponse = await requestToken({
    grant_type: 'authorization_code',
    code,
    code_verifier: verifier,
    redirect_uri: getRedirectUri(),
  })

  localStorage.removeItem(KEYCLOAK_STATE_KEY)
  localStorage.removeItem(KEYCLOAK_VERIFIER_KEY)
  localStorage.removeItem(KEYCLOAK_RETURN_KEY)

  return {
    ...createAuthFromTokenResponse(tokenResponse),
    returnTo,
  }
}

export const refreshKeycloakAuth = async refreshToken => {
  const tokenResponse = await requestToken({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

  return createAuthFromTokenResponse({
    ...tokenResponse,
    refresh_token: tokenResponse.refresh_token || refreshToken,
  })
}

export const createKeycloakLogoutUrl = idToken => {
  const params = new URLSearchParams({
    client_id: KEYCLOAK_CLIENT_ID,
    post_logout_redirect_uri: getRedirectUri(),
  })

  if (idToken) {
    params.set('id_token_hint', idToken)
  }

  return `${keycloakRealmUrl}/protocol/openid-connect/logout?${params}`
}
