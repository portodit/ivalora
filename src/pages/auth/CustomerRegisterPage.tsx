import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight, Check, Mail, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoFull from "@/assets/logo-full.svg";

const schema = z.object({
  full_name: z.string().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().email("Email tidak valid").max(255),
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

export default function CustomerRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
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

    setRegisteredEmail(data.email);
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="border-b border-border px-6 py-4">
          <Link to="/katalog">
            <img src={logoFull} alt="Ivalora Gadget" className="h-6 invert" />
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-sm w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-foreground flex items-center justify-center mx-auto">
              <Check className="w-7 h-7 text-background" strokeWidth={2.5} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Verifikasi Email</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Link verifikasi telah dikirim ke <span className="font-semibold text-foreground">{registeredEmail}</span>.
                Klik link tersebut untuk mengaktifkan akun dan mulai berbelanja.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 px-5 py-4 flex items-center gap-3 text-left">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs font-semibold text-foreground">Cek folder Spam</p>
                <p className="text-xs text-muted-foreground mt-0.5">Jika tidak masuk inbox, cek folder spam/junk email Anda.</p>
              </div>
            </div>
            <Link to="/login" className="block text-sm font-semibold text-foreground hover:underline underline-offset-4">
              Kembali ke halaman login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="border-b border-border px-6 py-4 flex items-center justify-between">
        <Link to="/katalog">
          <img src={logoFull} alt="Ivalora Gadget" className="h-6 invert" />
        </Link>
        <Link to="/katalog" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          Kembali ke Katalog
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-foreground/5 border border-border flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7 text-foreground" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Buat akun baru</h1>
            <p className="text-sm text-muted-foreground">Daftar gratis dan mulai berbelanja di Ivalora</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Nama Lengkap</Label>
              <Input placeholder="Masukkan nama lengkap" {...register("full_name")} className="h-11" />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</Label>
              <Input type="email" placeholder="Masukkan email" {...register("email")} className="h-11" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} placeholder="Min. 8 karakter, ada huruf kapital & angka" {...register("password")} className="h-11 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Konfirmasi Password</Label>
              <div className="relative">
                <Input type={showConfirm ? "text" : "password"} placeholder="Ulangi password" {...register("confirm_password")} className="h-11 pr-10" />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
            </div>

            {serverError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">{serverError}</div>
            )}

            <Button type="submit" className="w-full h-11 gap-2 font-semibold mt-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (<>Daftar <ArrowRight className="w-4 h-4" /></>)}
            </Button>
          </form>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link to="/login" className="font-semibold text-foreground hover:underline underline-offset-4">Masuk</Link>
            </p>
            <p className="text-xs text-muted-foreground">
              Admin?{" "}
              <Link to="/admin/register" className="text-muted-foreground hover:text-foreground underline underline-offset-4">Daftar admin</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
