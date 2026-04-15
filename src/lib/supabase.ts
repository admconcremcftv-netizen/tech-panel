import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação mais robusta para evitar crash se as chaves forem as do template ou vazias
const isValidUrl = typeof supabaseUrl === 'string' && supabaseUrl.includes('supabase.co');
const isValidKey = typeof supabaseAnonKey === 'string' && supabaseAnonKey.length > 20;

// Agora o sistema usará o banco se os dados no .env estiverem corretos
const isValidConfig = isValidUrl && isValidKey; 

// Log para depuração de ambiente
console.log('Supabase Env Check:', { 
  url: supabaseUrl ? 'detectada' : 'ausente', 
  key: supabaseAnonKey ? 'detectada' : 'ausente',
  isValidConfig 
});

if (!isValidConfig) {
  console.log('ℹ️ Aplicação rodando em modo OFFLINE (Dados Mockados).');
  console.log('💡 Para conectar ao banco real, preencha o arquivo .env com suas credenciais do Supabase.');
} else {
  console.log('✅ Supabase configurado com sucesso para:', supabaseUrl);
}

// Inicializa com valores seguros ou dummy para evitar quebra do SDK
export const supabase = createClient(
  isValidConfig ? supabaseUrl : 'https://placeholder-url.supabase.co',
  isValidConfig ? supabaseAnonKey : 'placeholder-key',
  isValidConfig
    ? {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    : {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
);

export const isSupabaseConfigured = isValidConfig;

if (isValidConfig && typeof window !== 'undefined') {
  void (async () => {
    const { error } = await supabase.auth.getSession();
    if (error && /refresh token/i.test(error.message)) {
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // ignore
      }
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
    }
  })();
}
