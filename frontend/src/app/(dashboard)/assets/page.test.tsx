import { render, screen, waitFor } from '@testing-library/react';
import AssetsPage from './page';
import { api } from '@/lib/api';
import { describe, it, expect, vi } from 'vitest';

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    getAssets: vi.fn(),
  },
}));

describe('AssetsPage', () => {
  it('renders loading state initially', async () => {
    vi.mocked(api.getAssets).mockResolvedValue([]);
    render(<AssetsPage />);
    expect(screen.getByText(/Loading assets.../i)).toBeInTheDocument();
  });

  it('renders assets after loading', async () => {
    const mockAssets = [
      { id: '1', name: 'Machine A', status: 'GREEN', rms: 1.0, rul: 100, lastUpdated: new Date().toISOString() },
    ];
    vi.mocked(api.getAssets).mockResolvedValue(mockAssets as never);
    
    render(<AssetsPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Machine A')).toBeInTheDocument();
    });
    expect(screen.getByText(/Asset Health/i)).toBeInTheDocument();
  });

  it('shows empty state if no assets', async () => {
    vi.mocked(api.getAssets).mockResolvedValue([]);
    
    render(<AssetsPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/No assets detected yet/i)).toBeInTheDocument();
    });
  });
});
