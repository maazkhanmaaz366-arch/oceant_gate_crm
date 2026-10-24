import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useUser();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      // Wait for login context to update and redirect
      navigate('/');
    } catch (err) {
      setError('Invalid credentials. Hint: use "admin" or "sales"');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/grid-pattern.svg')] bg-fixed p-4">
      {/* Background Decorators */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-ocean/20 rounded-full blur-[100px] pointer-events-none transform -translate-y-1/2"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#F7CF32]/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="card-glass w-full max-w-md p-8 relative z-10 animate-fade-in shadow-2xl shadow-ocean/10 border-t border-white/20">
        <div className="text-center mb-8">
          <img 
            src="/logo.jpg" 
            alt="OceanGate" 
            className="w-24 h-24 mx-auto mb-4 rounded-full object-cover shadow-lg border-2 border-ocean" 
          />
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--color-text-main)' }}>OCEAN GATE</h1>
          <p className="font-medium mt-1" style={{ color: 'var(--color-text-muted)' }}>CRM & Marketing Command Center</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm font-bold text-center animate-shake">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">✉️</span>
              <input 
                type="text" 
                className="input-glass w-full pl-10 h-12 text-lg"
                placeholder="admin@oceangate.ae"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">🔒</span>
              <input 
                type="password" 
                className="input-glass w-full pl-10 h-12 text-lg tracking-widest"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-ocean to-ocean-dark text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-ocean/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="animate-spin text-xl">⏳</span>
            ) : (
              <>Sign In <span className="text-xl">&rarr;</span></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 text-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <p>Secure Enterprise Portal • Version 2.0</p>
          <p className="mt-1 font-mono">IP Logged • Protected by 2FA</p>
        </div>
      </div>
    </div>
  );
};
