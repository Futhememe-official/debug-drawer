// src/mocks/endpointsConfig.ts
import { EndpointConfig } from './types'

export const endpointsConfig: EndpointConfig[] = [
  {
    id: 'GET /users',
    method: 'GET',
    path: '/users',
    selectedScenario: 'success',
    options: [
      { id: 'success',       label: 'Success',        description: 'Returns array of users',    statusCode: 200,  scenario: 'success',       payload: [{ id: 1, name: 'Gustavo Silva', role: 'developer' }, { id: 2, name: 'Ana Martins', role: 'designer' }] },
      { id: 'not_found',     label: 'Not found',      description: 'Empty state / no users',    statusCode: 404,  scenario: 'not_found',     payload: { message: 'Resource not found', code: 404 } },
      { id: 'error',         label: 'Server error',   description: 'Internal server error',     statusCode: 500,  scenario: 'error',         payload: { message: 'Internal server error', code: 500 } },
      { id: 'loading',       label: 'Loading',        description: 'Infinite pending state',    statusCode: null, scenario: 'loading' },
      { id: 'network_error', label: 'Network error',  description: 'No connection / timeout',   statusCode: null, scenario: 'network_error' },
      { id: 'forbidden',     label: 'Forbidden',      description: 'No permission',             statusCode: 403,  scenario: 'forbidden',     payload: { message: 'Forbidden', code: 403 } },
    ],
  },
  {
    id: 'GET /users/:id',
    method: 'GET',
    path: '/users/:id',
    selectedScenario: 'success',
    options: [
      { id: 'success',   label: 'Success',    description: 'User found by id',        statusCode: 200, scenario: 'success',   payload: { id: 1, name: 'Gustavo Silva', role: 'developer' } },
      { id: 'not_found', label: 'Not found',  description: "Id doesn't exist",        statusCode: 404, scenario: 'not_found', payload: { message: 'User not found', code: 404 } },
      { id: 'forbidden', label: 'Forbidden',  description: 'No permission to view',   statusCode: 403, scenario: 'forbidden', payload: { message: 'Forbidden', code: 403 } },
      { id: 'loading',   label: 'Loading',    description: 'Pending state',           statusCode: null, scenario: 'loading' },
    ],
  },
  {
    id: 'POST /users',
    method: 'POST',
    path: '/users',
    selectedScenario: 'success',
    options: [
      { id: 'success',   label: 'Created',           description: 'User created successfully',  statusCode: 201,  scenario: 'success',   payload: { id: 99, name: 'New User', role: 'developer' } },
      { id: 'error',     label: 'Validation error',  description: 'Invalid or missing fields',  statusCode: 400,  scenario: 'error',     payload: { message: 'Validation failed', fields: ['name', 'email'] } },
      { id: 'not_found', label: 'Conflict',          description: 'Email already exists',       statusCode: 409,  scenario: 'not_found', payload: { message: 'Conflict: email already exists' } },
      { id: 'loading',   label: 'Loading',           description: 'Slow submit simulation',     statusCode: null, scenario: 'loading' },
    ],
  },
  {
    id: 'DELETE /users/:id',
    method: 'DELETE',
    path: '/users/:id',
    selectedScenario: 'success',
    options: [
      { id: 'success',   label: 'Deleted',    description: 'Removed successfully',     statusCode: 200, scenario: 'success',   payload: { message: 'User deleted', success: true } },
      { id: 'not_found', label: 'Not found',  description: 'Already deleted / missing',statusCode: 404, scenario: 'not_found', payload: { message: 'User not found', code: 404 } },
      { id: 'forbidden', label: 'Forbidden',  description: 'Cannot delete this user',  statusCode: 403, scenario: 'forbidden', payload: { message: 'Cannot delete', code: 403 } },
      { id: 'error',     label: 'Server error','description': '500 response',           statusCode: 500, scenario: 'error',     payload: { message: 'Internal server error' } },
    ],
  },
]
