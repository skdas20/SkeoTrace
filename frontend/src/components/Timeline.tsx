import React from 'react';
import { Package, Truck, Warehouse, BadgeCheck, ShoppingCart, FileText, UserCheck } from 'lucide-react';

interface TimelineItem {
  type: string;
  at: string;
  by: string;
  payload: any;
}

interface TimelineProps {
  items: TimelineItem[];
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'BATCH_CREATED':
      return <Package className="h-5 w-5" />;
    case 'HARVEST_UPDATED':
      return <FileText className="h-5 w-5" />;
    case 'CERT_UPLOAD':
      return <BadgeCheck className="h-5 w-5" />;
    case 'TRANSFER':
      return <Truck className="h-5 w-5" />;
    case 'RECEIVE':
      return <UserCheck className="h-5 w-5" />;
    case 'STORE':
      return <Warehouse className="h-5 w-5" />;
    case 'SELL':
      return <ShoppingCart className="h-5 w-5" />;
    default:
      return <Package className="h-5 w-5" />;
  }
};

const getEventColor = (type: string) => {
  switch (type) {
    case 'BATCH_CREATED':
      return 'bg-blue-500';
    case 'HARVEST_UPDATED':
      return 'bg-green-500';
    case 'CERT_UPLOAD':
      return 'bg-purple-500';
    case 'TRANSFER':
      return 'bg-orange-500';
    case 'RECEIVE':
      return 'bg-indigo-500';
    case 'STORE':
      return 'bg-yellow-500';
    case 'SELL':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const formatEventType = (type: string) => {
  return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="space-y-6">
      {items.map((item, index) => (
        <div key={index} className="flex items-start space-x-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${getEventColor(item.type)}`}>
            {getEventIcon(item.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                {formatEventType(item.type)}
              </h4>
              <time className="text-sm text-gray-500">
                {new Date(item.at).toLocaleString()}
              </time>
            </div>
            <p className="text-sm text-gray-600 mt-1">By: {item.by}</p>
            {item.payload && Object.keys(item.payload).length > 0 && (
              <div className="mt-2 text-sm text-gray-500">
                {Object.entries(item.payload).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                    <span className="ml-2">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
