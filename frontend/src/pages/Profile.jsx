import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, ShieldCheck, Heart, Save, CheckCircle2, History, FileText, Calendar, ExternalLink, Activity, Loader2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/Api';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' or 'history'
  
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone_number: '',
    blood_group: 'O+',
    emergency_contact: '',
    height_cm: '',
    weight_kg: '',
    bmi: null,
    bmi_category: 'Not Provided',
    is_phone_verified: false,
  });

  const [historyLogs, setHistoryLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch real profile and report history from Django backend on load
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [profileRes, reportsRes] = await Promise.all([
          api.get('/profile/'),
          api.get('/reports/')
        ]);

        setProfileData(profileRes.data);
        setHistoryLogs(reportsRes.data || []);
      } catch (err) {
        console.error('Failed to load profile details:', err);
        setErrorMessage('Could not load profile information.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setIsSaved(false);

    try {
      const response = await api.patch('/profile/', profileData);
      setProfileData(response.data);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setErrorMessage(err.response?.data?.error || 'Failed to update profile settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span>Loading profile intelligence...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            {profileData.username ? profileData.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{profileData.username || 'User Profile'}</h1>
            <p className="text-sm text-slate-500">{profileData.email || 'No email provided'}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border ${
          profileData.is_phone_verified 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          <ShieldCheck className="w-4 h-4" /> {profileData.is_phone_verified ? 'Phone Verified' : 'Unverified Phone'}
        </span>
      </div>

      {/* Error Notification Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile vs History Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 shadow-xs">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm transition border-b-2 ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" /> Account & Vitals
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm transition border-b-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" /> Scan & Upload History ({historyLogs.length})
        </button>
      </div>

      {/* TAB 1: PROFILE & VITALS FORM */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="bg-white rounded-b-2xl shadow-xs border border-slate-200/80 p-6 space-y-6">
          {isSaved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm font-medium flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Profile and health vitals successfully updated!</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Username</label>
              <input
                type="text"
                disabled
                value={profileData.username}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Email Address</label>
              <input
                type="email"
                value={profileData.email || ''}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                placeholder="user@hospital.org"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Phone Number</label>
              <input
                type="tel"
                disabled
                value={profileData.phone_number}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Blood Group</label>
              <select
                value={profileData.blood_group || 'O+'}
                onChange={(e) => setProfileData({ ...profileData, blood_group: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Emergency Contact</label>
              <input
                type="tel"
                value={profileData.emergency_contact || ''}
                onChange={(e) => setProfileData({ ...profileData, emergency_contact: e.target.value })}
                placeholder="+91 9123456789"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
              />
            </div>
          </div>

          {/* Body Vitals & BMI Engine Section */}
          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" /> Body Vitals & Integrated BMI Engine
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profileData.height_cm || ''}
                  onChange={(e) => setProfileData({ ...profileData, height_cm: e.target.value })}
                  placeholder="175.0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profileData.weight_kg || ''}
                  onChange={(e) => setProfileData({ ...profileData, weight_kg: e.target.value })}
                  placeholder="70.0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">Computed BMI</label>
                <div className="px-3.5 py-2.5 bg-blue-50/50 border border-blue-200 rounded-lg text-sm font-bold text-blue-900 flex items-center justify-between">
                  <span>{profileData.bmi || '---'}</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-md font-normal">
                    {profileData.bmi_category || 'Not Provided'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 disabled:bg-slate-300 transition flex items-center gap-2 shadow-sm"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Profile & Vitals'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: LIVE REPORT EXTRACTION HISTORY LOG */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-b-2xl shadow-xs border border-slate-200/80 p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" /> Medical Report Extraction Log
          </h2>

          <div className="divide-y divide-slate-100">
            {historyLogs.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">No report history found. Upload a lab report to start tracking.</p>
            ) : (
              historyLogs.map((log) => (
                <div key={log.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{log.report_name || `Report ID: ${log.id}`}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> Processed on {new Date(log.uploaded_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                      {log.status}
                    </span>
                    <Link
                      to={`/report/${log.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      View Metrics <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}