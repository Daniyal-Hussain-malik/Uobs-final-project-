import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, User, Phone, Sparkles, AlertCircle } from 'lucide-react';

export default function AuthRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(formData);
      navigate('/guest');
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
        <h1 className="font-display text-3xl font-bold text-[#EAEBE8]">Create Guest Profile</h1>
        <p className="text-xs text-[#A6ADA1]">Manage your Katpana reservations, upload payment receipts & vouchers</p>
      </div>

      {error && (
        <div className="bg-rose-500/15 border border-rose-500/30 text-rose-300 p-3.5 rounded-2xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-card p-6 sm:p-8 rounded-3xl space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#A6ADA1] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Malik Tariq"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A6ADA1] absolute left-3 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tariq@gmail.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Phone / WhatsApp</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#A6ADA1] absolute left-3 top-3" />
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+92 321 5558899"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#A6ADA1] uppercase font-bold block mb-1">Password (min 6 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A6ADA1] absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-[#EAEBE8] focus:border-[#C5A880] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#b5976e] text-[#121813] font-bold text-xs shadow-lg hover:brightness-110 transition mt-2"
          >
            {loading ? 'Creating Profile...' : 'Complete Registration'}
          </button>
        </form>

        <p className="text-center text-xs text-[#A6ADA1]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#C5A880] hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>

    </div>
  );
}
