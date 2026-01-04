'use client';

import { useGetExamsQuery } from '@/redux/services/examApi';
import Link from 'next/link';

export default function ExamsListPage() {
  const { data: exams, isLoading } = useGetExamsQuery();

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 transition-colors duration-300">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-16">
          <div>
            <div className="inline-block px-4 py-1.5 mb-4 rounded-full border border-arena-blue/20 bg-arena-blue/5 text-arena-blue text-[10px] font-black uppercase tracking-[0.2em]">
              Assigned Sectors
            </div>
            <h1 className="text-5xl font-black tracking-tightest">
              OFFICIAL <br /><span className="text-arena-blue italic">EXAM ARENA</span>
            </h1>
          </div>
          <Link
            href="/exams/create"
            className="w-full md:w-auto bg-arena-purple hover:bg-purple-600 text-white font-black px-10 py-5 rounded-[2rem] transition-all shadow-xl shadow-purple-500/20 uppercase tracking-widest text-sm hover:scale-[1.02]"
          >
            + Initiate Deployment
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 glass-panel rounded-[2.5rem] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exams?.map((exam: any) => (
              <div key={exam.id} className="group relative glass-panel p-10 rounded-[3rem] hover:border-arena-blue/50 transition-all duration-500 overflow-hidden shadow-2xl bg-gradient-to-br from-transparent to-arena-blue/[0.02]">
                <div className="absolute top-0 right-0 p-6">
                  <span className="bg-arena-blue/10 text-arena-blue text-[10px] font-black px-4 py-1.5 rounded-full border border-arena-blue/20 uppercase tracking-widest">
                    {exam.category}
                  </span>
                </div>

                <h3 className="text-2xl font-black mb-6 group-hover:text-arena-blue transition-colors leading-tight">
                  {exam.title}
                </h3>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black opacity-30 uppercase tracking-widest">Commences</span>
                    <span className="font-mono font-bold text-foreground">{new Date(exam.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black opacity-30 uppercase tracking-widest">Window</span>
                    <span className="font-bold">{exam.totalTime}m Session</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black opacity-30 uppercase tracking-widest">Risk Level</span>
                    <span className="text-pink-500 font-black">-{exam.negativeMarkingValue} Penalty</span>
                  </div>
                </div>

                <Link
                  href={`/exams/${exam.id}`}
                  className="block w-full text-center bg-foreground text-background group-hover:bg-arena-blue group-hover:text-white font-black py-5 rounded-[1.5rem] transition-all uppercase tracking-widest text-[10px]"
                >
                  Enter Combat Sector
                </Link>

                <div className="absolute bottom-0 left-0 w-full h-1 bg-arena-blue scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
