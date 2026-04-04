import { render, screen } from '@testing-library/react';
import { AssetCard } from './AssetCard';
import { Asset } from '@/lib/types';
import { describe, it, expect } from 'vitest';

const mockAsset: Asset = {
  id: 'machine_1',
  name: 'Test Machine',
  type: 'L',
  location: 'Main Floor',
  status: 'GREEN',
  rms: 1.5,
  rul: 120,
  lastUpdated: new Date().toISOString(),
};

describe('AssetCard', () => {
  it('renders asset details correctly', () => {
    render(<AssetCard asset={mockAsset} />);
    
    expect(screen.getByText('Test Machine')).toBeInTheDocument();
    expect(screen.getByText('120 hrs')).toBeInTheDocument();
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('shows warning status when yellow', () => {
    const warningAsset = { ...mockAsset, status: 'YELLOW' as const };
    render(<AssetCard asset={warningAsset} />);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('shows critical status when red', () => {
    const criticalAsset = { ...mockAsset, status: 'RED' as const };
    render(<AssetCard asset={criticalAsset} />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });
});
