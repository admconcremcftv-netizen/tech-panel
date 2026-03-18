import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ToastSystem";
import logoCompleto from "@/assets/concrem-logo.png";
import wallpaper from "@/assets/wallpaper-login-v2.jpg";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Autenticação simples para demonstração
    // Usuário padrão: admin / Senha padrão: 123456
    setTimeout(() => {
      if (username === "admin" && password === "123456") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("user", JSON.stringify({ name: "Administrador", email: "admin@concrem.com" }));
        showToast("Bem-vindo ao Painel de Controle!");
        navigate("/");
      } else {
        showToast("Usuário ou senha incorretos.");
      }
      setLoading(false);
    }, 800);
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
            <h1 className="text-2xl font-bold text-foreground mb-2 font-sans">Acesso ao Painel</h1>
            <p className="text-sm text-muted-foreground font-sans">
              Entre com suas credenciais para gerenciar os ativos.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[0.7rem] text-muted-foreground uppercase font-semibold font-sans">
                Usuário
              </label>
              <input
                type="text"
                required
                className="w-full bg-background border border-border px-4 py-3 rounded-md text-sm text-foreground outline-none focus:border-primary transition-all font-sans"
                placeholder="Seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[0.7rem] text-muted-foreground uppercase font-semibold font-sans">
                Senha
              </label>
              <input
                type="password"
                required
                className="w-full bg-background border border-border px-4 py-3 rounded-md text-sm text-foreground outline-none focus:border-primary transition-all font-sans"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-sm font-semibold uppercase tracking-wider"
            >
              {loading ? "Autenticando..." : "Entrar no Sistema"}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground font-sans italic">
              Dica: Use <strong>admin</strong> e <strong>123456</strong> para acessar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
