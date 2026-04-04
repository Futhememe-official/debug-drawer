// src/views/__tests__/TeamView.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { server } from '../../mocks/server'
import { TeamView } from '../TeamView'
import { describe, it, expect } from 'vitest'

describe('TeamView', () => {
  it('shows skeleton while loading', () => {
    render(<TeamView />)
    // Skeletons render as animated pulse divs — just check it doesn't crash
    expect(document.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders list of users on success', async () => {
    render(<TeamView />)

    await waitFor(() => {
      expect(screen.getByText('Gustavo Silva')).toBeInTheDocument()
      expect(screen.getByText('Ana Martins')).toBeInTheDocument()
      expect(screen.getByText('Rafael Costa')).toBeInTheDocument()
    })
  })

  it('shows error state on 500', async () => {
    server.use(
      http.get('https://api.example.com/users', () =>
        HttpResponse.json({ message: 'Server error' }, { status: 500 }),
      ),
    )

    render(<TeamView />)

    await waitFor(() => {
      expect(screen.getByText('Request failed')).toBeInTheDocument()
    })
  })

  it('shows empty state when API returns []', async () => {
    server.use(
      http.get('https://api.example.com/users', () => HttpResponse.json([])),
    )

    render(<TeamView />)

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument()
    })
  })

  it('refetches when "Try again" is clicked', async () => {
    const user = userEvent.setup()

    server.use(
      http.get('https://api.example.com/users', () =>
        HttpResponse.json({ message: 'Error' }, { status: 500 }),
      ),
    )

    render(<TeamView />)

    await waitFor(() => screen.getByText('Try again'))

    // Restore success for next fetch
    server.use(
      http.get('https://api.example.com/users', () =>
        HttpResponse.json([{ id: 1, name: 'Gustavo Silva', role: 'developer' }]),
      ),
    )

    await user.click(screen.getByText('Try again'))

    await waitFor(() => {
      expect(screen.getByText('Gustavo Silva')).toBeInTheDocument()
    })
  })
})
