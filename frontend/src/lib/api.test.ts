import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, fetchWithAuth } from './api';
import { authClient } from './auth-client';

// Mock authClient
vi.mock('./auth-client', () => ({
  authClient: {
    getSession: vi.fn(),
  },
}));

// Mock global fetch - use unknown intermediate to avoid type mismatch
const mockFetch = vi.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe('api utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchWithAuth should handle successful responses', async () => {
    const mockData = { success: true };
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const result = await fetchWithAuth('/test');
    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/test'), expect.any(Object));
  });

  it('fetchWithAuth should throw error on non-ok response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Not Found',
      json: async () => ({ detail: 'Resource not found' }),
    });

    await expect(fetchWithAuth('/test')).rejects.toThrow('Resource not found');
  });

  it('getAssets should call the correct endpoint', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await api.getAssets();
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/assets'), expect.any(Object));
  });
});
