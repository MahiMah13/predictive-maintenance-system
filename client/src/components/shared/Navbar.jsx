import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useIoTStream } from '../../context/IoTStreamContext';
import { Cpu, Bell, ShieldCheck, LogOut, Factory, AlertTriangle, Activity, CheckCircle2, Clock, X, Radio, ChevronDown, Sparkles, Eye, Wrench, Building } from 'lucide-react';

export default function Navbar() {
  const { user, organization, logoutUser, switchRole } = useAuth();
  const { isStreaming, toggleStreaming, anomalyEvent } = useIoTStream() || {};
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Critical Risk Alert: PUMP-101',
      message: 'Drive-End bearing failure risk score spiked to 84%. RUL estimate: 120 hrs.',
      time: '10m ago',
      type: 'critical',
      read: false,
      link: '/ai/failure-prediction/default'
    },
    {
      id: 'notif-2',
      title: 'Vibration Threshold Exceeded',
      message: 'Telemetry logged 6.8 mm/s vibration on Main Feed Pump (Limit: 4.5 mm/s).',
      time: '25m ago',
      type: 'warning',
      read: false,
      link: '/failures'
    },
    {
      id: 'notif-3',
      title: 'Work Order In Progress',
      message: 'WO-70001: Bearing Replacement assigned to Alex Rivera.',
      time: '1h ago',
      type: 'info',
      read: false,
      link: '/schedule'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (anomalyEvent) {
      setNotifications(prev => [
        {
          id: anomalyEvent.id,
          title: `LIVE IOT ALERT: ${anomalyEvent.asset_name}`,
          message: anomalyEvent.message,
          time: 'Just now',
          type: 'critical',
          read: false,
          link: '/ai/planner'
        },
        ...prev
      ]);
    }
  }, [anomalyEvent]);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotifClick = (e, notif) => {
    e?.stopPropagation();
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    setShowNotifications(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const dismissNotification = (e, id) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const currentRole = user?.role || 'reliability_engineer';

  const roleLabels = {
    admin: 'Plant Administrator',
    reliability_engineer: 'Reliability Engineer',
    technician: 'Field Technician',
    viewer: 'Executive Auditor'
  };

  return (
    <header className="h-16 bg-industrial-800/90 backdrop-blur-md border-b border-industrial-border sticky top-0 z-40 px-6 flex items-center justify-between select-none">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="p-2 bg-gradient-to-br from-accent-cyan to-blue-600 rounded-lg text-white shadow-lg shadow-accent-cyan/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block leading-none">
              RELIABILITY <span className="text-accent-cyan">PREDICTIVE</span>
            </span>
            <span className="text-[10px] tracking-widest text-gray-400 font-mono uppercase">
              AI Reliability Platform
            </span>
          </div>
        </Link>

        {organization && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-industrial-900/80 rounded-full border border-industrial-border text-xs text-gray-300">
            <Factory className="w-3.5 h-3.5 text-accent-amber" />
            <span className="font-medium">{organization.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* IoT Live Streaming Toggle Button */}
        {toggleStreaming && (
          <button
            onClick={toggleStreaming}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isStreaming
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/10 animate-pulse'
                : 'bg-industrial-900/80 text-gray-400 border-industrial-border hover:text-white hover:border-gray-600'
            }`}
            title="Toggle Real-Time Sensor Telemetry Stream"
          >
            <Radio className={`w-3.5 h-3.5 ${isStreaming ? 'text-rose-400 animate-spin' : 'text-gray-500'}`} />
            <span>{isStreaming ? 'IoT Stream LIVE' : 'Start IoT Stream'}</span>
          </button>
        )}

        {/* 4-Tier RBAC Role Switcher Dropdown */}
        <div className="relative" ref={roleDropdownRef}>
          <button
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-1.5 bg-industrial-900/90 px-3 py-1.5 rounded-xl border border-industrial-border text-xs text-gray-200 hover:border-accent-cyan/40 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-400 hidden sm:inline">Role:</span>
            <span className="font-bold text-accent-cyan capitalize">
              {roleLabels[currentRole] || 'Reliability Engineer'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-2 w-60 bg-industrial-900 border border-industrial-border rounded-2xl shadow-2xl p-2 z-50">
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 border-b border-industrial-border mb-1">
                Select Enterprise Persona Scope
              </div>

              <button
                onClick={() => { switchRole('admin'); setShowRoleDropdown(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  currentRole === 'admin' ? 'bg-accent-cyan/20 text-accent-cyan font-bold' : 'text-gray-300 hover:bg-industrial-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-purple-400" />
                  <span>Plant Administrator</span>
                </div>
                {currentRole === 'admin' && <CheckCircle2 className="w-3.5 h-3.5 text-accent-cyan" />}
              </button>

              <button
                onClick={() => { switchRole('reliability_engineer'); setShowRoleDropdown(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  currentRole === 'reliability_engineer' ? 'bg-accent-cyan/20 text-accent-cyan font-bold' : 'text-gray-300 hover:bg-industrial-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent-amber" />
                  <span>Reliability Engineer</span>
                </div>
                {currentRole === 'reliability_engineer' && <CheckCircle2 className="w-3.5 h-3.5 text-accent-cyan" />}
              </button>

              <button
                onClick={() => { switchRole('technician'); setShowRoleDropdown(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  currentRole === 'technician' ? 'bg-accent-cyan/20 text-accent-cyan font-bold' : 'text-gray-300 hover:bg-industrial-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  <span>Field Technician</span>
                </div>
                {currentRole === 'technician' && <CheckCircle2 className="w-3.5 h-3.5 text-accent-cyan" />}
              </button>

              <button
                onClick={() => { switchRole('viewer'); setShowRoleDropdown(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  currentRole === 'viewer' ? 'bg-accent-cyan/20 text-accent-cyan font-bold' : 'text-gray-300 hover:bg-industrial-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  <span>Executive Viewer (Auditor)</span>
                </div>
                {currentRole === 'viewer' && <CheckCircle2 className="w-3.5 h-3.5 text-accent-cyan" />}
              </button>
            </div>
          )}
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={toggleNotifications}
            title="Notifications"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-industrial-700 relative transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
              </>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-industrial-900 border border-industrial-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-industrial-border flex items-center justify-between bg-industrial-800/50">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-accent-cyan" />
                  <h3 className="text-sm font-bold text-white">System Alerts</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-accent-cyan hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-industrial-border/50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    No active notifications.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={(e) => handleNotifClick(e, notif)}
                      className={`p-3.5 hover:bg-industrial-800/80 transition-colors cursor-pointer flex gap-3 group relative ${
                        !notif.read ? 'bg-industrial-800/30' : ''
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {notif.type === 'critical' ? (
                          <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                            <AlertTriangle className="w-4 h-4" />
                          </div>
                        ) : notif.type === 'warning' ? (
                          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Activity className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                            <CheckCircle2 className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className={`text-xs font-semibold truncate ${!notif.read ? 'text-white font-bold' : 'text-gray-300'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3" />
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                      </div>

                      <button
                        onClick={(e) => dismissNotification(e, notif.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-gray-300 absolute top-3 right-2"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-industrial-900 border-t border-industrial-border text-center">
                <Link
                  to="/failures"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-gray-400 hover:text-accent-cyan transition-colors"
                >
                  View All Telemetry Alerts & Logs →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-l border-industrial-border pl-4">
          <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-accent-cyan/20 border border-accent-cyan/40 text-accent-cyan flex items-center justify-center font-bold text-xs">
              {user?.full_name?.charAt(0) || 'U'}
            </div>
            <span className="hidden lg:inline text-xs font-semibold text-gray-200">
              {user?.full_name || 'Plant Engineer'}
            </span>
          </Link>

          <button
            onClick={logoutUser}
            title="Log Out"
            className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
