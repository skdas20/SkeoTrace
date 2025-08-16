import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Package, Copy, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Timeline } from '../components/Timeline';
import { api, TraceResponse } from '../lib/api';

export const PublicTrace: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const [traceData, setTraceData] = useState<TraceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (batchId) {
      loadTraceData(batchId);
    }
  }, [batchId]);

  const loadTraceData = async (id: string) => {
    setLoading(true);
    setError('');

    try {
      const data = await api.trace(id);
      setTraceData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trace data');
    } finally {
      setLoading(false);
    }
  };

  const copyTraceLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // You could show a toast notification here
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-muted-foreground">Loading trace information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <CardTitle>Trace Not Found</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!traceData) {
    return null;
  }

  const { batch, timeline, integrity } = traceData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Package className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">SkeoTrace Food Journey</h1>
          <p className="text-muted-foreground">Complete farm-to-table traceability</p>
        </div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {/* Batch Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="h-5 w-5" />
                    <span>Batch Information</span>
                  </CardTitle>
                  <CardDescription>Batch ID: {batch.batchId}</CardDescription>
                </div>
                <Badge variant={getStatusColor(batch.status) as any} className="text-sm">
                  {batch.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Product Type</label>
                  <p className="text-lg font-medium">{batch.productType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Origin Farm</label>
                  <p className="text-lg font-medium">{batch.originFarm}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Harvest Date</label>
                  <p className="text-lg font-medium">
                    {batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString() : 'Not specified'}
                  </p>
                </div>
              </div>

              {batch.certification && (
                <div className="mt-6 pt-6 border-t">
                  <label className="text-sm font-medium text-muted-foreground">Organic Certification</label>
                  <div className="mt-2 flex items-center space-x-2">
                    <Badge variant={batch.certification.status === 'APPROVED' ? 'success' : 'secondary'}>
                      {batch.certification.status}
                    </Badge>
                    {batch.certification.signedBy && (
                      <span className="text-sm text-muted-foreground">
                        Certified by {batch.certification.signedBy}
                      </span>
                    )}
                    {batch.certification.signedAt && (
                      <span className="text-sm text-muted-foreground">
                        on {new Date(batch.certification.signedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blockchain Integrity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {integrity.verified ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span>Blockchain Integrity</span>
              </CardTitle>
              <CardDescription>
                Data integrity verification through blockchain technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Verification Status</p>
                    <p className={`font-medium ${integrity.verified ? 'text-green-700' : 'text-red-700'}`}>
                      {integrity.verified ? 'Verified' : 'Failed'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Blocks</p>
                    <p className="font-medium">{integrity.blocks}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Chain of Custody</CardTitle>
              <CardDescription>
                Complete journey of this batch from farm to your table
              </CardDescription>
            </CardHeader>
            <CardContent>
              {timeline.length > 0 ? (
                <Timeline items={timeline} />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No events recorded for this batch yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Share */}
          <Card>
            <CardHeader>
              <CardTitle>Share This Trace</CardTitle>
              <CardDescription>
                Share this traceability information with others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3">
                <Button onClick={copyTraceLink} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  onClick={() => window.open(api.getQRCodeUrl(batch.batchId), '_blank')}
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
