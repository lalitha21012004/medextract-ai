import React from 'react';
import {Link} from 'react-router-dom';
import {FileCheck,AlertTriangle,FileUp,Calendar,ArrowRight} from 'lucide-react';

export default function Dashboard(){
    const dummyReports=[

    { id: 1, name: 'Complete_Blood_Count.pdf', date: '2026-09-02', status: 'PROCESSED', low: 1, high: 0 },
    { id: 2, name: 'Lipid_Profile_Scan.png', date: '2026-08-28', status: 'PROCESSED', low: 0, high: 1 },
  ];
  return(
    <div className="space-y-6 max-w-7xl mx-auto">

        <div className = "flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                <p className="text-sm text-slate-500">Track and extract insights from your medical lab scans</p>
            </div>
            <Link to="/upload" className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
            <FileUp className="w-4 h-4"/>
            Upload New Report
            </Link>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between'>
                <div>
                <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>Total Reports</p>
                <p className='text-2xl font-bold text-slate-900 mt-1'>12</p>
                </div>
                <div className='p-3 bg-blue-50 text-blue-600 rounded-lg'>
                    <FileCheck ckassName='w-6 h-6'/>
                </div>
            </div>
            <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between'>
                <div>
                    <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>Normal Range</p>
                    <p className='text-2xl font-bold text-emerald-600 mt-1'>85%</p>
                </div>
                <div className='p-3 bg-emerald-50 text-emerald-600 rounded-lg'>
                    <FileCheck className='w-6 h-6'/>
                </div>
            </div>
            <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between'>
                <div>
                    <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>Flagged Items</p>
                    <p className='text-2xl font-bold text-amber-600 mt-1'>3 Items</p>
                </div>
                <div className='p-3 bg-amber-50 text-amber-600 rounded-lg'>
                    <AlertTriangle className='w-6 h-6'/>
                </div>
            </div>
            <div className='bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between'>
                <div>
                    <p className='text-xs font-semibold uppercase tracking-wider text-slate-400'>Latest Upload</p>
                    <p className='text-sm font-bold text-slate-900 mt-1'>Today, 09:30 AM</p>
                </div>
                <div className='p-3 bg-purple-50 text-purple-600 rounded-lg'>
                    <Calendar className='w-6 h-6'/>
                </div>
            </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className='text-base font-semibold text-slate-900'>Recent Diagnostic Report</h2>
        </div>
        <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm text-slate-600'>
                <thead className='bg-slate-50 text-slate-700 font-semibold border-b border-slate-200'>
                    <tr>
                        <th className='p-4'>Report Name</th>
                        <th className='p-4'>Upload Date</th>
                        <th className='p-4'>Status</th>
                        <th className='p-4'>Risk Flags</th>
                        <th className='p-4' text-right>Action</th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-slate-100'>
                    {dummyReports.map((report)=>(
                        <tr key={report.id} className='hover:bg-slate-50/80 transition'>
                            <td className='p-4 font-medium text-slate-900'>{report.name}</td>
                            <td className='p-4 text-slate-500'>{report.date}</td>
                            <td className='p-4'>
                                <span className='px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full'>
                                    {report.status}
                                </span>
                            </td>
                            <td className='p-4'>
                                <div className='flex gap-2'>
                                    {report.low >0 && <span className='px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded'>{report.low}Low</span>}
                                    {report.high >0 && <span className='px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded'>{report.high}High</span>}
                                </div>
                            </td>
                            <td className='p-4 text-right'>
                                <Link to ={'/report/${report.id}'} className='text-blue-600 hover:text-blue-700 font-mediu, inline-flex items-center gap-1'>View Results <ArrowRight className='w-4 h-4'/>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
</div>
  );
}