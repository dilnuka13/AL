import React, { useState, useEffect } from 'react';
import moment from 'moment';
import Icons from '../common/Icons';
import supabase from '../../lib/supabase';
import { SUPER_ADMIN_EMAILS, SUPER_ADMIN_IMG } from '../../config/constants';
import { useToast } from '../common/Toast';

export const UsersManager = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('last_login', { ascending: false, nullsFirst: true });
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleApproval = async (user) => {
    const actionText = user.approved ? 'suspend access for' : 'approve access for';
    if (!window.confirm(`Are you sure you want to ${actionText} ${user.name}?`)) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ approved: !user.approved })
        .eq('id', user.id);
      if (error) throw error;
      showToast(`User ${user.approved ? 'suspended' : 'approved'}`, 'success');
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleToggleEmailConfirmed = async (user) => {
    const isCurrentlyConfirmed = !!user.email_confirmed_at;
    const newTimestamp = isCurrentlyConfirmed ? null : new Date().toISOString();

    try {
      const { error } = await supabase
        .from('users')
        .update({ email_confirmed_at: newTimestamp })
        .eq('id', user.id);
      if (error) throw error;
      showToast(
        `Email ${isCurrentlyConfirmed ? 'marked unconfirmed' : 'confirmed'}`,
        'success'
      );
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Permanently delete this user account?')) return;
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      showToast('User deleted', 'success');
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditName(user.name || '');
    setEditPhone(user.phone || '');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({ name: editName.trim(), phone: editPhone.trim() })
        .eq('id', editingUser.id);
      if (error) throw error;
      showToast('User profile updated', 'success');
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6 animate__animated animate__fadeIn pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-white flex items-center gap-3">
            <Icons.Users className="text-emerald-400" /> Team Access & Approvals
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Super Administrator controls: approve accounts, toggle permissions, manage biometric status.
          </p>
        </div>
        <button
          onClick={() => {
            loadUsers();
            showToast('User list refreshed', 'success');
          }}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-white transition border border-white/10"
        >
          <Icons.Sync size={16} />
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 bg-black/40 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap text-sm text-gray-200">
            <thead className="bg-white/5 border-b border-white/10 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <tr>
                <th className="p-5">User Profile</th>
                <th className="p-5">Contact</th>
                <th className="p-5">Approval Status</th>
                <th className="p-5">Last Activity</th>
                <th className="p-5">Email Verified</th>
                <th className="p-5 text-center">Role</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => {
                const isOnline =
                  u.last_login && moment().diff(moment(u.last_login), 'minutes') < 5;
                const isSuper = SUPER_ADMIN_EMAILS.includes(u.email.toLowerCase());
                const isEmailConfirmed = !!u.email_confirmed_at;

                return (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={
                              isSuper
                                ? SUPER_ADMIN_IMG
                                : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    u.name
                                  )}&background=10b981&color=fff`
                            }
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                u.name
                              )}&background=10b981&color=fff`;
                            }}
                          />
                          {isOnline && (
                            <div
                              className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-black rounded-full"
                              title="Online now"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-5 font-mono text-xs text-gray-400">{u.phone || '—'}</td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          u.approved
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-red-500/15 text-red-400 border-red-500/30'
                        }`}
                      >
                        {u.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>

                    <td className="p-5 text-xs text-gray-400">
                      {isOnline ? (
                        <span className="text-emerald-400 font-bold">Online now</span>
                      ) : u.last_login ? (
                        moment(u.last_login).fromNow()
                      ) : (
                        'Never'
                      )}
                    </td>

                    <td className="p-5">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                          isEmailConfirmed
                            ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                            : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                        }`}
                      >
                        {isEmailConfirmed ? 'Verified' : 'Unverified'}
                      </span>
                    </td>

                    <td className="p-5 text-center">
                      {isSuper ? (
                        <span className="text-xs font-bold text-purple-400 flex items-center justify-center gap-1">
                          <i className="fas fa-crown text-yellow-400"></i> Super Admin
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Editor</span>
                      )}
                    </td>

                    <td className="p-5 text-right">
                      {!isSuper && (
                        <div className="flex justify-end gap-2">
                          {/* Toggle Email Confirmed */}
                          <button
                            onClick={() => handleToggleEmailConfirmed(u)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition border border-white/5 ${
                              isEmailConfirmed
                                ? 'bg-orange-500/15 text-orange-400 hover:bg-orange-500/30'
                                : 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/30'
                            }`}
                            title={isEmailConfirmed ? 'Mark Unverified' : 'Mark Verified'}
                          >
                            <i
                              className={`fas ${
                                isEmailConfirmed ? 'fa-envelope-open-text' : 'fa-check-double'
                              }`}
                            />
                          </button>

                          {/* Edit Profile */}
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="w-8 h-8 rounded-lg bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition"
                            title="Edit User"
                          >
                            <Icons.Pen size={14} />
                          </button>

                          {/* Toggle Active/Approved */}
                          <button
                            onClick={() => handleToggleApproval(u)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${
                              u.approved
                                ? 'bg-red-500/15 text-red-400 hover:bg-red-500/30'
                                : 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30'
                            }`}
                            title={u.approved ? 'Suspend Access' : 'Grant Access'}
                          >
                            <i className={`fas ${u.approved ? 'fa-ban' : 'fa-check'}`} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="w-8 h-8 rounded-lg bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition"
                            title="Delete User"
                          >
                            <Icons.Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate__animated animate__fadeIn">
          <div className="glass-panel w-full max-w-sm p-6 rounded-3xl bg-[#0c101a] border border-white/10 animate__animated animate__zoomIn">
            <h3 className="font-bold text-xl text-white mb-4">Edit Profile</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;
