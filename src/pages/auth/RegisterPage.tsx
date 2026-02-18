import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  full_name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Harus mengandung huruf kapital")
    .regex(/[0-9]/, "Harus mengandung angka"),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  message: "Password tidak cocok",
  path: ["confirm_password"],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: data.full_name },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        setServerError("Email ini sudah terdaftar.");
      } else {
        setServerError(error.message);
      }
      return;
    }

    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-background" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Cek email Anda</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Kami mengirim link verifikasi ke email Anda. Klik link tersebut untuk melanjutkan, lalu tunggu persetujuan dari Super Admin.
            </p>
          </div>
          <Link to="/login" className="block text-sm font-medium hover:underline underline-offset-4">
            Kembali ke halaman login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-foreground text-background">
        <div>
          <div className="w-8 h-8 bg-background rounded-sm" />
        </div>
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-background/40 font-medium">Registrasi Admin</p>
          <h1 className="text-4xl font-bold leading-tight">
            Bergabung dan<br />kelola toko<br />bersama tim.
          </h1>
          <p className="text-background/50 text-sm max-w-xs leading-relaxed">
            Setelah mendaftar, akun Anda perlu diverifikasi email dan disetujui oleh Super Admin sebelum bisa mengakses dashboard.
          </p>
        </div>
        <div className="space-y-3">
          {["Verifikasi email", "Persetujuan Super Admin", "Akses penuh dashboard"].map((step, i) => (
            <div key={step} className="flex items-center gap-3 text-sm text-background/60">
              <div className="w-5 h-5 rounded-full border border-background/20 flex items-center justify-center text-xs text-background/40">
                {i + 1}
              </div>
              {step}
            </div>
          ))}
        </div>
        <p className="text-xs text-background/20">© 2025 Ivalora Gadget</p>
      </div>

      {/* Right — Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-sm space-y-8">
          <div className="flex justify-center lg:justify-start">
            <img src={logoFull} alt="Ivalora Gadget" className="h-7 invert" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Buat akun Admin</h2>
            <p className="text-sm text-muted-foreground">Isi data di bawah untuk mendaftar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Nama Lengkap
              </Label>
              <Input id="full_name" placeholder="Ahmad Fauzi" {...register("full_name")} className="h-11" />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Email
              </Label>
              <Input id="email" type="email" placeholder="admin@ivalora.com" {...register("email")} className="h-11" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 karakter, 1 huruf kapital, 1 angka"
                  {...register("password")}
                  className="h-11 pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm_password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Konfirmasi Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm_password"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ulangi password"
                  {...register("confirm_password")}
                  className="h-11 pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
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
                <>Daftar <ArrowRight className="w-4 h-4" /></>
              )}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            Sudah punya akun?{" "}
            <Link to="/login" className="font-medium text-foreground hover:underline underline-offset-4">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
