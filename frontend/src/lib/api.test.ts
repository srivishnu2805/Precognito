import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, fetchWithAuth } from './api';
import { authClient } from './auth-client';

// Mock authClient
vi.mock('./auth-client', () => ({
  authClient: {
    getSession: vi.fn(),
  },
}));

// Mock global fetch
global.fetch = vi.fn();

describe('api utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchWithAuth should handle successful responses', async () => {
    const mockData = { success: true };
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchWithAuth('/test');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.any(Object));
  });

  it('fetchWithAuth should throw error on non-ok response', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
      json: async () => ({ detail: 'Resource not found' }),
    });

    await expect(fetchWithAuth('/test')).rejects.toThrow('Resource not found');
  });

  it('getAssets should call the correct endpoint', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await api.getAssets();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/assets'), expect.any(Object));
  });
});
