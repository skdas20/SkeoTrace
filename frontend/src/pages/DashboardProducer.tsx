import React, { useState, useEffect } from 'react';
import { Plus, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { api, Batch } from '../lib/api';

export const DashboardProducer: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [error, setError] = useState('');

  // Create batch form state
  const [batchId, setBatchId] = useState('');
  const [productType, setProductType] = useState('');
  const [originFarm, setOriginFarm] = useState('');
  const [harvestDate, setHarvestDate] = useState('');

  // Transfer form state
  const [transferBatchId, setTransferBatchId] = useState('');
  const [retailerEmail, setRetailerEmail] = useState('');

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const data = await api.getMyBatches();
      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load batches:', err);
      setError(err instanceof Error ? err.message : 'Failed to load batches');
      setBatches([]); // Set empty array on error
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createBatch({
        batchId,
        productType,
        originFarm,
        harvestDate: harvestDate || undefined,
      });
      
      // Reset form
      setBatchId('');
      setProductType('');
      setOriginFarm('');
      setHarvestDate('');
      setShowCreateForm(false);
      
      // Reload batches
      await loadBatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (batchId: string) => {
    if (!retailerEmail) {
      setError('Please enter retailer email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.transferBatch(batchId, retailerEmail);
      setRetailerEmail('');
      setTransferBatchId('');
      await loadBatches();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer batch');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'default';
      case 'PROCESSING':
        return 'secondary';
      case 'CERTIFIED':
        return 'success';
      case 'IN_TRANSIT':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Producer Dashboard</h1>
          <p className="text-muted-foreground">Manage your organic food batches</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Batch
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Batch</CardTitle>
            <CardDescription>Add a new organic food batch to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="batchId" className="text-sm font-medium">
                    Batch ID *
                  </label>
                  <Input
                    id="batchId"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    placeholder="e.g. ORG-2024-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="productType" className="text-sm font-medium">
                    Product Type *
                  </label>
                  <Input
                    id="productType"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    placeholder="e.g. Organic Tomatoes"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="originFarm" className="text-sm font-medium">
                    Origin Farm *
                  </label>
                  <Input
                    id="originFarm"
                    value={originFarm}
                    onChange={(e) => setOriginFarm(e.target.value)}
                    placeholder="e.g. Green Valley Farm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="harvestDate" className="text-sm font-medium">
                    Harvest Date
                  </label>
                  <Input
                    id="harvestDate"
                    type="date"
                    value={harvestDate}
                    onChange={(e) => setHarvestDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Batch'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>My Batches</CardTitle>
          <CardDescription>Overview of all your organic food batches</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Origin Farm</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(batches) && batches.map((batch) => (
                <TableRow key={batch._id}>
                  <TableCell className="font-medium">{batch.batchId}</TableCell>
                  <TableCell>{batch.productType}</TableCell>
                  <TableCell>{batch.originFarm}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(batch.status) as any}>
                      {batch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {batch.status === 'CREATED' && (
                      <div className="flex space-x-2">
                        {transferBatchId === batch._id ? (
                          <div className="flex space-x-2">
                            <Input
                              placeholder="Retailer email"
                              value={retailerEmail}
                              onChange={(e) => setRetailerEmail(e.target.value)}
                              className="w-40"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleTransfer(batch._id)}
                              disabled={loading}
                            >
                              Send
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setTransferBatchId('')}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setTransferBatchId(batch._id)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Transfer
                          </Button>
                        )}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
