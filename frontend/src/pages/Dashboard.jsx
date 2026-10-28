import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileCheck, AlertTriangle, FileUp, Calendar, ArrowRight, Loader2, Activity } from 'lucide-react';
import api from '../services/Api';

export default function Dashboard() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    // Fetch real reports from Django backend on mount
    useEffect(() => {
        const fetchReports = async () => {
            setLoading(true);
            try {
                const response = await api.get('/reports/');
                setReports(response.data || []);
            } catch (err) {
                console.error('Failed to fetch diagnostic reports:', err);
                setErrorMessage('Could not load dashboard reports from server.');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // Compute dynamic dashboard metrics based on live reports data
    const totalReports = reports.length;
    const latestReport = reports.length > 0 ? reports[0] : null;
    
    // Format latest upload time cleanly
    const latestUploadTime = latestReport 
        ? new Date(latestReport.uploaded_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        : 'No uploads yet';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px] text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span>Loading diagnostic dashboard...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-sm text-slate-500">Track and extract insights from your medical lab scans</p>
                </div>
                <Link to="/upload" className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
                    <FileUp className="w-4 h-4"/>
                    Upload New Report
                </Link>
            </div>

            {/* Error Banner */}
            {errorMessage && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium">
                    {errorMessage}
                </div>
            )}

            {/* Dynamic Metric Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Reports</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{totalReports}</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <FileCheck className="w-6 h-6"/>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Processing Engine</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">Active</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Activity className="w-6 h-6"/>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">System Status</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">Synced</p>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <FileCheck className="w-6 h-6"/>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Latest Upload</p>
                        <p className="text-sm font-bold text-slate-900 mt-1">{latestUploadTime}</p>
                    </div>
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                        <Calendar className="w-6 h-6"/>
                    </div>
                </div>
            </div>

            {/* Recent Diagnostic Reports Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-base font-semibold text-slate-900">Recent Diagnostic Reports</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                            <tr>
                                <th className="p-4">Report Name / File</th>
                                <th className="p-4">Upload Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reports.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-slate-400">
                                        No diagnostic reports found. Upload your first PDF or image scan to get started.
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-slate-50/80 transition">
                                        <td className="p-4 font-medium text-slate-900">
                                            {report.report_name || report.report_file?.split('/').pop() || `Report #${report.id}`}
                                        </td>
                                        <td className="p-4 text-slate-500">
                                            {new Date(report.uploaded_at).toLocaleDateString()} {new Date(report.uploaded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                                                {report.status || 'PROCESSED'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <Link to={`/report/${report.id}`} className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
                                                View Results <ArrowRight className="w-4 h-4"/>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}