import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ToastSystem";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import logoCompleto from "@/assets/concrem-logo.png";
import wallpaper from "@/assets/wallpaper-login-v2.jpg";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      showToast("As senhas não coincidem.", "error");
      return;
    }

    if (!isSupabaseConfigured) {
      showToast("Supabase não configurado. Preencha o .env para habilitar o cadastro.", "error");
      return;
    }

    const lastAttemptKey = `signup:lastAttempt:${email.trim().toLowerCase()}`;
    const lastAttempt = Number(localStorage.getItem(lastAttemptKey) || "0");
    if (Number.isFinite(lastAttempt) && lastAttempt > 0 && Date.now() - lastAttempt < 60_000) {
      showToast("Aguarde 1 minuto antes de tentar cadastrar novamente este e-mail.", "info");
      return;
    }

    setLoading(true);
    localStorage.setItem(lastAttemptKey, String(Date.now()));

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            username,
          },
        },
      });

      if (error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("rate limit") && msg.includes("email")) {
          showToast(
            "Limite de envio de e-mails excedido no Supabase. Aguarde alguns minutos e tente novamente. Para testes, desative a confirmação de e-mail em Auth > Providers > Email.",
            "error"
          );
        } else {
          showToast(error.message, "error");
        }
        return;
      }

      const session = data.session;
      const user = data.user;

      if (session && user) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: (user.user_metadata as Record<string, unknown>)?.name || "Usuário",
            email: user.email || email,
          })
        );
        showToast("Cadastro realizado com sucesso!", "success");
        navigate("/");
        return;
      }

      showToast("Cadastro criado. Verifique seu e-mail para confirmar e depois faça login.", "info");
      navigate("/login");
    } catch {
      showToast("Erro ao realizar cadastro.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat p-4"
      style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${wallpaper})` }}
    >
      <div className="w-full max-w-md bg-card/95 backdrop-blur-sm rounded-xl shadow-2xl border border-white/10 overflow-hidden transform transition-all hover:scale-[1.01]">
        <div className="bg-primary/90 p-8 flex justify-center border-b border-primary-hover/50 backdrop-blur-md">
          <img src={logoCompleto} alt="Concrem Logo" className="h-12 object-contain filter drop-shadow-md" />
        </div>
        
        <div className="p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight">Criar Conta</h1>
            <p className="text-sm text-white/90 font-sans">
              Preencha os dados abaixo para se cadastrar no sistema.
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[0.75rem] text-white/80 uppercase font-bold font-sans tracking-wider">
                Nome Completo
              </label>
              <input
                type="text"
                required
                className="w-full bg-background border border-border px-4 py-2.5 rounded-md text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[0.75rem] text-white/80 uppercase font-bold font-sans tracking-wider">
                E-mail
              </label>
              <input
                type="email"
                required
                className="w-full bg-background border border-border px-4 py-2.5 rounded-md text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                placeholder="email@concrem.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[0.75rem] text-white/80 uppercase font-bold font-sans tracking-wider">
                  Usuário
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-background border border-border px-4 py-2.5 rounded-md text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[0.75rem] text-white/80 uppercase font-bold font-sans tracking-wider">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  className="w-full bg-background border border-border px-4 py-2.5 rounded-md text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[0.75rem] text-white/80 uppercase font-bold font-sans tracking-wider">
                Confirmar Senha
              </label>
              <input
                type="password"
                required
                className="w-full bg-background border border-border px-4 py-2.5 rounded-md text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-sm font-bold uppercase tracking-widest mt-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg active:scale-95 transition-all"
            >
              {loading ? "Cadastrando..." : "Cadastrar Usuário"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/20 text-center">
            <p className="text-xs text-white/80 font-sans">
              Já possui uma conta?{" "}
              <button 
                onClick={() => navigate("/login")}
                className="text-white font-bold hover:underline"
              >
                Faça login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
