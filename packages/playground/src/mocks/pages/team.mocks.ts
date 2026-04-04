// src/mocks/pages/team.mocks.ts
import { http, HttpResponse, delay } from 'msw'
import { EndpointConfig, ScenarioHandlerMap } from '../types'

const usersData = [
  { id: 1, name: 'Gustavo Silva', role: 'developer' },
  { id: 2, name: 'Ana Martins', role: 'designer' },
  { id: 3, name: 'Rafael Costa', role: 'pm' },
]

// ─── Endpoint definitions (shown in the drawer) ───────────────────────────

export const teamEndpoints: EndpointConfig[] = [
  {
    id: 'GET /users',
    method: 'GET',
    path: '/users',
    selectedScenario: 'success',
    options: [
      { id: 'success',       label: 'Success',       description: 'Returns array of users',  statusCode: 200,  scenario: 'success',       payload: usersData },
      { id: 'not_found',     label: 'Not found',     description: 'Empty state / no users',  statusCode: 404,  scenario: 'not_found',     payload: { message: 'Not found', code: 404 } },
      { id: 'error',         label: 'Server error',  description: 'Internal server error',   statusCode: 500,  scenario: 'error',         payload: { message: 'Internal server error' } },
      { id: 'loading',       label: 'Loading',       description: 'Infinite pending state',  statusCode: null, scenario: 'loading' },
      { id: 'network_error', label: 'Network error', description: 'No connection / timeout', statusCode: null, scenario: 'network_error' },
    ],
  },
  {
    id: 'DELETE /users/:id',
    method: 'DELETE',
    path: '/users/:id',
    selectedScenario: 'success',
    options: [
      { id: 'success',   label: 'Deleted',     description: 'Removed successfully',      statusCode: 200, scenario: 'success',   payload: { message: 'User deleted', success: true } },
      { id: 'not_found', label: 'Not found',   description: 'Already deleted / missing', statusCode: 404, scenario: 'not_found', payload: { message: 'Not found', code: 404 } },
      { id: 'forbidden', label: 'Forbidden',   description: 'Cannot delete this user',   statusCode: 403, scenario: 'forbidden', payload: { message: 'Cannot delete', code: 403 } },
      { id: 'error',     label: 'Server error', description: '500 response',             statusCode: 500, scenario: 'error',     payload: { message: 'Internal server error' } },
    ],
  },
]

// ─── Scenario handler factories ───────────────────────────────────────────

export const teamHandlers: Record<string, Record<string, ScenarioHandlerMap[string]>> = {
  'GET /users': {
    success:       () => http.get('https://api.example.com/users', () => HttpResponse.json(usersData)),
    not_found:     () => http.get('https://api.example.com/users', () => HttpResponse.json({ message: 'Not found', code: 404 }, { status: 404 })),
    error:         () => http.get('https://api.example.com/users', () => HttpResponse.json({ message: 'Internal server error' }, { status: 500 })),
    loading:       () => http.get('https://api.example.com/users', async () => { await delay('infinite'); return HttpResponse.json([]) }),
    network_error: () => http.get('https://api.example.com/users', () => HttpResponse.error()),
    forbidden:     () => http.get('https://api.example.com/users', () => HttpResponse.json({ message: 'Forbidden', code: 403 }, { status: 403 })),
  },
  'DELETE /users/:id': {
    success:   () => http.delete('https://api.example.com/users/:id', () => HttpResponse.json({ message: 'User deleted', success: true })),
    not_found: () => http.delete('https://api.example.com/users/:id', () => HttpResponse.json({ message: 'Not found', code: 404 }, { status: 404 })),
    forbidden: () => http.delete('https://api.example.com/users/:id', () => HttpResponse.json({ message: 'Cannot delete', code: 403 }, { status: 403 })),
    error:     () => http.delete('https://api.example.com/users/:id', () => HttpResponse.json({ message: 'Internal server error' }, { status: 500 })),
  },
}
