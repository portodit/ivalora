import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoFull from "@/assets/logo-full.svg";

const schema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const state = location.state as { blocked?: boolean; status?: string } | null;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setServerError("Email belum diverifikasi. Periksa inbox Anda.");
      } else if (error.message.includes("Invalid login credentials")) {
        setServerError("Email atau password salah.");
      } else {
        setServerError(error.message);
      }
      return;
    }

    if (!authData.user) return;

    // Fetch profile status
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("status")
      .eq("id", authData.user.id)
      .single();

    const status = profile?.status;
    if (status === "pending") {
      navigate("/waiting-approval", { replace: true });
    } else if (status === "suspended") {
      await supabase.auth.signOut();
      setServerError("Akun Anda telah disuspend. Hubungi administrator.");
    } else if (status === "rejected") {
      await supabase.auth.signOut();
      setServerError("Akun Anda ditolak. Hubungi administrator.");
    } else {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — Branding panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-foreground text-background">
        <div>
          <div className="w-8 h-8 bg-background rounded-sm" />
        </div>
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-background/40 font-medium">Dashboard Admin</p>
          <h1 className="text-4xl font-bold leading-tight">
            Kelola bisnis<br />gadget Anda<br />dengan presisi.
          </h1>
          <p className="text-background/50 text-sm max-w-xs leading-relaxed">
            Platform manajemen internal Ivalora Gadget — POS, inventaris IMEI, laporan, dan kontrol penuh di satu tempat.
          </p>
        </div>
        <p className="text-xs text-background/20">© 2025 Ivalora Gadget</p>
      </div>

      {/* Right — Form panel */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          {/* Logo */}
          <div className="flex justify-center lg:justify-start">
            <img src={logoFull} alt="Ivalora Gadget" className="h-7 invert" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Masuk ke akun</h2>
            <p className="text-sm text-muted-foreground">Gunakan email dan password yang terdaftar</p>
          </div>

          {/* Blocked notice */}
          {state?.blocked && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {state.status === "suspended"
                ? "Akun Anda telah disuspend."
                : "Akun Anda ditolak oleh administrator."}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ivalora.com"
                autoComplete="email"
                {...register("email")}
                className="h-11"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Password
                </Label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {serverError}
              </div>
            )}

            <Button type="submit" className="w-full h-11 gap-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>Masuk <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Belum punya akun?{" "}
            <Link to="/register" className="font-medium text-foreground hover:underline underline-offset-4">
              Daftar sebagai Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
