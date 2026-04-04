import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadCSV, downloadPDF } from './reporting';

describe('reporting utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn();
    global.URL.revokeObjectURL = vi.fn();
  });

  it('downloadCSV should not fail with empty data', () => {
    expect(() => downloadCSV([], 'test')).not.toThrow();
  });

  it('downloadCSV should trigger click on hidden link', () => {
    const data = [{ col1: 'val1' }];
    const mockLink: HTMLAnchorElement = {
      setAttribute: vi.fn(),
      style: {},
      click: vi.fn(),
    } as unknown as HTMLAnchorElement;
    
    // Mock document.createElement
    const spy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink);
    const appendSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
    const removeSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

    downloadCSV(data, 'test');
    
    expect(spy).toHaveBeenCalledWith('a');
    expect(mockLink.click).toHaveBeenCalled();
    
    spy.mockRestore();
    appendSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it('downloadPDF should handle empty data without throwing', () => {
    expect(() => downloadPDF([], 'Title', 'test')).not.toThrow();
  });
});
