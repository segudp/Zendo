import { ReactNode } from "react";

interface TableProps {
  children: ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm text-left text-gray-500">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: TableProps) {
  return (
    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableRow({ children }: TableProps) {
  return <tr className="bg-white border-b hover:bg-gray-50 transition-colors">{children}</tr>;
}

export function TableHead({ children }: TableProps) {
  return <th className="px-6 py-4 font-medium text-gray-900">{children}</th>;
}

export function TableCell({ children }: TableProps) {
  return <td className="px-6 py-4">{children}</td>;
}
