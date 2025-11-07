import React, { ReactNode } from 'react';

interface TableColumn<T> {
  key: keyof T | 'actions' | string; // Allow string for keys not directly in T, like 'actions'
  header: string;
  render?: (row: T) => ReactNode; // Custom render function for cells
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  keyExtractor: (row: T) => string;
  className?: string;
  emptyMessage?: string;
}

export const Table = <T extends object>({
  data,
  columns,
  keyExtractor,
  className = '',
  emptyMessage = 'No data available',
}: TableProps<T>) => {
  return (
    <div className={`overflow-x-auto rounded-lg shadow ${className}`}>
      <table className="min-w-full bg-card divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.headerClassName || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td key={String(column.key)} className={`px-6 py-4 whitespace-nowrap text-sm text-text ${column.className || ''}`}>
                    {column.render ? column.render(row) : (row as any)[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
