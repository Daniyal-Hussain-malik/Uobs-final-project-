import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Sparkles, AlertCircle } from 'lucide-react';

export default function AuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.user.role === 'admin') navigate('/admin');
      else if (res.user.role === 'reception') navigate('/reception');
      else navigate('/guest');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-full bg-[#6D7C5D] mx-auto flex items-center justify-center text-[#121813] font-bold shadow-lg">
          <Sparkles className="w-6 h-6 text-[#121813]" />
        </div>
        <h1 className="font-display text-3xl font-bold text-[#EAEBE8]">Welcome Back</h1>
        <p className="text-xs text-[#A6ADA1]">Access your reservation portal or staff dashboard</p>
      </div>

      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3.5 rounded-2xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-[#232A23] border border-white/10 p-6 sm:p-8 rounded-2xl space-y-5 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A8AD94] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. admin@oasisresort.pk"
                className="w-full bg-black/30 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#A8AD94] uppercase font-bold block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A8AD94] absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-black/30 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-[#EAEBE8] focus:border-[#787C68] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#787C68] hover:bg-[#868B74] text-[#232A23] font-semibold text-xs uppercase tracking-widest shadow-lg transition mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-[#A8AD94]">
          Don't have an account yet?{' '}
          <Link to="/register" className="text-[#EAEBE8] hover:underline font-semibold ml-1">
            Create Guest Account
          </Link>
        </p>
      </div>

    </div>
  );
}
