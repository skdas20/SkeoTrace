import React, { useState, useEffect } from 'react';
import { Users, Shield, Search, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Timeline } from '../components/Timeline';
import { api, User, Event } from '../lib/api';

export const DashboardAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [auditBatchId, setAuditBatchId] = useState('');
  const [auditEvents, setAuditEvents] = useState<Event[]>([]);
  const [chainStatus, setChainStatus] = useState<{ ok: boolean; issues: string[] } | null>(null);
  const [blocksCount, setBlocksCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
    loadBlocksInfo();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
      setUsers([]);
    }
  };

  const loadBlocksInfo = async () => {
    try {
      const blocks = await api.getBlocks();
      setBlocksCount(Array.isArray(blocks) ? blocks.length : 0);
    } catch (err) {
      console.error('Failed to load blocks:', err);
    }
  };

  const handleVerifyChain = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await api.verifyChain();
      setChainStatus(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify chain');
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditBatchId.trim()) return;

    setLoading(true);
    setError('');
    setAuditEvents([]);

    try {
      const events = await api.getAudit(auditBatchId.trim());
      setAuditEvents(Array.isArray(events) ? events : []);
    } catch (err) {
      console.error('Failed to load audit:', err);
      setError(err instanceof Error ? err.message : 'Failed to get audit trail');
      setAuditEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive';
      case 'PRODUCER':
        return 'success';
      case 'RETAILER':
        return 'secondary';
      case 'CONSUMER':
        return 'outline';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System administration and monitoring</p>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="grid gap-6">
        {/* Blockchain Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Blockchain Status</span>
              </CardTitle>
              <CardDescription>Verify the integrity of the blockchain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Blocks:</span>
                <Badge variant="outline">{blocksCount}</Badge>
              </div>
              
              <Button onClick={handleVerifyChain} disabled={loading} className="w-full">
                {loading ? 'Verifying...' : 'Verify Chain'}
              </Button>

              {chainStatus && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    {chainStatus.ok ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <span className={`font-medium ${chainStatus.ok ? 'text-green-700' : 'text-red-700'}`}>
                      {chainStatus.ok ? 'Chain Verified' : 'Chain Issues Detected'}
                    </span>
                  </div>
                  {chainStatus.issues.length > 0 && (
                    <div className="text-sm space-y-1">
                      {chainStatus.issues.map((issue, index) => (
                        <p key={index} className="text-red-600">• {issue}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>System Users</span>
              </CardTitle>
              <CardDescription>Overview of registered users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span>Producers:</span>
                    <span className="font-medium">{users.filter(u => u.role === 'PRODUCER').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retailers:</span>
                    <span className="font-medium">{users.filter(u => u.role === 'RETAILER').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Consumers:</span>
                    <span className="font-medium">{users.filter(u => u.role === 'CONSUMER').length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Admins:</span>
                    <span className="font-medium">{users.filter(u => u.role === 'ADMIN').length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>Complete list of system users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(users) && users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeColor(user.role) as any}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{user._id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
            <CardDescription>Search for events by batch ID</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleAudit} className="flex space-x-4">
              <div className="flex-1">
                <Input
                  value={auditBatchId}
                  onChange={(e) => setAuditBatchId(e.target.value)}
                  placeholder="Enter batch ID to audit"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                <Search className="h-4 w-4 mr-2" />
                {loading ? 'Searching...' : 'Audit'}
              </Button>
            </form>

            {auditEvents.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Events for batch: {auditBatchId}</h4>
                <Timeline 
                  items={auditEvents.map(event => ({
                    type: event.type,
                    at: event.timestamp,
                    by: `User ${event.actorUserId}`,
                    payload: event.payload
                  }))}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
