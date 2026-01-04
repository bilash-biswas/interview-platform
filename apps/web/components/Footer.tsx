import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border-arena py-16 mt-auto">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <h3 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              INTERVIEW ARENA
            </h3>
            <p className="text-gray-500 text-sm mt-4 leading-relaxed">
              Master the art of technical warfare. Compete, socialise, and conquer your career goals.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="space-y-4">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Combat</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/exams" className="hover:text-white transition">Exams</Link></li>
                <li><Link href="/battle" className="hover:text-white transition">Live Battles</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Network</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/social" className="hover:text-white transition">Social Feed</Link></li>
                <li><Link href="/social/friends" className="hover:text-white transition">Comrades</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-black text-xs uppercase tracking-[0.2em]">Portal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border-arena mt-16 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold text-foreground/40 uppercase tracking-widest">
          <p>© {new Date().getFullYear()} INTERVIEW ARENA. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
