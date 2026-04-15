import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ToastSystem";
import { SupabaseService } from "@/lib/supabaseService";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import logoCompleto from "@/assets/concrem-logo.png";
import wallpaper from "@/assets/wallpaper-login-v2.jpg";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSupabaseConfigured && username.includes("@")) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username,
          password,
        });

        if (error) {
          showToast(error.message, "error");
          return;
        }

        const user = data.user;
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: (user?.user_metadata as Record<string, unknown>)?.name || "Usuário",
            email: user?.email || username,
          })
        );

        showToast("Login realizado com sucesso!", "success");
        navigate("/");
        return;
      }

      if (username === "admin" && password === "123456") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify({ name: "Administrador", email: "admin@concrem.com" }));
        
        const [equips, events] = await Promise.all([
          SupabaseService.getEquipments(),
          SupabaseService.getEvents()
        ]);

        const expiredCount = equips.filter(eq => {
          if (!eq.dataCompra) return false;
          const sixMonthsLater = new Date(eq.dataCompra);
          sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
          return new Date() > sixMonthsLater;
        }).length;

        const upcomingCount = events.filter(event => {
          if (event.type !== 'Manutenção' || !event.desc.includes('AGENDADO PARA:')) return false;
          const dateMatch = event.desc.match(/AGENDADO PARA: (\d{2}\/\d{2}\/\d{4})/);
          if (!dateMatch) return false;
          const [day, month, year] = dateMatch[1].split('/').map(Number);
          const scheduledDate = new Date(year, month - 1, day);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0,0,0,0);
          return scheduledDate.getTime() === tomorrow.getTime();
        }).length;

        const totalNotifs = expiredCount + upcomingCount;

        if (totalNotifs > 0) {
          showToast(`Bem-vindo! Você possui ${totalNotifs} notificações importantes pendentes.`, "info");
        } else {
          showToast("Bem-vindo ao Painel de Controle!", "success");
        }

        navigate("/");
        return;
      }

      if (isSupabaseConfigured && !username.includes("@")) {
        showToast("Para login com Supabase, use seu e-mail.", "error");
        return;
      }

      showToast("Usuário ou senha incorretos.", "error");
    } catch (error) {
      showToast("Erro ao realizar login.", "error");
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
            <h1 className="text-2xl font-bold text-white mb-2 font-sans tracking-tight">Acesso ao Painel</h1>
            <p className="text-sm text-white/90 font-sans">
              Entre com suas credenciais para gerenciar os ativos.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[0.75rem] text-white/80 uppercase font-bold font-sans tracking-wider">
                E-mail
              </label>
              <input
                type="text"
                required
                className="w-full bg-background border border-border px-4 py-3 rounded-md text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                placeholder="email@concrem.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[0.75rem] text-white/80 uppercase font-bold font-sans tracking-wider">
                Senha
              </label>
              <input
                type="password"
                required
                className="w-full bg-background border border-border px-4 py-3 rounded-md text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-sans"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-sm font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg active:scale-95 transition-all"
            >
              {loading ? "Autenticando..." : "Entrar no Sistema"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/20 text-center space-y-4">
            <p className="text-xs text-white/80 font-sans">
              Não tem uma conta?{" "}
              <button 
                onClick={() => navigate("/register")}
                className="text-white font-bold hover:underline"
              >
                Cadastre-se agora
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
