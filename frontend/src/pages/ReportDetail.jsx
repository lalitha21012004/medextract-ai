import React, { useEffect, useState } from 'react';
import { ArrowLeft, Printer, AlertTriangle, CheckCircle, Bot, FileText, Send, Loader2, Calendar, ChevronRight, Activity, ShieldAlert } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/Api';
import FormattedMarkdown from '../components/FormattedMarkdown';

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [reportList, setReportList] = useState([]);
  const [currentReport, setCurrentReport] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Active view tab: 'table' or 'ai'
  const [activeTab, setActiveTab] = useState('table');

  // AI Summary & Chat States
  const [aiSummary, setAiSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: 'Hello! I have analyzed your medical report. Feel free to ask me any questions about your results.' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // Fetch all user reports for history and specific report details
  useEffect(() => {
    const fetchReportsAndDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const listRes = await api.get('/reports/');
        setReportList(listRes.data || []);

        let targetId = id;
        if (!targetId && listRes.data && listRes.data.length > 0) {
          targetId = listRes.data[0].id;
          navigate(`/report/${targetId}`, { replace: true });
          return;
        }

        if (targetId) {
          const detailRes = await api.get(`/reports/${targetId}/`);
          setCurrentReport(detailRes.data);
          setMetrics(detailRes.data.parameters || []);
          setAiSummary(''); 
          setChatMessages([
            { sender: 'ai', text: 'Hello! I have analyzed this medical report. Feel free to ask me any questions about your results.' }
          ]);
        } else {
          setError('No reports found. Please upload a lab report to get started.');
        }
      } catch (err) {
        console.error('Failed to load report data:', err);
        setError('Report not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };

    fetchReportsAndDetails();
  }, [id, navigate]);

  // Fetch AI Summary when switching to AI tab
  const handleTabSwitch = async (tab) => {
    setActiveTab(tab);
    if (tab === 'ai' && !aiSummary && id) {
      setLoadingSummary(true);
      try {
        const res = await api.get(`/reports/${id}/summary/`);
        setAiSummary(res.data.ai_summary || 'No summary available.');
      } catch (err) {
        console.error('Failed to fetch AI summary:', err);
        setAiSummary('Could not generate AI summary at this time.');
      } finally {
        setLoadingSummary(false);
      }
    }
  };

  // Handle AI Chat submission
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || sendingChat) return;

    const question = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { sender: 'user', text: question }]);
    setSendingChat(true);

    try {
      const res = await api.post(`/reports/${id}/chat/`, { question });
      setChatMessages(prev => [...prev, { sender: 'ai', text: res.data.answer }]);
    } catch (err) {
      console.error('AI chat error:', err);
      setChatMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error answering your question. Please try again.' }]);
    } finally {
      setSendingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[450px] text-slate-500 gap-2">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span>Loading report details and parameters...</span>
      </div>
    );
  }

  if (error && reportList.length === 0) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
        <p className="text-slate-700 font-medium">{error}</p>
        <Link to="/upload" className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition shadow-sm">
          Upload a Lab Report
        </Link>
      </div>
    );
  }

  // Calculate risk distribution for metrics
  const normalCount = metrics.filter(m => m.risk_level === 'NORMAL').length;
  const flagCount = metrics.filter(m => m.risk_level === 'LOW' || m.risk_level === 'HIGH').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto pb-12">
      
      {/* LEFT SIDEBAR: Report History Drawer */}
      <div className="lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4 h-fit">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" /> Past Reports
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full font-semibold">
            {reportList.length}
          </span>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {reportList.map((rep) => {
            const isSelected = String(rep.id) === String(id);
            return (
              <button
                key={rep.id}
                onClick={() => navigate(`/report/${rep.id}`)}
                className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between group ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50/60 text-blue-900 shadow-2xs' 
                    : 'border-slate-100 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                <div className="space-y-1 truncate pr-2">
                  <p className="text-xs font-semibold truncate">
                    {rep.report_name || `Report ID: ${rep.id}`}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(rep.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition ${isSelected ? 'text-blue-600' : 'text-slate-300 group-hover:text-slate-500'}`} />
              </button>
            );
          })}
        </div>

        <Link
          to="/upload"
          className="w-full mt-2 block text-center bg-slate-900 text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-2xs"
        >
          + Upload New Report
        </Link>
      </div>

      {/* RIGHT MAIN CONTENT: Detailed Report Hub */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* Navigation & Format Switcher Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link to="/" className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => handleTabSwitch('table')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'table' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" /> Metrics Table
              </button>
              <button
                onClick={() => handleTabSwitch('ai')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'ai' ? 'bg-white text-emerald-600 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Bot className="w-4 h-4" /> AI Analysis & Chat
              </button>
            </div>

            <button 
              onClick={() => window.print()}
              className="border border-slate-300 bg-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-50 flex items-center gap-2 shadow-2xs"
            >
              <Printer className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Report Summary Header Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {currentReport?.report_name || 'Medical Lab Report Analysis'}
            </h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
              <span>Uploaded: {currentReport ? new Date(currentReport.uploaded_at).toLocaleString() : ''}</span>
              <span>•</span>
              <span>Report ID: #{id}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-semibold text-xs rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> {currentReport?.status || 'PROCESSED'}
            </span>
            {flagCount > 0 && (
              <span className="px-3 py-1 bg-amber-50 text-amber-700 font-semibold text-xs rounded-full border border-amber-200 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {flagCount} Flagged
              </span>
            )}
          </div>
        </div>

        {/* TAB 1: STRUCTURED METRICS TABLE */}
        {activeTab === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600" /> Extracted Test Metrics & Deep Analysis
              </h2>
              <span className="text-xs text-slate-400">{metrics.length} parameters found</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Parameter Name</th>
                    <th className="p-4">Observed Value</th>
                    <th className="p-4">Reference Range</th>
                    <th className="p-4">Risk Level</th>
                    <th className="p-4">AI Clinical Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-8 text-center text-slate-400">
                        No parameters extracted for this report.
                      </td>
                    </tr>
                  ) : (
                    metrics.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-semibold text-slate-900">{item.parameter_name}</td>
                        <td className="p-4 font-bold text-slate-800">{item.observed_value} {item.unit}</td>
                        <td className="p-4 text-slate-500 font-mono text-xs">{item.reference_range || 'N/A'}</td>
                        <td className="p-4">
                          {item.risk_level === 'NORMAL' && (
                            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg inline-flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" /> NORMAL
                            </span>
                          )}
                          {item.risk_level === 'LOW' && (
                            <span className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> LOW
                            </span>
                          )}
                          {item.risk_level === 'HIGH' && (
                            <span className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> HIGH
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500 text-xs italic">{item.possible_symptoms || 'Standard clinical limits.'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: AI CLINICAL SUMMARY & CHAT ASSISTANT */}
        {activeTab === 'ai' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            
            {/* AI Summary Column */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold border-b border-slate-100 pb-3">
                <Bot className="w-5 h-5" />
                <h2>AI Clinical Summary</h2>
              </div>
              {loadingSummary ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                  <span>Synthesizing insights...</span>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <FormattedMarkdown content={aiSummary} />
                </div>
              )}
            </div>

            {/* AI Chat Assistant Column */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[550px]">
              <div className="p-4 border-b border-slate-100 flex items-center gap-2 font-semibold text-slate-900">
                <Bot className="w-5 h-5 text-blue-600" />
                <span>Ask AI About Your Report</span>
              </div>

              {/* Chat Messages Box */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none shadow-2xs' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-2xs'
                    }`}>
                      {msg.sender==='user'?(
                        msg.text):(
                          <FormattedMarkdown content={msg.text}/>
                        )}
                    </div>
                  </div>
                ))}
                {sendingChat && (
                  <div className="flex justify-start">
                    <div className="bg-white text-slate-500 border border-slate-200 p-3 rounded-2xl rounded-bl-none text-sm flex items-center gap-2 shadow-2xs">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Analyzing metrics...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex gap-2 rounded-b-2xl">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="e.g., What does my hemoglobin result mean?"
                  className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 bg-slate-50/50"
                />
                <button
                  type="submit"
                  disabled={sendingChat || !userInput.trim()}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}