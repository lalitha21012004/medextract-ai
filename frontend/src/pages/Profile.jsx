import React, { useState } from 'react';
import { User, Mail, Phone, ShieldCheck, Heart, Save, CheckCircle2, History, FileText, Calendar, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'history'

  const [profileData, setProfileData] = useState({
    fullName: 'Dr. Sarah Jenkins',
    email: 'sarah.jenkins@health.org',
    phone: '+91 9876543210',
    bloodGroup: 'O+',
    dob: '1992-05-15',
    emergencyContact: '+91 9123456789',
    role: 'Patient / Individual User',
  });

  const [isSaved, setIsSaved] = useState(false);

  // Sample Audit History Data
  const historyLogs = [
    { id: 1, reportName: 'Complete_Blood_Count.pdf', date: '2026-09-02 09:30 AM', status: 'PROCESSED', risk: '1 Low Flag' },
    { id: 2, reportName: 'Lipid_Profile_Scan.png', date: '2026-08-28 02:15 PM', status: 'PROCESSED', risk: '1 High Flag' },
    { id: 3, reportName: 'Thyroid_Panel_Report.pdf', date: '2026-07-14 11:00 AM', status: 'PROCESSED', risk: 'Normal' },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {profileData.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{profileData.fullName}</h1>
            <p className="text-sm text-slate-500">{profileData.role} • MedExtract AI Account</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4" /> Phone Verified
        </span>
      </div>

      {/* Profile vs History Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm transition border-b-2 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" /> Account Details
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm transition border-b-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" /> Scan & Upload History
        </button>
      </div>

      {/* TAB 1: PROFILE FORM */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white rounded-b-2xl shadow-xs border border-slate-200/80 p-6 space-y-6">
          {isSaved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Profile information successfully updated!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Blood Group</label>
              <select
                value={profileData.bloodGroup}
                onChange={(e) => setProfileData({ ...profileData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
              >
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="AB+">AB+</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: UPLOAD HISTORY LOG */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-b-2xl shadow-xs border border-slate-200/80 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" /> Medical Report Extraction Log
          </h2>

          <div className="divide-y divide-slate-100">
            {historyLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-800">{log.reportName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> Processed on {log.date}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md">
                    {log.risk}
                  </span>
                  <Link
                    to={`/report/${log.id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    View Metrics <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}