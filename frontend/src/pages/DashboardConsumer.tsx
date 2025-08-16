import React, { useState } from 'react';
import { Search, Package, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Timeline } from '../components/Timeline';
import { api, TraceResponse } from '../lib/api';

export const DashboardConsumer: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [traceData, setTraceData] = useState<TraceResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError('');
    setTraceData(null);

    try {
      const data = await api.trace(searchId.trim());
      setTraceData(data || null);
    } catch (err) {
      console.error('Failed to trace batch:', err);
      setError(err instanceof Error ? err.message : 'Batch not found');
      setTraceData(null);
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

  const copyTraceLink = () => {
    if (traceData) {
      const url = `${window.location.origin}/trace/${traceData.batch.batchId}`;
      navigator.clipboard.writeText(url);
      // You could show a toast notification here
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Consumer Dashboard</h1>
        <p className="text-muted-foreground">Verify the authenticity and trace the journey of your organic food</p>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle>Trace Your Food</CardTitle>
            <CardDescription>
              Enter a batch ID from your product packaging or scan the QR code to verify authenticity
            </CardDescription>
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
                {loading ? 'Searching...' : 'Trace'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {traceData && (
          <>
            {/* Product Information */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Product Information</span>
                    </CardTitle>
                    <CardDescription>Batch ID: {traceData.batch.batchId}</CardDescription>
                  </div>
                  <Badge variant={getStatusColor(traceData.batch.status) as any}>
                    {traceData.batch.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Product Type</label>
                    <p className="text-lg font-medium">{traceData.batch.productType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Origin Farm</label>
                    <p className="text-lg font-medium">{traceData.batch.originFarm}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Harvest Date</label>
                    <p className="text-lg font-medium">
                      {traceData.batch.harvestDate ? new Date(traceData.batch.harvestDate).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>

                {traceData.batch.certification && (
                  <div className="mt-6 pt-6 border-t">
                    <label className="text-sm font-medium text-muted-foreground">Organic Certification</label>
                    <div className="mt-2 flex items-center space-x-2">
                      <Badge variant={traceData.batch.certification.status === 'APPROVED' ? 'success' : 'secondary'}>
                        {traceData.batch.certification.status}
                      </Badge>
                      {traceData.batch.certification.signedBy && (
                        <span className="text-sm text-muted-foreground">
                          Certified by {traceData.batch.certification.signedBy}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Blockchain Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  {traceData.integrity.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Authenticity Verification</span>
                </CardTitle>
                <CardDescription>
                  Blockchain-verified authenticity and traceability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Verification Status</p>
                      <p className={`font-medium ${traceData.integrity.verified ? 'text-green-700' : 'text-red-700'}`}>
                        {traceData.integrity.verified ? 'Verified Authentic' : 'Verification Failed'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Blockchain Records</p>
                      <p className="font-medium">{traceData.integrity.blocks} blocks</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={copyTraceLink}>
                    Share Trace
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Journey Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Farm to Table Journey</CardTitle>
                <CardDescription>
                  Complete traceability from production to your table
                </CardDescription>
              </CardHeader>
              <CardContent>
                {traceData.timeline.length > 0 ? (
                  <Timeline items={traceData.timeline} />
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No journey data available for this batch.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Organic Certified</p>
                      <p className="text-sm text-muted-foreground">Verified organic standards</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Blockchain Secured</p>
                      <p className="text-sm text-muted-foreground">Tamper-proof records</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium">Farm Verified</p>
                      <p className="text-sm text-muted-foreground">Source authenticated</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Find Your Batch ID</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Check the product packaging label</li>
                  <li>• Scan the QR code on the package</li>
                  <li>• Look for alphanumeric code (e.g., ORG-2024-001)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">What You'll See</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Farm origin and harvest details</li>
                  <li>• Certification and quality checks</li>
                  <li>• Complete supply chain journey</li>
                  <li>• Blockchain authenticity verification</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
