"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
  createdAt?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const q = query(collection(db, "users"));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId: string, currentRole: string | undefined) => {
    const newRole = currentRole?.trim() === "admin" ? "user" : "admin";

    setUpdating(userId);
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error("Failed to update user role:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setUpdating(userId);
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      user.id.toLowerCase().includes(q) ||
      user.email?.toLowerCase().includes(q) ||
      user.displayName?.toLowerCase().includes(q) ||
      user.role?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Quản lý Users</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground">
            {filteredUsers.length} / {users.length} users
          </span>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
        <p className="text-sm text-muted-foreground">
          <strong className="text-blue-500">Lưu ý:</strong> Danh sách này chỉ hiển thị users đã có document trong Firestore collection &quot;users&quot;.
          Để xem tất cả users đã đăng ký, vào Firebase Console → Authentication.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-4 text-sm font-semibold">User</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">UID</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Role</th>
              <th className="text-right px-6 py-4 text-sm font-semibold">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="size-8 rounded-full bg-muted flex items-center justify-center text-sm">
                        {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">{user.displayName || "No name"}</p>
                      <p className="text-xs text-muted-foreground">{user.email || "No email"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <code className="text-xs bg-muted px-2 py-1 rounded">{user.id}</code>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${user.role?.trim() === "admin"
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {user.role?.trim() || "user"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant={user.role?.trim() === "admin" ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleToggleAdmin(user.id, user.role)}
                      disabled={updating === user.id}
                      className="cursor-pointer"
                    >
                      {updating === user.id ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : user.role?.trim() === "admin" ? (
                        "Thu hồi Admin"
                      ) : (
                        "Cấp Admin"
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={updating === user.id}
                      className="cursor-pointer"
                    >
                      Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery ? "Không tìm thấy user nào" : "Chưa có user nào trong database"}
          </div>
        )}
      </div>
    </div>
  );
}
