/**
 * @fileoverview Admin page for managing users and viewing audit logs.
 * Provides functionality for plant administrators to add, edit, and delete users,
 * as well as monitor system-wide activity.
 */

"use client";

import { useState, useEffect } from "react";
import { UserRole, roleColors } from "@/lib/constants";
import { api } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
  lastActive: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "TECHNICIAN" as UserRole });

  useEffect(() => {
    async function loadData() {
      try {
        const [usersData, logsData] = await Promise.all([
          api.getUsers(),
          api.getAuditLogs(),
        ]);
        setUsers(usersData);
        setAuditLogs(logsData);
      } catch (err) {
        console.error("Failed to load admin data", err);
      }
    }
    loadData();
  }, []);

  /**
   * Adds a new user to the system.
   */
  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    
    const user: User = {
      id: `USR-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: "ACTIVE",
      lastActive: new Date().toISOString(),
    };
    setUsers([...users, user]);
    setNewUser({ name: "", email: "", role: "TECHNICIAN" });
    setShowAddModal(false);
  };

  /**
   * Deletes a user from the system by ID.
   * 
   * @param {string} id The ID of the user to delete.
   */
  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id));
  };

  /**
   * Updates an existing user's details.
   */
  const handleEditUser = () => {
    if (!editingUser) return;
    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#f1f5f9]">User Management</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#3b82f6] text-white text-sm rounded-lg hover:bg-[#2563eb] transition-colors"
          >
            Add User
          </button>
        </div>

        <div className="border border-[#334155] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155] bg-[#1e293b]">
                <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Name</th>
                <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Email</th>
                <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Role</th>
                <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Status</th>
                <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Last Active</th>
                <th className="px-4 py-3 text-right text-[#94a3b8] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#334155] hover:bg-[#1e293b] transition-colors">
                  <td className="px-4 py-3 text-[#f1f5f9]">{user.name}</td>
                  <td className="px-4 py-3 text-[#94a3b8]">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs text-white"
                      style={{ backgroundColor: roleColors[user.role] }}
                    >
                      {user.role.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs ${
                        user.status === "ACTIVE" ? "bg-[#22c55e]/20 text-[#22c55e]" : "bg-[#94a3b8]/20 text-[#94a3b8]"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#94a3b8]">
                    {new Date(user.lastActive).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-[#3b82f6] hover:underline mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-[#ef4444] hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-[#f1f5f9]">Recent Audit Trail</h2>
        <div className="border border-[#334155] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#334155] bg-[#1e293b]">
                <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Timestamp</th>
                <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">User</th>
                <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Action</th>
                <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Resource</th>
                <th className="px-4 py-3 text-left text-[#94a3b8] font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[#64748b]">No audit logs recorded yet.</td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[#334155] hover:bg-[#1e293b] transition-colors">
                    <td className="px-4 py-3 text-[#94a3b8]">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#f1f5f9]">{log.userName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#334155] text-[#f1f5f9]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#94a3b8]">{log.resource}</td>
                    <td className="px-4 py-3 text-xs text-[#64748b]">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-md mx-4 bg-[#1e293b] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#334155]">
              <h3 className="text-lg font-medium text-[#f1f5f9]">Add New User</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-[#94a3b8] mb-1">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Full name"
                  className="w-full px-3 py-2 rounded-lg border border-[#334155] text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6]"
                  style={{ backgroundColor: "#0f172a" }}
                />
              </div>
              <div>
                <label className="block text-sm text-[#94a3b8] mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@company.com"
                  className="w-full px-3 py-2 rounded-lg border border-[#334155] text-[#f1f5f9] placeholder-[#64748b] focus:outline-none focus:border-[#3b82f6]"
                  style={{ backgroundColor: "#0f172a" }}
                />
              </div>
              <div>
                <label className="block text-sm text-[#94a3b8] mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-lg border border-[#334155] text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6]"
                  style={{ backgroundColor: "#0f172a" }}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-[#334155] flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-[#3b82f6] text-white text-sm rounded-lg hover:bg-[#2563eb] transition-colors"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="w-full max-w-md mx-4 bg-[#1e293b] rounded-lg overflow-hidden">
            <div className="p-4 border-b border-[#334155]">
              <h3 className="text-lg font-medium text-[#f1f5f9]">Edit User</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-[#94a3b8] mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#334155] text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6]"
                  style={{ backgroundColor: "#0f172a" }}
                />
              </div>
              <div>
                <label className="block text-sm text-[#94a3b8] mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#334155] text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6]"
                  style={{ backgroundColor: "#0f172a" }}
                />
              </div>
              <div>
                <label className="block text-sm text-[#94a3b8] mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 rounded-lg border border-[#334155] text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6]"
                  style={{ backgroundColor: "#0f172a" }}
                >
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#94a3b8] mb-1">Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as "ACTIVE" | "INACTIVE" })}
                  className="w-full px-3 py-2 rounded-lg border border-[#334155] text-[#f1f5f9] focus:outline-none focus:border-[#3b82f6]"
                  style={{ backgroundColor: "#0f172a" }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            <div className="p-4 border-t border-[#334155] flex justify-end gap-2">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-[#3b82f6] text-white text-sm rounded-lg hover:bg-[#2563eb] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
