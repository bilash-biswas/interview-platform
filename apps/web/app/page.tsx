import Link from 'next/link';
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl aspect-square bg-blue-600/10 blur-[120px] rounded-full -z-10 pointer-events-none" />

        <div className="container mx-auto text-center">
          <div className="inline-block px-4 py-1.5 mb-8 rounded-full border border-arena-blue/20 bg-arena-blue/5 text-arena-blue text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
            New Era of Technical Training
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tightest leading-[0.9] mb-8">
            DOMINATE THE <br />
            <span className="bg-gradient-to-r from-arena-blue via-arena-purple to-arena-orange bg-clip-text text-transparent italic">INTERVIEW</span> ARENA
          </h1>

          <p className="text-lg md:text-xl opacity-60 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Collaborative coding, live battles, and community-driven learning.
            Prepare for your career like a warrior in a high-stakes environment.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="/register"
              className="w-full sm:w-auto px-10 py-5 bg-arena-blue hover:bg-blue-600 text-white font-black rounded-[2rem] shadow-xl shadow-blue-500/20 transition-all hover:scale-105 uppercase tracking-widest text-sm"
            >
              Start Training
            </Link>
            <Link
              href="/social"
              className="w-full sm:w-auto px-10 py-5 glass-panel hover:bg-foreground/5 font-black rounded-[2rem] transition-all uppercase tracking-widest text-sm"
            >
              Explore Social
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="glass-panel p-10 rounded-[3rem] group hover:border-arena-blue/50 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-arena-blue/10 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                ⚔️
              </div>
              <h3 className="text-2xl font-black mb-4">Live Battles</h3>
              <p className="opacity-50 font-bold leading-relaxed">
                Compete 1v1 in real-time coding duels. Speed, accuracy, and logic determine the victor.
              </p>
            </div>

            <div className="glass-panel p-10 rounded-[3rem] group hover:border-arena-purple/50 transition-all duration-500 translate-y-0 md:-translate-y-8">
              <div className="w-16 h-16 rounded-2xl bg-arena-purple/10 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                🥇
              </div>
              <h3 className="text-2xl font-black mb-4">Pro Exams</h3>
              <p className="opacity-50 font-bold leading-relaxed">
                Official timed assessments with ranked leaderboards and achievement tracking.
              </p>
            </div>

            <div className="glass-panel p-10 rounded-[3rem] group hover:border-arena-orange/50 transition-all duration-500">
              <div className="w-16 h-16 rounded-2xl bg-arena-orange/10 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                🌐
              </div>
              <h3 className="text-2xl font-black mb-4">Meta Social</h3>
              <p className="opacity-50 font-bold leading-relaxed">
                Share reels, stories, and quotes. Connect with fellow warriors and build your network.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Counter (Static Placeholder for WOW factor) */}
      <section className="py-20 border-y border-border-arena bg-foreground/[0.02]">
        <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl font-black mb-1">50K+</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Active Warriors</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-1">1.2M+</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Battles Won</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-1">200+</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">Daily Exams</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-1">4.9/5</div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-40">User Rating</div>
          </div>
        </div>
      </section>

    </div>
  );
}
