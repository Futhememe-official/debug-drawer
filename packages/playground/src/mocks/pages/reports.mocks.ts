// src/mocks/pages/reports.mocks.ts
import { http, HttpResponse, delay } from 'msw'
import { EndpointConfig, ScenarioHandlerMap } from '../types'

const reportsData = [
  { id: 1, title: 'Q1 Performance', status: 'published', createdAt: '2025-01-15' },
  { id: 2, title: 'Q2 Performance', status: 'draft',     createdAt: '2025-04-01' },
]

export const reportsEndpoints: EndpointConfig[] = [
  {
    id: 'GET /reports',
    method: 'GET',
    path: '/reports',
    selectedScenario: 'success',
    options: [
      { id: 'success',   label: 'Success',      description: 'Returns report list',   statusCode: 200,  scenario: 'success',   payload: reportsData },
      { id: 'error',     label: 'Server error', description: 'Internal server error', statusCode: 500,  scenario: 'error',     payload: { message: 'Internal server error' } },
      { id: 'loading',   label: 'Loading',      description: 'Fetching reports...',   statusCode: null, scenario: 'loading' },
      { id: 'not_found', label: 'Empty',        description: 'No reports yet',        statusCode: 200,  scenario: 'not_found', payload: [] },
    ],
  },
  {
    id: 'POST /reports',
    method: 'POST',
    path: '/reports',
    selectedScenario: 'success',
    options: [
      { id: 'success', label: 'Created',         description: 'Report created',        statusCode: 201, scenario: 'success', payload: { id: 99, title: 'New Report', status: 'draft' } },
      { id: 'error',   label: 'Validation error', description: 'Invalid data',         statusCode: 400, scenario: 'error',   payload: { message: 'Title is required' } },
      { id: 'loading', label: 'Loading',          description: 'Slow save simulation', statusCode: null, scenario: 'loading' },
    ],
  },
  {
    id: 'GET /reports/:id',
    method: 'GET',
    path: '/reports/:id',
    selectedScenario: 'success',
    options: [
      { id: 'success',   label: 'Success',   description: 'Report found',    statusCode: 200, scenario: 'success',   payload: reportsData[0] },
      { id: 'not_found', label: 'Not found', description: 'Report missing',  statusCode: 404, scenario: 'not_found', payload: { message: 'Report not found' } },
      { id: 'forbidden', label: 'Forbidden', description: 'No access',       statusCode: 403, scenario: 'forbidden', payload: { message: 'Forbidden' } },
    ],
  },
]

export const reportsHandlers: Record<string, Record<string, ScenarioHandlerMap[string]>> = {
  'GET /reports': {
    success:   () => http.get('https://api.example.com/reports', () => HttpResponse.json(reportsData)),
    error:     () => http.get('https://api.example.com/reports', () => HttpResponse.json({ message: 'Internal server error' }, { status: 500 })),
    loading:   () => http.get('https://api.example.com/reports', async () => { await delay('infinite'); return HttpResponse.json([]) }),
    not_found: () => http.get('https://api.example.com/reports', () => HttpResponse.json([])),
  },
  'POST /reports': {
    success: () => http.post('https://api.example.com/reports', () => HttpResponse.json({ id: 99, title: 'New Report', status: 'draft' }, { status: 201 })),
    error:   () => http.post('https://api.example.com/reports', () => HttpResponse.json({ message: 'Title is required' }, { status: 400 })),
    loading: () => http.post('https://api.example.com/reports', async () => { await delay('infinite'); return HttpResponse.json({}) }),
  },
  'GET /reports/:id': {
    success:   () => http.get('https://api.example.com/reports/:id', () => HttpResponse.json(reportsData[0])),
    not_found: () => http.get('https://api.example.com/reports/:id', () => HttpResponse.json({ message: 'Report not found' }, { status: 404 })),
    forbidden: () => http.get('https://api.example.com/reports/:id', () => HttpResponse.json({ message: 'Forbidden' }, { status: 403 })),
  },
}
