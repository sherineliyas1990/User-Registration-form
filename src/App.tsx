/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, Users, Search, QrCode, Trash2, Edit, Download, 
  CheckCircle2, AlertCircle, RefreshCw, Filter, ChevronRight, 
  ShieldCheck, Mail, Phone, Hash, User, Building, Calendar, 
  Printer, X, ArrowUpDown, Sparkles, FileSpreadsheet
} from 'lucide-react';

interface RegisteredUser {
  id: string;
  name: string;
  registerNumber: string;
  email: string;
  phone: string;
  department: string;
  role: 'Student' | 'Faculty' | 'Staff' | 'Guest';
  registeredAt: string;
  avatarColor: string;
}

const INITIAL_USERS: RegisteredUser[] = [
  {
    id: 'usr-1',
    name: 'Elena Rostova',
    registerNumber: 'REG-2026-001',
    email: 'elena.rostova@university.edu',
    phone: '+1 (555) 234-5678',
    department: 'Computer Science',
    role: 'Student',
    registeredAt: '2026-10-01T09:30:00Z',
    avatarColor: 'bg-indigo-600'
  },
  {
    id: 'usr-2',
    name: 'Marcus Chen',
    registerNumber: 'REG-2026-002',
    email: 'marcus.chen@university.edu',
    phone: '+1 (555) 890-1234',
    department: 'Electrical Engineering',
    role: 'Student',
    registeredAt: '2026-10-03T14:15:00Z',
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'usr-3',
    name: 'Dr. Sarah Jenkins',
    registerNumber: 'REG-2026-003',
    email: 'sarah.jenkins@university.edu',
    phone: '+1 (555) 456-7890',
    department: 'Artificial Intelligence',
    role: 'Faculty',
    registeredAt: '2026-10-05T10:00:00Z',
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'usr-4',
    name: 'Liam Vance',
    registerNumber: 'REG-2026-004',
    email: 'liam.vance@university.edu',
    phone: '+1 (555) 321-6543',
    department: 'Business Administration',
    role: 'Student',
    registeredAt: '2026-10-10T11:20:00Z',
    avatarColor: 'bg-rose-600'
  },
  {
    id: 'usr-5',
    name: 'Aisha Al-Mansoor',
    registerNumber: 'REG-2026-005',
    email: 'aisha.almansoor@university.edu',
    phone: '+1 (555) 678-9012',
    department: 'Mechanical Engineering',
    role: 'Student',
    registeredAt: '2026-10-12T16:45:00Z',
    avatarColor: 'bg-sky-600'
  }
];

const DEPARTMENTS = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Artificial Intelligence',
  'Business Administration',
  'Data Science',
  'Design & Architecture',
  'Biomedical Sciences'
];

export default function App() {
  const [users, setUsers] = useState<RegisteredUser[]>(() => {
    const saved = localStorage.getItem('registrypro_users_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_USERS;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'register' | 'directory'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [sortField, setSortField] = useState<'name' | 'registerNumber' | 'registeredAt'>('registeredAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    registerNumber: '',
    email: '',
    phone: '',
    department: DEPARTMENTS[0],
    role: 'Student' as 'Student' | 'Faculty' | 'Staff' | 'Guest'
  });

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // ID Card Modal state
  const [idCardUser, setIdCardUser] = useState<RegisteredUser | null>(null);

  // Toast message
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    localStorage.setItem('registrypro_users_v1', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Auto generate register number helper
  const handleAutoGenerateRegisterNumber = () => {
    const nextNum = users.length + 1;
    const padded = String(nextNum).padStart(3, '0');
    setFormData(prev => ({ ...prev, registerNumber: `REG-2026-${padded}` }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Full name is required.';
    if (!formData.registerNumber.trim()) return 'Register number is required.';
    if (!formData.email.trim()) return 'Email ID is required.';
    if (!formData.phone.trim()) return 'Phone number is required.';

    // Email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address.';

    // Check duplicate register number or email
    const duplicateReg = users.find(u => u.registerNumber.toLowerCase() === formData.registerNumber.toLowerCase() && u.id !== editingUserId);
    if (duplicateReg) return `Register number "${formData.registerNumber}" is already registered.`;

    const duplicateEmail = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== editingUserId);
    if (duplicateEmail) return `Email address "${formData.email}" is already registered.`;

    return null;
  };

  const handleSubmitRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    if (editingUserId) {
      // Update user
      setUsers(prev => prev.map(u => u.id === editingUserId ? {
        ...u,
        name: formData.name,
        registerNumber: formData.registerNumber,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        role: formData.role
      } : u));
      setToastMessage({ type: 'success', text: `Successfully updated profile for ${formData.name}.` });
      setEditingUserId(null);
    } else {
      // Create new user
      const colors = ['bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-sky-600', 'bg-purple-600', 'bg-teal-600'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newUser: RegisteredUser = {
        id: `usr-${Date.now()}`,
        name: formData.name,
        registerNumber: formData.registerNumber,
        email: formData.email,
        phone: formData.phone,
        department: formData.department,
        role: formData.role,
        registeredAt: new Date().toISOString(),
        avatarColor: randomColor
      };

      setUsers(prev => [newUser, ...prev]);
      setToastMessage({ type: 'success', text: `Successfully registered ${formData.name} (${formData.registerNumber}).` });
    }

    // Reset form
    setFormData({
      name: '',
      registerNumber: '',
      email: '',
      phone: '',
      department: DEPARTMENTS[0],
      role: 'Student'
    });
    setActiveTab('directory');
  };

  const handleEditUser = (user: RegisteredUser) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      registerNumber: user.registerNumber,
      email: user.email,
      phone: user.phone,
      department: user.department,
      role: user.role
    });
    setActiveTab('register');
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the registry?`)) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setToastMessage({ type: 'success', text: `Removed ${name} from registry.` });
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Register Number', 'Email', 'Phone', 'Department', 'Role', 'Registered At'];
    const rows = users.map(u => [
      u.id,
      `"${u.name}"`,
      `"${u.registerNumber}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      `"${u.department}"`,
      u.role,
      u.registeredAt
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registry_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToastMessage({ type: 'success', text: 'Successfully exported registry to CSV.' });
  };

  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.registerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDept = selectedDeptFilter === 'All' || user.department === selectedDeptFilter;
      const matchesRole = selectedRoleFilter === 'All' || user.role === selectedRoleFilter;

      return matchesSearch && matchesDept && matchesRole;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, searchQuery, selectedDeptFilter, selectedRoleFilter, sortField, sortOrder]);

  const toggleSort = (field: 'name' | 'registerNumber' | 'registeredAt') => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl text-sm font-medium animate-slide-in">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span className="text-slate-200">{toastMessage.text}</span>
        </div>
      )}

      {/* Top Navigation Bar adhering to Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 lg:px-12 py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">RegistryPro</span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-mono">v2.6</span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/60 p-1 rounded-xl border border-slate-700/50 text-sm font-medium text-slate-300">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white hover:bg-slate-700/50'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => { setEditingUserId(null); setFormData({ name: '', registerNumber: '', email: '', phone: '', department: DEPARTMENTS[0], role: 'Student' }); setActiveTab('register'); }} 
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${activeTab === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white hover:bg-slate-700/50'}`}
          >
            Register User
          </button>
          <button 
            onClick={() => setActiveTab('directory')} 
            className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${activeTab === 'directory' ? 'bg-indigo-600 text-white shadow-sm' : 'hover:text-white hover:bg-slate-700/50'}`}
          >
            Directory ({users.length})
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => { setEditingUserId(null); setFormData({ name: '', registerNumber: '', email: '', phone: '', department: DEPARTMENTS[0], role: 'Student' }); setActiveTab('register'); }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-lg shadow-indigo-600/20 whitespace-nowrap shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Registration</span>
          </button>
        </div>
      </header>

      {/* Mobile Subheader Navigation */}
      <div className="md:hidden flex items-center justify-around bg-slate-800 border-b border-slate-700 px-2 py-2 text-xs font-medium">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`py-1.5 px-3 rounded-lg ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
        >
          Dashboard
        </button>
        <button 
          onClick={() => { setEditingUserId(null); setActiveTab('register'); }}
          className={`py-1.5 px-3 rounded-lg ${activeTab === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
        >
          Register
        </button>
        <button 
          onClick={() => setActiveTab('directory')}
          className={`py-1.5 px-3 rounded-lg ${activeTab === 'directory' ? 'bg-indigo-600 text-white' : 'text-slate-300'}`}
        >
          Directory ({users.length})
        </button>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 lg:p-10">
        
        {/* ================= DASHBOARD VIEW ================= */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Hero Welcome */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-800/90 to-indigo-950/40 border border-slate-700/80 rounded-3xl p-8 lg:p-10 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Secure Member & Student Registry Portal</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
                  User Registration & Identity Management
                </h1>
                <p className="text-slate-300 text-sm lg:text-base leading-relaxed mb-6">
                  Manage student and personnel records seamlessly. Register new users with unique registration numbers, verify email and phone credentials, and issue digital ID badges instantly.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => { setEditingUserId(null); setActiveTab('register'); }}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register New User</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('directory')}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>View Directory ({users.length})</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Registered</span>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white font-mono tabular-nums">{users.length}</div>
                <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                  <span>Active member accounts</span>
                </div>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Students</span>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <User className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white font-mono tabular-nums">
                  {users.filter(u => u.role === 'Student').length}
                </div>
                <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                  <span>Enrolled candidates</span>
                </div>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Faculty & Staff</span>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Building className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white font-mono tabular-nums">
                  {users.filter(u => u.role === 'Faculty' || u.role === 'Staff').length}
                </div>
                <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                  <span>Academic personnel</span>
                </div>
              </div>

              <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Departments</span>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Hash className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white font-mono tabular-nums">
                  {new Set(users.map(u => u.department)).size}
                </div>
                <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                  <span>Active faculties</span>
                </div>
              </div>
            </div>

            {/* Recent Registrations Preview Section */}
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-6 lg:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Recent Registrations</h2>
                  <p className="text-xs text-slate-400">Latest members added to the system directory</p>
                </div>
                <button 
                  onClick={() => setActiveTab('directory')}
                  className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <span>View all records</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Name & ID</th>
                      <th className="pb-3 font-semibold">Register Number</th>
                      <th className="pb-3 font-semibold">Contact Email & Phone</th>
                      <th className="pb-3 font-semibold">Department</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60">
                    {users.slice(0, 5).map(user => (
                      <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl ${user.avatarColor} text-white font-bold flex items-center justify-center text-xs shadow-md shrink-0`}>
                              {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{user.name}</div>
                              <div className="text-xs text-slate-400">{user.role}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 font-mono text-xs text-indigo-300">
                          {user.registerNumber}
                        </td>
                        <td className="py-4 pr-4">
                          <div className="text-slate-300 text-xs">{user.email}</div>
                          <div className="text-slate-400 text-xs font-mono">{user.phone}</div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-slate-700/50 border border-slate-600 text-xs text-slate-200">
                            {user.department}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => setIdCardUser(user)}
                              title="View Digital ID Card"
                              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditUser(user)}
                              title="Edit User"
                              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              title="Delete User"
                              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= REGISTER / EDIT VIEW ================= */}
        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-8 shadow-xl">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {editingUserId ? 'Edit User Registration' : 'New User Registration'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {editingUserId ? 'Update member details in the registry database' : 'Enter user personal details, register number, email, and phone'}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('directory')}
                  className="text-xs text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>

              {formError && (
                <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitRegistration} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="e.g. Alexander Wright" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Register Number */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Register Number <span className="text-rose-400">*</span>
                    </label>
                    {!editingUserId && (
                      <button 
                        type="button" 
                        onClick={handleAutoGenerateRegisterNumber}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Auto-generate</span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      name="registerNumber" 
                      value={formData.registerNumber} 
                      onChange={handleInputChange} 
                      placeholder="e.g. REG-2026-089" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email ID */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                    Email ID <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      placeholder="e.g. alexander.wright@university.edu" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="e.g. +1 (555) 987-6543" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>

                {/* Department & Role Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                      Department
                    </label>
                    <select 
                      name="department" 
                      value={formData.department} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      {DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                      User Role
                    </label>
                    <select 
                      name="role" 
                      value={formData.role} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    >
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty</option>
                      <option value="Staff">Staff</option>
                      <option value="Guest">Guest</option>
                    </select>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setActiveTab('directory')}
                    className="px-6 py-3 rounded-xl border border-slate-700 hover:bg-slate-700 text-sm font-medium text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{editingUserId ? 'Save Changes' : 'Complete Registration'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================= DIRECTORY VIEW ================= */}
        {activeTab === 'directory' && (
          <div className="space-y-6 animate-fade-in">
            {/* Search & Filter Toolbar */}
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search Input */}
                <div className="relative w-full lg:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    placeholder="Search by name, register #, email..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
                  {/* Department Filter */}
                  <select 
                    value={selectedDeptFilter} 
                    onChange={e => setSelectedDeptFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="All">All Departments</option>
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  {/* Role Filter */}
                  <select 
                    value={selectedRoleFilter} 
                    onChange={e => setSelectedRoleFilter(e.target.value)}
                    className="px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="All">All Roles</option>
                    <option value="Student">Students</option>
                    <option value="Faculty">Faculty</option>
                    <option value="Staff">Staff</option>
                    <option value="Guest">Guest</option>
                  </select>

                  {/* Export CSV */}
                  <button 
                    onClick={handleExportCSV}
                    className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 border border-slate-700 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-xl transition-all"
                    title="Export to CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <div className="text-sm font-semibold text-white">
                  Registry Directory <span className="ml-2 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono">{filteredUsers.length} found</span>
                </div>
                <div className="text-xs text-slate-400">
                  Showing sorted records
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-white mb-1">No registered users found</h3>
                  <p className="text-xs text-slate-400 mb-4">Try adjusting your search query or department filters.</p>
                  <button 
                    onClick={() => { setSearchQuery(''); setSelectedDeptFilter('All'); setSelectedRoleFilter('All'); }}
                    className="px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-xl hover:bg-indigo-500 transition-all"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-slate-900/50 border-b border-slate-700 text-xs text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-6 font-semibold cursor-pointer hover:text-white" onClick={() => toggleSort('name')}>
                          <div className="flex items-center gap-1.5">
                            <span>User Name</span>
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </div>
                        </th>
                        <th className="py-3.5 px-4 font-semibold cursor-pointer hover:text-white" onClick={() => toggleSort('registerNumber')}>
                          <div className="flex items-center gap-1.5">
                            <span>Register Number</span>
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </div>
                        </th>
                        <th className="py-3.5 px-4 font-semibold">Email & Phone</th>
                        <th className="py-3.5 px-4 font-semibold">Department & Role</th>
                        <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/60">
                      {filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl ${user.avatarColor} text-white font-bold flex items-center justify-center text-xs shadow-md shrink-0`}>
                                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <div>
                                <div className="font-semibold text-white">{user.name}</div>
                                <div className="text-xs text-slate-400">Registered {new Date(user.registeredAt).toLocaleDateString()}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs font-semibold text-indigo-300">
                            {user.registerNumber}
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-slate-300 text-xs flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{user.email}</span>
                            </div>
                            <div className="text-slate-400 text-xs font-mono mt-1 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{user.phone}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-slate-200 text-xs font-medium">{user.department}</div>
                            <div className="mt-1">
                              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-700/80 text-slate-300">
                                {user.role}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => setIdCardUser(user)}
                                title="View Digital ID Card"
                                className="p-2 rounded-xl bg-slate-700/50 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all shadow-sm"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditUser(user)}
                                title="Edit User"
                                className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-sm"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                title="Delete User"
                                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-all shadow-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ================= DIGITAL ID CARD MODAL ================= */}
      {idCardUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Digital Identity Card</h3>
              </div>
              <button 
                onClick={() => setIdCardUser(null)}
                className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ID Card Badge Design */}
            <div className="bg-gradient-to-b from-slate-900 to-indigo-950/80 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Institution Header */}
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-4 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                    RP
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wider uppercase text-indigo-300">University / Institution</div>
                    <div className="text-[10px] text-slate-400">Official Membership ID</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold uppercase">
                  {idCardUser.role}
                </span>
              </div>

              {/* User Identity Details */}
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-16 h-16 rounded-2xl ${idCardUser.avatarColor} text-white font-extrabold flex items-center justify-center text-xl shadow-lg shrink-0 border-2 border-white/20`}>
                  {idCardUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white leading-tight">{idCardUser.name}</h4>
                  <div className="text-xs font-mono text-indigo-300 mt-1">{idCardUser.registerNumber}</div>
                  <div className="text-xs text-slate-300 mt-0.5">{idCardUser.department}</div>
                </div>
              </div>

              {/* Contact Data inside Badge */}
              <div className="space-y-2 py-3 border-t border-b border-slate-800 text-xs text-slate-300 font-mono">
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{idCardUser.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{idCardUser.phone}</span>
                </div>
              </div>

              {/* Barcode / QR Simulation Footer */}
              <div className="mt-5 flex items-center justify-between pt-2">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">ID Barcode Hash</div>
                  <div className="font-mono text-[10px] text-indigo-400 tracking-tighter">||| | |||| || | || |||| | ||</div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <QrCode className="w-6 h-6 text-indigo-300" />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-medium text-white transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print ID Card</span>
              </button>
              <button 
                onClick={() => setIdCardUser(null)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} RegistryPro System. All rights reserved.</p>
      </footer>
    </div>
  );
}
