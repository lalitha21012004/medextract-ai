import React from 'react';
import { ArrowLeft, Printer, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ReportDetail() {
  const metrics = [
    { name: 'Haemoglobin', value: 11.2, unit: 'g/dL', range: '12.0 - 15.5', risk: 'LOW', note: 'Slightly low; consult doctor regarding iron levels.' },
    { name: 'Total WBC Count', value: 6800, unit: 'cells/cu.mm', range: '4,000 - 11,000', risk: 'NORMAL', note: 'Within healthy limits.' },
    { name: 'Serum Cholesterol', value: 210, unit: 'mg/dL', range: '< 200', risk: 'HIGH', note: 'Elevated cholesterol level observed.' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <button className="border border-slate-300 bg-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-sm">
          <Printer className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Report Summary Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Complete Blood Count (CBC)</h1>
          <p className="text-sm text-slate-500 mt-1">Processed on Sep 02, 2026 • File: Complete_Blood_Count.pdf</p>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-full">
            STATUS: PROCESSED
          </span>
        </div>
      </div>

      {/* Parameters Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Extracted Test Metrics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Parameter Name</th>
                <th className="p-4">Observed Value</th>
                <th className="p-4">Reference Range</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4">AI Summary Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {metrics.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50/80 transition">
                  <td className="p-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="p-4 font-bold text-slate-800">{item.value} {item.unit}</td>
                  <td className="p-4 text-slate-500">{item.range}</td>
                  <td className="p-4">
                    {item.risk === 'NORMAL' && (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full inline-flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> NORMAL
                      </span>
                    )}
                    {item.risk === 'LOW' && (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full inline-flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> LOW
                      </span>
                    )}
                    {item.risk === 'HIGH' && (
                      <span className="px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-800 rounded-full inline-flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> HIGH
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 italic">{item.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}