'use client';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/features/authSlice';
import api from '../../redux/services/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { email, password, username });
      dispatch(setCredentials({ user: data.user, token: data.token }));
      localStorage.setItem('token', data.token);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 right-0 w-full h-full bg-arena-purple/5 blur-[150px] -z-10 pointer-events-none" />

      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black tracking-tightest mb-2">NEW <br /><span className="text-arena-purple italic">RECRUIT</span></h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Forge your warrior identity to start training</p>
        </div>

        <form onSubmit={handleRegister} className="glass-panel p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-arena-purple to-transparent opacity-50" />

          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 ml-2">Codename (Username)</label>
              <input
                type="text"
                placeholder="Nightshade"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-foreground/5 border border-border-arena rounded-2xl p-4 font-bold focus:ring-2 focus:ring-arena-purple/50 outline-none transition-all placeholder:opacity-20"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 ml-2">Secure Link (Email)</label>
              <input
                type="email"
                placeholder="warrior@arena.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-foreground/5 border border-border-arena rounded-2xl p-4 font-bold focus:ring-2 focus:ring-arena-purple/50 outline-none transition-all placeholder:opacity-20"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-2 ml-2">Access Key (Password)</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-foreground/5 border border-border-arena rounded-2xl p-4 font-bold focus:ring-2 focus:ring-arena-purple/50 outline-none transition-all placeholder:opacity-20"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-arena-purple hover:bg-purple-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-purple-500/20 uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 mt-4"
            >
              Forge Account
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs font-bold opacity-40">
              Already a warrior? <Link href="/login" className="text-arena-purple hover:underline">Log in to base</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
