import React, { useState } from 'react';
import { Search, Package, Warehouse, ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { api, Batch } from '../lib/api';

export const DashboardRetailer: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError('');
    setBatch(null);

    try {
      const foundBatch = await api.searchBatch(searchId.trim());
      setBatch(foundBatch || null);
    } catch (err) {
      console.error('Failed to search batch:', err);
      setError(err instanceof Error ? err.message : 'Batch not found');
      setBatch(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'receive' | 'store' | 'sell') => {
    if (!batch) return;

    setLoading(true);
    setError('');

    try {
      switch (action) {
        case 'receive':
          await api.receiveBatch(batch._id);
          break;
        case 'store':
          await api.storeBatch(batch._id);
          break;
        case 'sell':
          await api.sellBatch(batch._id);
          break;
      }
      
      // Refresh batch data
      const updatedBatch = await api.searchBatch(batch.batchId);
      setBatch(updatedBatch);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} batch`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_TRANSIT':
        return 'outline';
      case 'RECEIVED':
        return 'secondary';
      case 'STORED':
        return 'success';
      case 'SOLD':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const canReceive = batch?.status === 'IN_TRANSIT';
  const canStore = batch?.status === 'RECEIVED';
  const canSell = batch?.status === 'RECEIVED' || batch?.status === 'STORED';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Retailer Dashboard</h1>
        <p className="text-muted-foreground">Manage incoming organic food batches</p>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Search Batch</CardTitle>
            <CardDescription>Enter a batch ID to view and manage</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex space-x-4">
              <div className="flex-1">
                <Input
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter batch ID (e.g. ORG-2024-001)"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {batch && (
          <Card>
            <CardHeader>
              <CardTitle>Batch Details</CardTitle>
              <CardDescription>Batch ID: {batch.batchId}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product Type</label>
                  <p className="text-sm font-medium">{batch.productType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Origin Farm</label>
                  <p className="text-sm font-medium">{batch.originFarm}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusColor(batch.status) as any}>
                      {batch.status}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Harvest Date</label>
                  <p className="text-sm font-medium">
                    {batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {batch.certification && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Certification</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Badge variant={batch.certification.status === 'APPROVED' ? 'success' : 'secondary'}>
                      {batch.certification.status}
                    </Badge>
                    {batch.certification.signedBy && (
                      <span className="text-sm text-muted-foreground">
                        by {batch.certification.signedBy}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                {canReceive && (
                  <Button
                    onClick={() => handleAction('receive')}
                    disabled={loading}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Receive
                  </Button>
                )}
                
                {canStore && (
                  <Button
                    onClick={() => handleAction('store')}
                    disabled={loading}
                    variant="outline"
                  >
                    <Warehouse className="h-4 w-4 mr-2" />
                    Store
                  </Button>
                )}
                
                {canSell && (
                  <Button
                    onClick={() => handleAction('sell')}
                    disabled={loading}
                    variant="outline"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Sell
                  </Button>
                )}
              </div>

              <div className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
