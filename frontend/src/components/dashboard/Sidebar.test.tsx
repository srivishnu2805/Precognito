import { render, screen } from '@testing-library/react'
import { Sidebar } from './Sidebar'
import { describe, it, expect, vi } from 'vitest'
import * as authClient from '@/lib/auth-client'

describe('Sidebar', () => {
  it('renders correctly for ADMIN role', () => {
    // ADMIN mock is default in setup.ts
    render(<Sidebar />)
    expect(screen.getByText('Precognito')).toBeInTheDocument()
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Admin')).toBeInTheDocument()
    expect(screen.getByText('Assets')).toBeInTheDocument()
  })

  it('filters items for TECHNICIAN role', () => {
    // Override mock for this test
    vi.spyOn(authClient, 'useSession').mockReturnValue({
      data: {
        user: {
          id: '2',
          name: 'Tech User',
          email: 'tech@example.com',
        },
      },
      isPending: false,
    } as never)

    render(<Sidebar />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Assets')).toBeInTheDocument()
    expect(screen.getByText('Work Orders')).toBeInTheDocument()
    expect(screen.queryByText('Admin')).not.toBeInTheDocument()
    expect(screen.queryByText('Executive')).not.toBeInTheDocument()
  })
})
