// src/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw'

const usersData = [
  { id: 1, name: 'Gustavo Silva', role: 'developer' },
  { id: 2, name: 'Ana Martins', role: 'designer' },
  { id: 3, name: 'Rafael Costa', role: 'pm' },
]

// ─── Default handlers ─────────────────────────────────────────────────────

export const handlers = [
  http.get('https://api.example.com/users', () =>
    HttpResponse.json(usersData),
  ),

  http.get('https://api.example.com/users/:id', ({ params }) => {
    const user = usersData.find(u => u.id === Number(params.id))
    if (!user) return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    return HttpResponse.json(user)
  }),

  http.post('https://api.example.com/users', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    return HttpResponse.json({ id: Date.now(), ...body }, { status: 201 })
  }),

  http.delete('https://api.example.com/users/:id', () =>
    HttpResponse.json({ message: 'User deleted', success: true }),
  ),
]

// ─── Scenario overrides (used by DebugDrawer at runtime) ──────────────────

export const scenarioHandlers = {
  'GET /users': {
    success: () =>
      http.get('https://api.example.com/users', () => HttpResponse.json(usersData)),
    not_found: () =>
      http.get('https://api.example.com/users', () =>
        HttpResponse.json({ message: 'Resource not found', code: 404 }, { status: 404 }),
      ),
    error: () =>
      http.get('https://api.example.com/users', () =>
        HttpResponse.json({ message: 'Internal server error', code: 500 }, { status: 500 }),
      ),
    loading: () =>
      http.get('https://api.example.com/users', async () => {
        await delay('infinite')
        return HttpResponse.json([])
      }),
    network_error: () =>
      http.get('https://api.example.com/users', () => HttpResponse.error()),
    forbidden: () =>
      http.get('https://api.example.com/users', () =>
        HttpResponse.json({ message: 'Forbidden', code: 403 }, { status: 403 }),
      ),
  },

  'GET /users/:id': {
    success: () =>
      http.get('https://api.example.com/users/:id', () => HttpResponse.json(usersData[0])),
    not_found: () =>
      http.get('https://api.example.com/users/:id', () =>
        HttpResponse.json({ message: 'User not found', code: 404 }, { status: 404 }),
      ),
    error: () =>
      http.get('https://api.example.com/users/:id', () =>
        HttpResponse.json({ message: 'Internal server error' }, { status: 500 }),
      ),
    loading: () =>
      http.get('https://api.example.com/users/:id', async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
    forbidden: () =>
      http.get('https://api.example.com/users/:id', () =>
        HttpResponse.json({ message: 'Forbidden', code: 403 }, { status: 403 }),
      ),
    network_error: () =>
      http.get('https://api.example.com/users/:id', () => HttpResponse.error()),
  },

  'POST /users': {
    success: () =>
      http.post('https://api.example.com/users', async ({ request }) => {
        const body = await request.json() as Record<string, unknown>
        return HttpResponse.json({ id: Date.now(), ...body }, { status: 201 })
      }),
    error: () =>
      http.post('https://api.example.com/users', () =>
        HttpResponse.json({ message: 'Validation failed', fields: ['name', 'email'] }, { status: 400 }),
      ),
    not_found: () =>
      http.post('https://api.example.com/users', () =>
        HttpResponse.json({ message: 'Conflict: email already exists' }, { status: 409 }),
      ),
    loading: () =>
      http.post('https://api.example.com/users', async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
    forbidden: () =>
      http.post('https://api.example.com/users', () =>
        HttpResponse.json({ message: 'Forbidden', code: 403 }, { status: 403 }),
      ),
    network_error: () =>
      http.post('https://api.example.com/users', () => HttpResponse.error()),
  },

  'DELETE /users/:id': {
    success: () =>
      http.delete('https://api.example.com/users/:id', () =>
        HttpResponse.json({ message: 'User deleted', success: true }),
      ),
    not_found: () =>
      http.delete('https://api.example.com/users/:id', () =>
        HttpResponse.json({ message: 'User not found', code: 404 }, { status: 404 }),
      ),
    forbidden: () =>
      http.delete('https://api.example.com/users/:id', () =>
        HttpResponse.json({ message: 'Cannot delete this user', code: 403 }, { status: 403 }),
      ),
    error: () =>
      http.delete('https://api.example.com/users/:id', () =>
        HttpResponse.json({ message: 'Internal server error' }, { status: 500 }),
      ),
    loading: () =>
      http.delete('https://api.example.com/users/:id', async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
    network_error: () =>
      http.delete('https://api.example.com/users/:id', () => HttpResponse.error()),
  },
} as const
