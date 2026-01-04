'use client';

import { useParams } from 'next/navigation';
import { useGetUserProfileQuery, useLikePostMutation, useAddCommentMutation } from '@/redux/services/socialApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const { user: currentUser } = useSelector((state: RootState) => state.auth);
  const { data: profile, isLoading } = useGetUserProfileQuery({ userId, viewerId: currentUser?.id });
  const [likePost] = useLikePostMutation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-arena-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black mb-4">PERSONNEL NOT FOUND</h1>
        <p className="opacity-40 uppercase tracking-widest text-xs">This warrior has not been identified in the current sector.</p>
        <Link href="/social" className="mt-10 px-8 py-3 bg-arena-blue text-white font-black rounded-xl uppercase tracking-widest text-xs">Return to Feed</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden pb-20">
      <div className="absolute top-0 right-0 w-full h-full bg-arena-blue/5 blur-[150px] -z-10 pointer-events-none" />

      {/* Profile Header */}
      <div className="relative pt-32 pb-16 px-6 border-b border-border-arena bg-gradient-to-b from-arena-blue/5 to-transparent">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
          <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-arena-blue to-arena-purple p-1 shadow-2xl shadow-arena-blue/20 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full rounded-[2.8rem] bg-background flex items-center justify-center text-6xl font-black">
              {profile.posts[0]?.creatorName?.[0].toUpperCase() || 'W'}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-5xl font-black tracking-tighter uppercase">{profile.posts[0]?.creatorName || 'WARRIOR_ALPHA'}</h1>
              <span className="px-4 py-1.5 bg-arena-blue/10 text-arena-blue border border-arena-blue/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] self-center md:self-auto">Elite Scout</span>
            </div>
            <p className="opacity-40 font-bold uppercase tracking-widest text-xs mb-8">Sector ID: {userId.slice(-8).toUpperCase()} • Active since {new Date().getFullYear()}</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-12">
              <div className="text-center md:text-left">
                <p className="text-3xl font-black text-arena-blue">{profile.postCount}</p>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">Broadcasts</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-3xl font-black text-arena-purple">{profile.totalLikes}</p>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">Total Reactions</p>
              </div>
              <div className="text-center md:text-left">
                <p className="text-3xl font-black text-arena-orange">94%</p>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">Accuracy</p>
              </div>
            </div>
          </div>

          {currentUser?.id !== userId && (
            <div className="flex gap-4">
              {profile.connectionStatus === 'accepted' ? (
                <button className="px-8 py-4 bg-arena-blue text-white font-black rounded-2xl uppercase tracking-widest text-[10px] transform hover:scale-105 transition-all shadow-xl shadow-arena-blue/20">Message Comrades</button>
              ) : profile.connectionStatus === 'pending' ? (
                <button className="px-8 py-4 bg-foreground/10 border border-border-arena text-foreground opacity-50 font-black rounded-2xl uppercase tracking-widest text-[10px] cursor-not-allowed">Request Pending</button>
              ) : (
                <button className="px-8 py-4 bg-foreground text-background font-black rounded-2xl uppercase tracking-widest text-[10px] transform hover:scale-105 transition-all shadow-xl">Initiate Link</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Broadcast History */}
      <div className="max-w-4xl mx-auto px-6 mt-16">
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-12 border-l-2 border-arena-blue pl-4">BROADCAST HISTORY</h2>

        <div className="space-y-12">
          {profile.posts.length === 0 ? (
            <div className="py-20 text-center glass-panel rounded-[3rem] border-dashed">
              <p className="opacity-30 font-black uppercase tracking-widest text-sm">No tactical broadcasts detected from this unit.</p>
            </div>
          ) : (
            profile.posts.map((post: any) => (
              <div key={post.id} className="glass-panel p-10 rounded-[3rem] relative group hover:border-arena-blue/30 transition-all duration-500">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full animate-pulse ${post.type === 'post' ? 'bg-arena-blue' : post.type === 'reel' ? 'bg-arena-purple' : 'bg-arena-orange'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{post.type} • {new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className={`leading-relaxed mb-10 ${post.type === 'quote' ? 'text-2xl italic font-serif opacity-90' : 'text-xl font-medium'}`}>{post.content}</p>

                <div className="flex items-center gap-8 pt-8 border-t border-border-arena">
                  <button
                    onClick={() => likePost({ postId: post.id, userId: currentUser?.id || '' })}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                  >
                    <span>❤️</span> {post.likes.length} Reactions
                  </button>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                    <span>💬</span> {post.comments.length} Comms
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
