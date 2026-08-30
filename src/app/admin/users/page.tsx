"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  User as UserIcon,
  Search,
  Mail,
  ShieldCheck,
  Eye,
  Calendar,
  Edit,
  Trash2,
  ShieldAlert,
} from "lucide-react";
import { api } from "@/src/components/auth/axiosInstance";
import { PageHeader } from "@/src/components/admin/PageHeader";
import { DataTable, Column } from "@/src/components/admin/DataTable";
import { SearchBar } from "@/src/components/admin/SearchBar";
import { FormDialog } from "@/src/components/admin/FormDialog";
import { LoadingSkeleton } from "@/src/components/admin/LoadingSkeleton";
import { ErrorState } from "@/src/components/admin/ErrorState";
import { Button } from "@/src/components/ui/button";
import { normalizeImageUrl } from "@/src/lib/utils";
import { toast } from "sonner";
import { useAuthStore } from "@/src/components/store/authStore";

interface UserData {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  isAdmin: boolean;
  isEmailConfirmed: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = String(currentUser?._id || currentUser?.id || "");

  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form State
  const [editForm, setEditForm] = useState({ name: "", email: "", isAdmin: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get("/users/all-users");
      const data = res.data?.data || [];
      setUsers(data);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      setError(
        err.response?.data?.message ||
          "Could not retrieve registered user profiles from server."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenEdit = async (user: UserData) => {
    setSelectedUser(user);
    setEditForm({ name: user.name, email: user.email, isAdmin: user.isAdmin });
    setIsEditModalOpen(true);
    
    // Fetch details to ensure we have the latest
    try {
      const res = await api.get(`/users/${user._id}`);
      const fullUser = res.data?.data || res.data;
      if (fullUser) {
        setEditForm({ name: fullUser.name, email: fullUser.email, isAdmin: fullUser.isAdmin });
      }
    } catch (err) {
      console.error("Failed to fetch full user details", err);
    }
  };

  const handleOpenDelete = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      await api.put(`/users/${selectedUser._id}`, editForm);
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
      fetchUsers(); // refresh list
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/users/${selectedUser._id}`);
      toast.success("User deleted successfully");
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const name = (u.name || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const matchesSearch =
      name.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase()) ||
      String(u._id).includes(searchQuery);

    const matchesRole =
      roleFilter === "All" ||
      (roleFilter === "Admin" && u.isAdmin) ||
      (roleFilter === "Customer" && !u.isAdmin);

    return matchesSearch && matchesRole;
  });

  const columns: Column<UserData>[] = [
    {
      header: "User / Customer",
      accessorKey: "name",
      cell: (u) => {
        return (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center border border-stone-200 bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-extrabold text-sm shadow-sm">
              {u.avatar ? (
                <img
                  src={normalizeImageUrl(u.avatar)}
                  alt={u.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <span>{getInitials(u.name)}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-stone-900 text-sm">{u.name}</span>
              <span className="text-xs text-stone-400 font-medium font-mono">
                {u.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      header: "Status",
      cell: (u) => (
        <span className={`inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${u.isEmailConfirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
          {u.isEmailConfirmed ? "Verified" : "Pending"}
        </span>
      ),
    },
    {
      header: "Role",
      cell: (u) => {
        return u.isAdmin ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Admin
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
            <UserIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Customer
          </span>
        );
      },
    },
    {
      header: "Joined",
      cell: (u) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500">
          <Calendar className="w-3.5 h-3.5 shrink-0 text-stone-400" />
          {new Date(u.createdAt).toLocaleDateString()}
        </div>
      ),
    },
    {
      header: "Actions",
      cell: (u) => {
        const isSelf = currentUserId === String(u._id);
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleOpenEdit(u)}
              title="Edit User"
              className="rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => handleOpenDelete(u)}
              disabled={isSelf}
              title={isSelf ? "Cannot delete your own account" : "Delete User"}
              className={`rounded-lg ${isSelf ? 'opacity-50 cursor-not-allowed' : 'text-red-600 hover:text-red-700 hover:bg-red-50'}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        );
      },
      className: "text-right w-24",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in" dir="ltr">
      {/* Header */}
      <PageHeader
        title="Users & Customers"
        subtitle="Manage registered accounts, modify roles, and enforce security policies."
      />

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-auto flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by name, email, or ID..."
            className="max-w-md"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="All">All Roles</option>
            <option value="Customer">Customers Only</option>
            <option value="Admin">Admins Only</option>
          </select>

          <span className="text-xs font-semibold text-stone-500">
            Total: <strong className="text-stone-900">{filteredUsers.length}</strong>
          </span>
        </div>
      </div>

      {/* Content Table */}
      {isLoading ? (
        <LoadingSkeleton type="table" count={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsers} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredUsers}
          keyExtractor={(item) => String(item._id)}
          emptyMessage={
            searchQuery || roleFilter !== "All"
              ? "No users match the selected search or filter criteria."
              : "No user accounts registered yet."
          }
        />
      )}

      {/* Edit User Dialog */}
      <FormDialog
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User Details"
        description="Modify the user's basic information and role privileges."
        maxWidth="md"
      >
        {selectedUser && (
          <form onSubmit={submitEdit} className="space-y-5 pt-4">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full h-11 px-4 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full h-11 px-4 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Admin Toggle */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-stone-900">Administrator Privileges</p>
                    <p className="text-xs text-stone-500 mt-0.5">Allow this user to access the admin dashboard.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={editForm.isAdmin}
                      onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                      disabled={currentUserId === String(selectedUser._id)}
                    />
                    <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                {currentUserId === String(selectedUser._id) && (
                  <p className="text-[10px] font-bold text-amber-600 mt-2 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3" /> You cannot demote your own account.
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-stone-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isSubmitting}
                className="rounded-xl font-bold"
              >
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </FormDialog>

      {/* Delete User Confirmation Dialog */}
      <FormDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete User Account"
        description="Are you absolutely sure you want to delete this user? This action cannot be undone."
        maxWidth="sm"
      >
        {selectedUser && (
          <div className="space-y-6 pt-4">
            <div className="p-4 bg-red-50 text-red-800 rounded-xl border border-red-200 text-sm">
              <p>You are about to permanently delete the account for <strong>{selectedUser.name}</strong> ({selectedUser.email}).</p>
              <p className="font-bold mt-2">All associated data may be permanently removed.</p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmDelete}
                loading={isSubmitting}
                className="rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 border-none"
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
}
