'use client';

import { useParams } from 'next/navigation';
import { useGetExamDetailsQuery, useGetExamRankingsQuery } from '@/redux/services/examApi';
import Link from 'next/link';

export default function ExamRankingsPage() {
  const { id } = useParams();
  const { data: exam } = useGetExamDetailsQuery(id as string);
  const { data: rankings, isLoading } = useGetExamRankingsQuery(id as string);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/exams" className="text-gray-500 hover:text-white transition-colors mb-8 inline-block font-bold tracking-widest text-xs uppercase">
          ← Back to Exams
        </Link>
        
        <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          BATTLE RANKINGS
        </h1>
        <p className="text-gray-400 font-bold mb-12 uppercase tracking-[0.3em] text-sm">{exam?.title}</p>

        <div className="bg-gray-900/50 rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-500 w-24 text-center">Rank</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-500">Warrior</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-500 text-center">Score</th>
                <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-500 text-center">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="p-6"><div className="h-8 bg-gray-800 rounded w-12 mx-auto" /></td>
                    <td className="p-6"><div className="h-8 bg-gray-800 rounded w-1/2" /></td>
                    <td className="p-6"><div className="h-8 bg-gray-800 rounded w-12 mx-auto" /></td>
                    <td className="p-6"><div className="h-8 bg-gray-800 rounded w-24 mx-auto" /></td>
                  </tr>
                ))
              ) : rankings?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-500 italic font-bold">No submissions yet. Be the first!</td>
                </tr>
              ) : rankings?.map((res: any, idx: number) => (
                <tr key={res.id} className={`${idx === 0 ? 'bg-yellow-500/5' : ''} hover:bg-white/5 transition-colors`}>
                  <td className="p-6 text-center">
                    {idx === 0 ? '🏆' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="font-bold text-gray-600">#{idx + 1}</span>}
                  </td>
                  <td className="p-6">
                    <div className="font-black text-lg">{res.username}</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Submitted {new Date(res.submissionTime).toLocaleTimeString()}</div>
                  </td>
                  <td className="p-6 text-center">
                    <span className={`text-2xl font-black ${res.score >= 0 ? 'text-green-400' : 'text-pink-500'}`}>
                      {res.score.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <div className="font-mono text-cyan-400 font-bold">
                      {Math.floor(res.timeSpent / 60)}m {res.timeSpent % 60}s
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
