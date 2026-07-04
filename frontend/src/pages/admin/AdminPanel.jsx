import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
        <p className="text-slate-500">Manage users, system settings, and global analytics.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50">
          {['users', 'companies', 'system-logs', 'settings'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 font-medium text-sm capitalize ${
                activeTab === tab 
                  ? 'border-b-2 border-primary-500 text-primary-700 bg-white' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">User Management</h2>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Add User</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200">
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { id: 1, name: 'Alice Smith', email: 'alice@example.com', role: 'Admin', status: 'Active' },
                      { id: 2, name: 'Bob Jones', email: 'bob@example.com', role: 'Recruiter', status: 'Active' },
                      { id: 3, name: 'Charlie Day', email: 'charlie@example.com', role: 'Candidate', status: 'Inactive' },
                    ].map(user => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <p className="font-medium text-slate-800">{user.name}</p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                            user.role === 'Recruiter' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button className="text-primary-600 hover:text-primary-800 font-medium text-sm mr-3">Edit</button>
                          <button className="text-red-600 hover:text-red-800 font-medium text-sm">Disable</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab !== 'users' && (
            <div className="text-center py-12 text-slate-500">
              <p className="mb-2">Content for {activeTab.replace('-', ' ')} is under construction.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPanel;
