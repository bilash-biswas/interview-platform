'use client';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { logout } from '../redux/features/authSlice';
import { useRouter } from 'next/navigation';
import { useTheme } from './ThemeProvider';

export default function Header() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <header className="bg-background/80 glass-panel backdrop-blur-xl border-b border-border-arena sticky top-0 z-50 transition-colors duration-300">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-all">
          INTERVIEW ARENA
        </Link>

        <nav className="hidden lg:flex items-center gap-8 font-bold text-sm uppercase tracking-widest text-foreground">
          <Link href="/exams" className="opacity-60 hover:text-arena-blue hover:opacity-100 transition-opacity">Exams</Link>
          <Link href="/battle" className="opacity-60 hover:text-arena-orange hover:opacity-100 transition-all">Battle</Link>
          <Link href="/social" className="opacity-60 hover:text-arena-blue hover:opacity-100 transition-all">Social</Link>
          <Link href="/map" className="opacity-60 hover:text-arena-green hover:opacity-100 transition-all">Map</Link>
          <Link href="/social/friends" className="opacity-60 hover:text-arena-purple hover:opacity-100 transition-all">Friends</Link>
          <Link href="/dashboard" className="opacity-60 hover:text-arena-blue hover:opacity-100 transition-all">Dashboard</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-all text-xl"
            title="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center gap-6">
              <Link href={`/social/profile/${user?.id}`} className="hidden md:flex flex-col items-end group">
                <span className="text-[10px] font-black opacity-40 uppercase tracking-tighter group-hover:text-arena-blue transition-colors">Warrior</span>
                <span className="font-bold text-sm group-hover:text-arena-blue transition-colors">{user?.username}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 border border-red-500/20 text-red-500 px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/10"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link href="/login" className="opacity-60 hover:opacity-100 transition-opacity py-2 font-bold uppercase tracking-widest text-xs h-full flex items-center">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-arena-blue hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/30"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
