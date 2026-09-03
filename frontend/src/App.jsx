import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, HeartPulse, ChevronLeft, ChevronRight,LogIn } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import UploadReport from './pages/UploadReport';
import ReportDetail from './pages/ReportDetail';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
function Sidebar({ isCollapsed, setIsCollapsed }) {
  const location = useLocation();

  if(location.pathname === '/auth') return null;

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload Report', path: '/upload', icon: Upload },
    { name: 'Report Detail', path: '/report/1', icon: FileText },
    {name:'Profile',path:'/profile',icon:User},
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 h-screen bg-slate-900 text-slate-100 p-4 flex flex-col justify-between transition-all duration-300 z-50 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Logo & Toggle Button Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <HeartPulse className="w-8 h-8 text-blue-400 shrink-0" />
            {!isCollapsed && (
              <span className="text-xl font-bold tracking-tight text-white whitespace-nowrap">
                MedExtract AI
              </span>
            )}
          </div>
          {/* Collapse Toggle Button */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? item.name : ''}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>
<div className="space-y-2 border-t border-slate-800 pt-3">
        <Link 
          to="/auth" 
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <LogIn className="w-5 h-5 shrink-0 text-slate-400" />
          {!isCollapsed && <span className="whitespace-nowrap">Sign Out / Login</span>}
        </Link>
      </div>
    </aside>
  );
}
export default function App() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Router>
      <AppContent isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
    </Router>
  );
}

function AppContent({isCollapsed,setIsCollapsed}) {
  const location=useLocation();
  const isAuthPage=location.pathname ==='/auth';


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main 
        className={`flex-1 transition-all duration-300 min-h-screen ${
          isAuthPage ? 'ml-0' : isCollapsed ? 'ml-20 p-8' : 'ml-64 p-8'
        }`}
      >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadReport />} />
            <Route path="/report/:id" element={<ReportDetail />} />
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/auth" element={<Auth/>}/>
          </Routes>
        </main>
      </div>
  );
}