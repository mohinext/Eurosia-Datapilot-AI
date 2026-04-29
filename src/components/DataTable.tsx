import React, { useState } from 'react';
import { Download, Copy, Table as TableIcon, ArrowUpDown } from 'lucide-react';
import { motion } from 'motion/react';

interface DataTableProps {
  fields: string[];
  rows: any[];
  onCopy?: () => void;
  onDownload?: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({ fields, rows, onCopy, onDownload }) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="bg-app-card rounded-xl border border-app-border overflow-hidden shadow-2xl">
      <div className="px-6 py-4 border-b border-app-border flex justify-between items-center bg-app-muted/30">
        <div className="flex items-center gap-2">
          <TableIcon size={16} className="text-blue-500" />
          <span className="text-xs font-bold text-app-muted-fg uppercase tracking-widest">
            {rows.length} Rows Extracted
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onCopy}
            className="p-2 hover:bg-app-muted rounded-lg transition-colors text-app-muted-fg hover:text-app-fg group relative"
            title="Copy as JSON"
          >
            <Copy size={16} />
          </button>
          <button 
            onClick={onDownload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-app-muted/10">
              {fields.map((field) => (
                <th 
                  key={field} 
                  onClick={() => handleSort(field)}
                  className="px-6 py-4 text-[10px] font-bold text-app-muted-fg uppercase tracking-wider cursor-pointer hover:text-app-fg transition-colors border-r border-app-border last:border-0"
                >
                  <div className="flex items-center justify-between">
                    {field}
                    <ArrowUpDown size={12} className={sortField === field ? 'text-blue-500' : 'text-app-muted/30'} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-app-border">
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={fields.length} className="px-6 py-12 text-center text-app-muted-fg italic font-sans text-sm">
                  No data found for these fields.
                </td>
              </tr>
            ) : (
              sortedRows.map((row, i) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  key={i} 
                  className="hover:bg-blue-500/5 transition-colors group"
                >
                  {fields.map((field) => (
                    <td key={field} className="px-6 py-4 text-sm text-app-fg border-r border-app-border last:border-0 font-medium group-hover:text-blue-500 transition-colors font-sans truncate max-w-[200px]">
                      {String(row[field] ?? '')}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
