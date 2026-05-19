import type { User as UserType } from "@/types";

import { useEffect, useState } from "react";
import {
  Card,
  Button,
  TextField,
  Label,
  InputGroup,
  FieldError,
} from "@heroui/react";
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import api from "@/config/api";

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/me");

        setUser(response.data.data);
        setName(response.data.data.name);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Error fetching profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password) {
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");

        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");

        return;
      }
    }

    setUpdating(true);
    try {
      const payload: { name?: string; password?: string } = {};

      if (name) payload.name = name;
      if (password) payload.password = password;

      const response = await api.patch("/auth/me", payload);

      setUser(response.data.data);
      setSuccess("Profile updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div
        aria-busy="true"
        aria-label="Loading profile"
        className="max-w-2xl mx-auto py-12 px-4"
      >
        <div className="flex flex-col gap-2 mb-10 items-center">
          <div className="h-10 w-64 rounded-lg bg-default-100 animate-pulse" />
          <div className="h-4 w-48 rounded-lg bg-default-100 animate-pulse" />
        </div>
        <div className="p-10 border border-default-200 rounded-xl bg-surface/60">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-[2rem] bg-default-100 animate-pulse" />
            <div className="h-6 w-32 rounded-lg bg-default-100 animate-pulse" />
            <div className="h-4 w-20 rounded-lg bg-default-100 animate-pulse" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 rounded-lg bg-default-100 animate-pulse"
              />
            ))}
          </div>
          <div className="h-14 rounded-xl bg-default-100 animate-pulse mt-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="flex flex-col gap-2 mb-10 text-center">
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Account Settings
        </h1>
        <p className="text-default-500 font-medium">
          Manage your personal information and security.
        </p>
      </div>

      <Card className="p-10 border border-default-200 rounded-xl bg-surface/60 backdrop-blur-xl">
        <form className="flex flex-col gap-8" onSubmit={handleUpdate}>
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="w-24 h-24 rounded-[2rem] bg-primary/10 text-primary flex items-center justify-center shadow-inner">
              <User size={48} />
            </div>
            <div className="flex flex-col items-center">
              <p className="text-xl font-black text-foreground">{user?.name}</p>
              <div className="flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl mt-1">
                <ShieldCheck size={12} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div
              className="bg-danger/10 text-danger p-4 rounded-lg border border-danger/20 flex items-center gap-3 font-bold"
              role="alert"
            >
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {success && (
            <div
              className="bg-success/10 text-success p-4 rounded-lg border border-success/20 flex items-center gap-3 font-bold"
              role="status"
            >
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <div className="space-y-6">
            <TextField isDisabled name="email" type="email">
              <Label className="text-sm font-black text-default-700 ml-1">
                Email Address
              </Label>
              <InputGroup className="rounded-lg bg-default-100/50">
                <InputGroup.Prefix className="pl-3">
                  <Mail className="text-default-400" size={18} />
                </InputGroup.Prefix>
                <InputGroup.Input value={user?.email} />
              </InputGroup>
            </TextField>

            <TextField isRequired name="name" type="text">
              <Label className="text-sm font-black text-default-700 ml-1">
                Full Name
              </Label>
              <InputGroup className="rounded-lg">
                <InputGroup.Prefix className="pl-3">
                  <User className="text-default-400" size={18} />
                </InputGroup.Prefix>
                <InputGroup.Input
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </InputGroup>
              <FieldError />
            </TextField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextField name="password" type="password">
                <Label className="text-sm font-black text-default-700 ml-1">
                  New Password
                </Label>
                <InputGroup className="rounded-lg">
                  <InputGroup.Prefix className="pl-3">
                    <Lock className="text-default-400" size={18} />
                  </InputGroup.Prefix>
                  <InputGroup.Input
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </InputGroup>
              </TextField>

              <TextField name="confirmPassword" type="password">
                <Label className="text-sm font-black text-default-700 ml-1">
                  Confirm Password
                </Label>
                <InputGroup className="rounded-lg">
                  <InputGroup.Prefix className="pl-3">
                    <Lock className="text-default-400" size={18} />
                  </InputGroup.Prefix>
                  <InputGroup.Input
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </InputGroup>
              </TextField>
            </div>
          </div>

          <Button
            className="w-full h-14 rounded-xl font-black text-base mt-4 transition-all active:scale-[0.98]"
            isPending={updating}
            type="submit"
            variant="primary"
          >
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
