import { useEffect, useState } from "react";
import { Card, Chip, Button } from "@heroui/react";
import { User as UserIcon, Shield, ShieldOff, AlertCircle } from "lucide-react";

import api from "@/config/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/auth/admin/users");
      setUsers(response.data.data || []);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (id: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      await api.patch(`/auth/admin/users/${id}/role`, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update role");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-default-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-8 px-4">
      <div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          User Management
        </h1>
        <p className="text-muted font-medium text-lg mt-1">
          Manage user roles and permissions.
        </p>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-2xl flex items-center gap-3 font-bold">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <Card className="p-12 rounded-xl border border-default-200 text-center">
          <p className="text-xl font-black text-foreground">No users found</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user: any) => (
            <Card
              key={user.id}
              className="p-5 rounded-xl border border-default-200 bg-background/60"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black shrink-0">
                    {user.name?.[0] || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-foreground truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-default-500 font-medium truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Chip
                    className="font-black"
                    color={user.role === "ADMIN" ? "warning" : "default"}
                    size="sm"
                    variant="soft"
                  >
                    {user.role}
                  </Chip>
                  <Button
                    className="h-10 px-4 rounded-xl font-black text-xs"
                    variant={user.role === "ADMIN" ? "danger-soft" : "primary"}
                    onPress={() => handleToggleRole(user.id, user.role)}
                  >
                    {user.role === "ADMIN" ? (
                      <ShieldOff size={14} />
                    ) : (
                      <Shield size={14} />
                    )}
                    {user.role === "ADMIN" ? "Demote" : "Promote"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}