import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Shield, Trash2, Check, X, Loader2, Plus, Mail, Key } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { userService } from '../services/api';
import { User } from '../types';

export const AdminStaff = () => {
  const { t } = useTranslation();
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [userToDelete, setUserToDelete] = React.useState<string | null>(null);
  const [createLoading, setCreateLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    role: 'staff' as 'admin' | 'staff' | 'user',
    permissions: [] as string[]
  });

  const permissions = [
    'manage_fleet',
    'manage_bookings',
    'manage_cities',
    'manage_settings',
    'manage_staff'
  ];

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error(t('admin.staff.errorFetch'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await userService.createStaff(formData);
      toast.success(t('admin.staff.create.success'));
      setShowCreateModal(false);
      setFormData({ email: '', password: '', role: 'staff', permissions: [] });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || t('admin.staff.create.error'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleRoleChange = async (uid: string, role: 'admin' | 'staff' | 'user') => {
    setUpdating(uid);
    try {
      const user = users.find(u => u.uid === uid);
      if (!user) return;

      const updatedPermissions = role === 'admin' 
        ? permissions 
        : (role === 'staff' ? (user.permissions || []) : []);

      await userService.update(uid, { role, permissions: updatedPermissions });
      toast.success(t('admin.staff.successUpdate'));
      fetchUsers();
    } catch (error) {
      toast.error(t('admin.staff.errorUpdate'));
    } finally {
      setUpdating(null);
    }
  };

  const togglePermission = async (uid: string, permission: string) => {
    setUpdating(uid);
    try {
      const user = users.find(u => u.uid === uid);
      if (!user) return;

      const currentPermissions = user.permissions || [];
      const newPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission];

      await userService.update(uid, { permissions: newPermissions });
      toast.success(t('admin.staff.successUpdate'));
      fetchUsers();
    } catch (error) {
      toast.error(t('admin.staff.errorUpdate'));
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = (uid: string) => {
    setUserToDelete(uid);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    setUpdating(userToDelete);
    try {
      await userService.delete(userToDelete);
      toast.success(t('admin.staff.successDelete'));
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(t('admin.staff.errorDelete'));
    } finally {
      setUpdating(null);
      setUserToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="serif text-3xl font-light text-foreground">{t('admin.staff.title')}</h1>
          <p className="mt-2 text-sm text-foreground/50">{t('admin.staff.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus size={20} />
          {t('admin.staff.create.button')}
        </button>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-primary/10 bg-white shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-primary/5 bg-primary/5">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">{t('admin.staff.table.user')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">{t('admin.staff.table.role')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40">{t('admin.staff.table.permissions')}</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 text-right">{t('admin.staff.table.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {users.map((user) => (
                <tr key={user.uid} className="group transition-colors hover:bg-primary/5">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Users size={20} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground">{user.email}</span>
                        <span className="text-[10px] text-foreground/40 font-mono">{user.uid}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.uid, e.target.value as any)}
                      disabled={updating === user.uid}
                      className="rounded-lg border border-primary/10 bg-white px-3 py-1.5 text-xs font-bold focus:border-primary focus:outline-none disabled:opacity-50"
                    >
                      <option value="user">{t('admin.staff.roles.user')}</option>
                      <option value="staff">{t('admin.staff.roles.staff')}</option>
                      <option value="admin">{t('admin.staff.roles.admin')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-6">
                    {user.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                        <Shield size={12} />
                        Full Access
                      </span>
                    ) : user.role === 'staff' ? (
                      <div className="flex flex-wrap gap-2">
                        {permissions.map((perm) => (
                          <button
                            key={perm}
                            onClick={() => togglePermission(user.uid, perm)}
                            disabled={updating === user.uid}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                              user.permissions?.includes(perm)
                                ? 'bg-primary text-white'
                                : 'bg-black/5 text-foreground/40 hover:bg-black/10'
                            }`}
                          >
                            {user.permissions?.includes(perm) ? <Check size={10} /> : <X size={10} />}
                            {t(`admin.staff.permissions.${perm}`)}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] text-foreground/20 italic">No permissions</span>
                    )}
                  </td>
                  <td className="px-6 py-6 text-right">
                    <button
                      onClick={() => handleDelete(user.uid)}
                      disabled={updating === user.uid}
                      className="rounded-xl p-2 text-emerald-600/40 transition-all hover:bg-emerald-600/10 hover:text-emerald-600 disabled:opacity-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Staff Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl"
            >
              <div className="bg-primary p-8 text-center text-primary-foreground">
                <h2 className="serif text-2xl font-light">{t('admin.staff.create.title')}</h2>
              </div>
              <form onSubmit={handleCreateStaff} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.staff.create.email')}</label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-xl border border-primary/10 bg-primary/5 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.staff.create.password')}</label>
                    <div className="relative mt-1">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/40" size={18} />
                      <input
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full rounded-xl border border-primary/10 bg-primary/5 py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.staff.create.role')}</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                      className="mt-1 w-full rounded-xl border border-primary/10 bg-primary/5 py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="staff">{t('admin.staff.roles.staff')}</option>
                      <option value="admin">{t('admin.staff.roles.admin')}</option>
                    </select>
                  </div>
                  {formData.role === 'staff' && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">{t('admin.staff.create.permissions')}</label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {permissions.map((perm) => (
                          <button
                            key={perm}
                            type="button"
                            onClick={() => {
                              const newPerms = formData.permissions.includes(perm)
                                ? formData.permissions.filter(p => p !== perm)
                                : [...formData.permissions, perm];
                              setFormData({ ...formData, permissions: newPerms });
                            }}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold transition-all ${
                              formData.permissions.includes(perm)
                                ? 'bg-primary text-white'
                                : 'bg-black/5 text-foreground/40 hover:bg-black/10'
                            }`}
                          >
                            {formData.permissions.includes(perm) ? <Check size={10} /> : <X size={10} />}
                            {t(`admin.staff.permissions.${perm}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 rounded-xl border border-primary/10 py-3 text-sm font-bold text-foreground/60 transition-all hover:bg-primary/5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="flex-1 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 disabled:opacity-50"
                  >
                    {createLoading ? 'Creating...' : t('admin.staff.create.submit')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 mx-auto">
                <Trash2 size={32} />
              </div>
              <h2 className="serif text-center text-2xl font-light text-foreground mb-2">
                {t('admin.staff.deleteTitle')}
              </h2>
              <p className="text-center text-sm text-foreground/50 mb-8 leading-relaxed">
                {t('admin.staff.deleteConfirm')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-xl border border-primary/10 py-3 text-sm font-bold text-foreground/60 transition-all hover:bg-primary/5"
                >
                  {t('admin.staff.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={updating !== null}
                  className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-emerald-700 disabled:opacity-50"
                >
                  {updating !== null ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : t('admin.staff.delete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
