'use client';

import { useGetFeedQuery } from '@/redux/services/socialApi';
import { useState } from 'react';

export default function ReelsPage() {
  const { data: feed } = useGetFeedQuery();
  const reels = feed?.filter((p: any) => p.type === 'reel') || [];
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="h-screen bg-black flex items-center justify-center overflow-hidden">
      <div className="h-full w-full max-w-md relative snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
        {reels.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500 font-bold uppercase tracking-widest px-12 text-center">
            The arena is quiet... No reels have been shared yet.
          </div>
        ) : (
          reels.map((reel: any, idx: number) => (
            <div key={reel.id} className="h-full w-full snap-start relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 z-10" />

              {/* Media Placeholder */}
              <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center gap-4">
                <div className="text-6xl">🎬</div>
                <div className="text-center px-12">
                  <p className="text-2xl font-black mb-4">{reel.content}</p>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Shared by {reel.creatorName}</p>
                </div>
              </div>

              {/* Interactions Overlay */}
              <div className="absolute right-4 bottom-32 z-20 flex flex-col gap-8">
                <div className="flex flex-col items-center gap-1">
                  <button className="w-14 h-14 rounded-full bg-gray-800/50 backdrop-blur-md flex items-center justify-center text-2xl hover:bg-pink-600 transition-colors">
                    ❤️
                  </button>
                  <span className="text-xs font-black">{reel.likes.length}</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <button className="w-14 h-14 rounded-full bg-gray-800/50 backdrop-blur-md flex items-center justify-center text-2xl hover:bg-blue-600 transition-colors">
                    💬
                  </button>
                  <span className="text-xs font-black">{reel.comments.length}</span>
                </div>
                <button className="w-14 h-14 rounded-full bg-gray-800/50 backdrop-blur-md flex items-center justify-center text-2xl hover:bg-green-600 transition-colors">
                  🚀
                </button>
              </div>

              {/* Info Overlay */}
              <div className="absolute bottom-8 left-8 right-24 z-20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center font-black">
                    {reel.creatorName[0].toUpperCase()}
                  </div>
                  <span className="font-black text-lg">@{reel.creatorName}</span>
                  <button className="border border-white/40 px-4 py-1 rounded-lg text-xs font-black uppercase tracking-widest">Follow</button>
                </div>
                <p className="text-sm line-clamp-2 opacity-80">{reel.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Side Navigation */}
      <div className="hidden lg:flex fixed left-12 top-1/2 -translate-y-1/2 flex-col gap-8 z-30">
        <div className="text-xs font-black uppercase tracking-[0.3em] vertical-text text-gray-600 -rotate-90">REEL ARENA</div>
        <div className="w-1 h-32 bg-gray-900 rounded-full relative">
          <div className="absolute top-0 left-0 w-full bg-cyan-500 rounded-full transition-all duration-500" style={{ height: `${((activeIdx + 1) / (reels.length || 1)) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
