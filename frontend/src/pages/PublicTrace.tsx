import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Package, Copy, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Timeline } from '../components/Timeline';
import { api, TraceResponse } from '../lib/api';

export const PublicTrace: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const { t, i18n } = useTranslation('publicTrace');
  const [traceData, setTraceData] = useState<TraceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (batchId) loadTraceData(batchId);
  }, [batchId]);

  const loadTraceData = async (id: string) => {
    setLoading(true);
    setError('');
    try {
      setTraceData(await api.trace(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const copyTraceLink = () => {
    void navigator.clipboard.writeText(window.location.href);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED': return 'default';
      case 'PROCESSING': return 'secondary';
      case 'CERTIFIED': return 'success';
      case 'IN_TRANSIT': return 'outline';
      case 'RECEIVED': return 'secondary';
      case 'STORED': return 'success';
      case 'SOLD': return 'destructive';
      default: return 'default';
    }
  };

  const languageSwitcher = (
    <div className="flex items-center justify-end gap-2 mb-4">
      <label htmlFor="trace-language" className="text-sm font-medium text-muted-foreground">{t('language')}</label>
      <select id="trace-language" aria-label={t('language')}
        value={i18n.resolvedLanguage?.startsWith('hi') ? 'hi' : 'en'}
        onChange={(event) => { void i18n.changeLanguage(event.target.value); }}
        className="rounded-md border bg-background px-3 py-2 text-sm">
        <option value="en">{t('english')}</option>
        <option value="hi">{t('hindi')}</option>
      </select>
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><Package className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" /><p className="text-muted-foreground">{t('loading')}</p></div></div>;

  if (error) return <div className="min-h-screen flex items-center justify-center"><Card className="w-full max-w-md"><CardHeader className="text-center"><XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" /><CardTitle>{t('traceNotFound')}</CardTitle><CardDescription>{error}</CardDescription></CardHeader><CardContent className="text-center"><Button onClick={() => window.location.reload()}>{t('tryAgain')}</Button></CardContent></Card></div>;

  if (!traceData) return null;
  const { batch, timeline, integrity } = traceData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {languageSwitcher}
        <div className="text-center mb-8"><div className="flex justify-center mb-4"><Package className="h-12 w-12 text-primary" /></div><h1 className="text-3xl font-bold mb-2">{t('title')}</h1><p className="text-muted-foreground">{t('subtitle')}</p></div>
        <div className="grid gap-6 max-w-4xl mx-auto">
          <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle className="flex items-center space-x-2"><Package className="h-5 w-5" /><span>{t('batchInformation')}</span></CardTitle><CardDescription>{t('batchId')}: {batch.batchId}</CardDescription></div><Badge variant={getStatusColor(batch.status) as any} className="text-sm">{t(`status.${batch.status}`, { defaultValue: batch.status.replaceAll('_', ' ') })}</Badge></div></CardHeader>
            <CardContent><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div><label className="text-sm font-medium text-muted-foreground">{t('productType')}</label><p className="text-lg font-medium">{batch.productType}</p></div><div><label className="text-sm font-medium text-muted-foreground">{t('originFarm')}</label><p className="text-lg font-medium">{batch.originFarm}</p></div><div><label className="text-sm font-medium text-muted-foreground">{t('harvestDate')}</label><p className="text-lg font-medium">{batch.harvestDate ? new Date(batch.harvestDate).toLocaleDateString(i18n.resolvedLanguage === 'hi' ? 'hi-IN' : 'en-US') : t('notSpecified')}</p></div></div>
              {batch.certification && <div className="mt-6 pt-6 border-t"><label className="text-sm font-medium text-muted-foreground">{t('organicCertification')}</label><div className="mt-2 flex items-center space-x-2"><Badge variant={batch.certification.status === 'APPROVED' ? 'success' : 'secondary'}>{batch.certification.status}</Badge>{batch.certification.signedBy && <span className="text-sm text-muted-foreground">{t('certifiedBy')} {batch.certification.signedBy}</span>}{batch.certification.signedAt && <span className="text-sm text-muted-foreground">{t('on')} {new Date(batch.certification.signedAt).toLocaleDateString(i18n.resolvedLanguage === 'hi' ? 'hi-IN' : 'en-US')}</span>}</div></div>}
            </CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center space-x-2">{integrity.verified ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}<span>{t('blockchainIntegrity')}</span></CardTitle><CardDescription>{t('integrityDescription')}</CardDescription></CardHeader><CardContent><div className="flex items-center justify-between"><div className="flex items-center space-x-4"><div><p className="text-sm text-muted-foreground">{t('verificationStatus')}</p><p className={`font-medium ${integrity.verified ? 'text-green-700' : 'text-red-700'}`}>{integrity.verified ? t('verified') : t('failed')}</p></div><div><p className="text-sm text-muted-foreground">{t('blocks')}</p><p className="font-medium">{integrity.blocks}</p></div></div></div></CardContent></Card>
          <Card><CardHeader><CardTitle>{t('chainOfCustody')}</CardTitle><CardDescription>{t('journeyDescription')}</CardDescription></CardHeader><CardContent>{timeline.length > 0 ? <Timeline items={timeline} /> : <p className="text-muted-foreground text-center py-8">{t('noEvents')}</p>}</CardContent></Card>
          <Card><CardHeader><CardTitle>{t('shareTrace')}</CardTitle><CardDescription>{t('shareDescription')}</CardDescription></CardHeader><CardContent><div className="flex space-x-3"><Button onClick={copyTraceLink} variant="outline"><Copy className="h-4 w-4 mr-2" />{t('copyLink')}</Button><Button onClick={() => window.open(api.getQRCodeUrl(batch.batchId), '_blank')} variant="outline"><ExternalLink className="h-4 w-4 mr-2" />{t('viewQr')}</Button></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
};
