// ============================================================
// FILE: pages/auth/register.tsx
// Halaman registrasi — form name + email + password
// Setelah sukses register, redirect ke halaman login
// ============================================================

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { TextField, Label, InputGroup, FieldError, Button, Card } from "@heroui/react";
import { User, Mail, Lock, UserPlus, ArrowRight } from "lucide-react";

import api from "@/config/api";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/login");
    } catch {
      setError("Registration failed. Please check your information and try again.");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col justify-center items-center h-[calc(100vh-8rem)]">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4 mb-2">
          <div className="p-4 bg-secondary rounded-xl shadow-2xl shadow-secondary/40 -rotate-3 text-white"><UserPlus size={40} /></div>
          <div className="text-center">
            <h1 className="text-4xl font-black tracking-tighter text-foreground">JOIN US</h1>
            <p className="text-muted font-bold uppercase tracking-[0.2em] text-[10px]">Membership Registration</p>
          </div>
        </div>

        <Card className="w-full p-8 shadow-lg dark:shadow-none border border-default-200 bg-surface/60 backdrop-blur-xl rounded-xl">
          <Card.Header className="flex justify-center pb-6 pt-2 px-0 flex-col items-center gap-2">
            <Card.Title className="text-2xl font-black">Create Account</Card.Title>
            <Card.Description className="text-muted font-medium text-sm text-center">Enter your details to start using RoomSync</Card.Description>
          </Card.Header>

          <Card.Content className="py-4 px-0">
            <form className="flex flex-col gap-6" onSubmit={handleRegister}>
              {error && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-4 rounded-2xl flex items-center gap-3 font-bold animate-shake" role="alert">
                  <Lock size={16} /> {error}
                </div>
              )}

              <div className="space-y-4">
                <TextField isRequired name="name" type="text">
                  <Label className="text-xs font-black text-default-700 ml-1 uppercase tracking-wider">Full Name</Label>
                  <InputGroup className="rounded-2xl border-default-200">
                    <InputGroup.Prefix className="pl-3"><User className="text-default-400" size={18} /></InputGroup.Prefix>
                    <InputGroup.Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                  </InputGroup>
                  <FieldError />
                </TextField>

                <TextField isRequired name="email" type="email">
                  <Label className="text-xs font-black text-default-700 ml-1 uppercase tracking-wider">Email</Label>
                  <InputGroup className="rounded-2xl border-default-200">
                    <InputGroup.Prefix className="pl-3"><Mail className="text-default-400" size={18} /></InputGroup.Prefix>
                    <InputGroup.Input placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </InputGroup>
                  <FieldError />
                </TextField>

                <TextField isRequired name="password" type="password">
                  <Label className="text-xs font-black text-default-700 ml-1 uppercase tracking-wider">Password</Label>
                  <InputGroup className="rounded-2xl border-default-200">
                    <InputGroup.Prefix className="pl-3"><Lock className="text-default-400" size={18} /></InputGroup.Prefix>
                    <InputGroup.Input placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </InputGroup>
                  <FieldError />
                </TextField>
              </div>

              <Button className="mt-4 h-14 text-base font-black rounded-2xl shadow-xl shadow-secondary/30 transition-all active:scale-95" isPending={loading} type="submit" variant="secondary">
                Create Account <ArrowRight className="ml-2" size={20} />
              </Button>
            </form>

            <div className="text-center mt-10 text-sm font-medium text-muted">
              Already have an account?{" "}
              <Link className="text-secondary font-black hover:underline underline-offset-4" to="/login">Sign In</Link>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
