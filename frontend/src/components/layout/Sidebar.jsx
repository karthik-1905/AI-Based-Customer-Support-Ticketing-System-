import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.jsx';
import {
  LayoutDashboard, Briefcase, Users, GitBranch, FileText,
  Calendar, BarChart3, Settings, LogOut, ChevronLeft,
  ChevronRight, Search, Shield, Brain, UserCheck,
} from 'lucide-react';

const recruiterMenu = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Briefcase, label: 'Jobs', to: '/jobs' },
  { icon: Users, label: 'Candidates', to: '/candidates' },
  { icon: GitBranch, label: 'Pipeline', to: '/pipeline' },
  { icon: Calendar, label: 'Interviews', to: '/interviews' },
  { icon: BarChart3, label: 'Analytics', to: '/analytics' },
  { icon: FileText, label: 'Resume Analyzer', to: '/resume-analyzer' },
];

const candidateMenu = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Search, label: 'Browse Jobs', to: '/jobs' },
  { icon: FileText, label: 'My Resume', to: '/resume-analyzer' },
  { icon: Calendar, label: 'Interviews', to: '/interviews' },
];

const adminMenu = [
  ...recruiterMenu,
  { icon: Shield, label: 'Admin Panel', to: '/admin' },
];

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = user?.role === 'admin' ? adminMenu : user?.role === 'candidate' ? candidateMenu : recruiterMenu;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 p-4 border-b border-slate-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
          <Brain size={20} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="text-lg font-bold text-gradient overflow-hidden whitespace-nowrap"
            >
              RecruitAI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto sidebar-scroll">
        {menuItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative
              ${isActive
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-text-light hover:bg-slate-100 hover:text-text'
              }
              ${collapsed ? 'justify-center' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip when collapsed */}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
                    {label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User & Collapse */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <NavLink
          to="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-light hover:bg-slate-100 hover:text-text transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings size={18} />
          {!collapsed && <span>Settings</span>}
        </NavLink>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all duration-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* User card */}
        {!collapsed && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.split(' ').map((w) => w[0]).join('').slice(0, 2) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-text truncate">{user?.name}</p>
              <p className="text-xs text-text-muted capitalize truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col bg-white border-r border-slate-200 relative flex-shrink-0 h-screen sticky top-0"
      >
        <SidebarContent />
        {/* Collapse toggle */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-primary transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </motion.button>
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }}
              animate={{ x: 0 }}
              exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-60 bg-white shadow-2xl z-50 flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
