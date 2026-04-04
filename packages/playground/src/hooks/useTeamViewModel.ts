// src/hooks/useTeamViewModel.ts
import { useState, useEffect, useCallback } from 'react'

export interface User {
  id: number
  name: string
  role: string
}

export interface TeamViewModel {
  users: User[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useTeamViewModel(): TeamViewModel {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('https://api.example.com/users')
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
      const data: User[] = await res.json()
      setUsers(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  return { users, loading, error, refetch: fetchUsers }
}
