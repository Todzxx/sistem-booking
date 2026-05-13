import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  TextField,
  Label,
  InputGroup,
  FieldError,
  Button,
  Card,
} from "@heroui/react";
import { Lock, Mail, ShieldCheck, ArrowRight } from "lucide-react";

import api from "@/config/api";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.status === "success" || response.data.data) {
        login(
          response.data.data.token,
          response.data.data.refreshToken,
          response.data.data.user,
        );
        navigate(response.data.data.user?.role === "ADMIN" ? "/admin" : "/");
      }
    } catch {
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-14rem)] flex-col items-center justify-start py-4 sm:justify-center sm:py-8">
      <div className="w-full max-w-md space-y-5 sm:space-y-7">
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-2xl shadow-accent/30 sm:h-18 sm:w-18">
            <ShieldCheck size={36} />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black tracking-tighter text-foreground sm:text-4xl">
              ROOMSYNC
            </h1>
            <p className="text-muted font-bold uppercase tracking-[0.2em] text-[10px]">
              Secure Access Portal
            </p>
          </div>
        </div>

        <Card className="w-full rounded-xl border border-default-200 bg-surface/60 p-6 shadow-lg backdrop-blur-xl dark:shadow-none sm:p-8">
          <Card.Header className="flex justify-center pb-5 pt-1 px-0 flex-col items-center gap-2">
            <Card.Title className="text-2xl font-black">
              Welcome Back
            </Card.Title>
            <Card.Description className="text-muted font-medium text-sm text-center">
              Please enter your credentials to access the system
            </Card.Description>
          </Card.Header>

          <Card.Content className="py-4 px-0">
            <form
              className="flex flex-col gap-5 sm:gap-6"
              onSubmit={handleLogin}
            >
              {error && (
                <div
                  className="bg-danger/10 border border-danger/20 text-danger text-xs p-4 rounded-2xl flex items-center gap-3 font-bold animate-shake"
                  role="alert"
                >
                  <ShieldCheck size={16} />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <TextField isRequired name="email" type="email">
                  <Label className="text-xs font-black text-default-700 ml-1 uppercase tracking-wider">
                    Email
                  </Label>
                  <InputGroup className="rounded-2xl border-default-200">
                    <InputGroup.Prefix className="pl-3">
                      <Mail className="text-default-400" size={18} />
                    </InputGroup.Prefix>
                    <InputGroup.Input
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </InputGroup>
                  <FieldError />
                </TextField>

                <TextField isRequired name="password" type="password">
                  <Label className="text-xs font-black text-default-700 ml-1 uppercase tracking-wider">
                    Password
                  </Label>
                  <InputGroup className="rounded-2xl border-default-200">
                    <InputGroup.Prefix className="pl-3">
                      <Lock className="text-default-400" size={18} />
                    </InputGroup.Prefix>
                    <InputGroup.Input
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </InputGroup>
                  <FieldError />
                </TextField>
              </div>

              <Button
                className="mt-2 h-14 text-base font-black rounded-2xl shadow-xl shadow-primary/30 transition-all active:scale-95 sm:mt-4"
                isPending={loading}
                type="submit"
                variant="primary"
              >
                Sign Into System
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </form>

            <div className="text-center mt-7 text-sm font-medium text-muted sm:mt-10">
              New to RoomSync?{" "}
              <Link
                className="text-primary font-black hover:underline underline-offset-4"
                to="/register"
              >
                Register Account
              </Link>
            </div>
          </Card.Content>
        </Card>

        <p className="text-center text-[10px] text-muted font-bold uppercase tracking-widest">
          Property of RoomSync Operations
        </p>
      </div>
    </div>
  );
}
