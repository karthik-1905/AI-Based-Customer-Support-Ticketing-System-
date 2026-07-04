import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { mockNotifications } from '../../data/mockData.js';
import { getInitials } from '../../utils/formatters.js';
import {
  Brain,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Check,
  Menu,
  X,
} from 'lucide-react';

const Navbar = ({ onMenuToggle, showMenuButton }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const notifIcons = { application: '📄', interview: '🎙️', offer: '🎉', system: '⚙️' };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm"
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + mobile menu toggle */}
          <div className="flex items-center gap-3">
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors lg:hidden"
              >
                <Menu size={20} />
              </button>
            )}
            <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-md group-hover:shadow-glow-primary transition-all duration-300">
                <Brain size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-gradient hidden sm:block">RecruitAI</span>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </motion.button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false); }}
                    className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {notifOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                          <h3 className="font-semibold text-text text-sm">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-primary hover:underline font-medium">
                              Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {notifications.map((n) => (
                            <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 cursor-pointer flex gap-3 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                              <span className="text-lg mt-0.5 flex-shrink-0">{notifIcons[n.type] || '🔔'}</span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!n.read ? 'text-text font-medium' : 'text-text-light'}`}>{n.message}</p>
                                <p className="text-xs text-text-muted mt-0.5">{n.time}</p>
                              </div>
                              {!n.read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Avatar Dropdown */}
                <div className="relative" ref={userRef}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setUserOpen(!userOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.avatar ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" /> : getInitials(user?.name)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-semibold text-text leading-none">{user?.name?.split(' ')[0]}</p>
                      <p className="text-xs text-text-muted capitalize">{user?.role?.replace('_', ' ')}</p>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {userOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden py-1"
                      >
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="font-semibold text-text text-sm">{user?.name}</p>
                          <p className="text-xs text-text-muted">{user?.email}</p>
                        </div>
                        {[
                          { icon: User, label: 'Profile', to: '/profile' },
                          { icon: Settings, label: 'Settings', to: '/settings' },
                        ].map(({ icon: Icon, label, to }) => (
                          <Link key={label} to={to} onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-slate-50 transition-colors">
                            <Icon size={15} className="text-text-light" />
                            {label}
                          </Link>
                        ))}
                        <div className="border-t border-slate-100 mt-1">
                          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut size={15} />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="text-sm font-medium text-text-light hover:text-primary transition-colors px-3 py-2">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary text-sm !px-4 !py-2">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
