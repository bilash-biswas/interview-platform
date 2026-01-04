'use client';

import { useState } from 'react';
import { useGetFeedQuery, useCreatePostMutation, useGetStoriesQuery, useLikePostMutation, useAddCommentMutation, useAddReplyMutation } from '@/redux/services/socialApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';

export default function SocialFeedPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: feed, isLoading: loadingFeed } = useGetFeedQuery();
  const { data: stories } = useGetStoriesQuery();
  const [createPost, { isLoading: isPosting }] = useCreatePostMutation();
  const [likePost] = useLikePostMutation();
  const [addComment] = useAddCommentMutation();
  const [addReply] = useAddReplyMutation();

  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState<'post' | 'reel' | 'quote'>('post');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postContent) return;
    try {
      await createPost({ creatorId: user.id, creatorName: user.username, content: postContent, type: postType }).unwrap();
      setPostContent('');
    } catch (err) { alert('Post failed'); }
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText || !user) return;
    try {
      await addComment({ postId, body: { userId: user.id, username: user.username, text: commentText } }).unwrap();
      setCommentText('');
    } catch (err) { alert('Comment failed'); }
  };

  const handleAddReply = async (postId: string, commentId: string) => {
    if (!replyText || !user) return;
    try {
      await addReply({ postId, commentId, body: { userId: user.id, username: user.username, text: replyText } }).unwrap();
      setReplyText('');
      setReplyToId(null);
    } catch (err) { alert('Reply failed'); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-full bg-arena-blue/5 blur-[150px] -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* Left/Main Column */}
        <div className="lg:col-span-8 space-y-10">

          {/* Stories Bar */}
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
            <div className="flex-shrink-0 group cursor-pointer snap-start">
              <div className="w-20 h-20 rounded-3xl bg-foreground/5 border-2 border-dashed border-border-arena flex items-center justify-center transition-all group-hover:border-arena-blue group-hover:bg-arena-blue/5">
                <span className="text-3xl font-light opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all">+</span>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-center mt-3 opacity-40">Add Intel</p>
            </div>
            {stories?.map((story: any) => (
              <div key={story.id} className="flex-shrink-0 group cursor-pointer snap-start">
                <div className="w-20 h-20 rounded-3xl p-[3px] bg-gradient-to-tr from-arena-blue to-arena-purple transition-transform group-hover:scale-110 duration-500">
                  <div className="w-full h-full rounded-[1.4rem] bg-background p-0.5">
                    <img src={story.mediaUrl || 'https://via.placeholder.com/150'} className="w-full h-full rounded-[1.2rem] object-cover" alt={story.username} />
                  </div>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-center mt-3 truncate w-20 opacity-60">{story.username}</p>
              </div>
            ))}
          </div>

          {/* Create Post */}
          <div className="glass-panel p-8 rounded-[3rem] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-arena-blue via-arena-purple to-arena-orange opacity-30" />
            <div className="flex gap-3 mb-8">
              {(['post', 'reel', 'quote'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={`text-[10px] font-black uppercase tracking-widest px-6 py-2.5 rounded-full border transition-all ${postType === type
                    ? `bg-arena-${type === 'post' ? 'blue' : type === 'reel' ? 'purple' : 'orange'} text-white border-transparent shadow-lg`
                    : 'bg-foreground/5 border-border-arena opacity-40 hover:opacity-100'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <form onSubmit={handlePostSubmit}>
              <textarea
                value={postContent}
                onChange={e => setPostContent(e.target.value)}
                placeholder={postType === 'quote' ? "What profound logic will you share today?" : "Broadcast your tactical progress..."}
                className="w-full bg-foreground/[0.03] border border-border-arena rounded-[2rem] p-6 focus:outline-none focus:ring-2 focus:ring-arena-blue/30 transition-all min-h-[140px] font-medium text-lg placeholder:opacity-20"
              />
              <div className="flex justify-between items-center mt-8">
                <div className="flex gap-6">
                  <button type="button" className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center text-xl hover:bg-foreground/10 transition-all" title="Attach Media">🖼️</button>
                  <button type="button" className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center text-xl hover:bg-foreground/10 transition-all" title="Attach Stream">🎥</button>
                </div>
                <button disabled={isPosting} className="bg-foreground text-background font-black px-10 py-4 rounded-2xl hover:scale-105 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50 shadow-xl shadow-foreground/5">
                  {isPosting ? 'Uplinking...' : 'Broadcast'}
                </button>
              </div>
            </form>
          </div>

          {/* Feed */}
          {loadingFeed ? (
            <div className="space-y-12">
              {[1, 2].map(i => <div key={i} className="h-96 glass-panel rounded-[3rem] animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-12">
              {feed?.map((post: any) => (
                <div key={post.id} className="glass-panel rounded-[3.5rem] overflow-hidden group hover:border-border-arena transition-all duration-700">
                  <div className="p-10 md:p-14">
                    <div className="flex items-center gap-5 mb-8">
                      <Link href={`/social/profile/${post.creatorId}`} className={`w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center font-black text-2xl shadow-lg ${post.type === 'post' ? 'from-arena-blue to-blue-700' : post.type === 'reel' ? 'from-arena-purple to-purple-700' : 'from-arena-orange to-orange-700'} text-white hover:scale-110 transition-transform`}>
                        {post.creatorName[0].toUpperCase()}
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/social/profile/${post.creatorId}`} className="font-black text-xl tracking-tight hover:text-arena-blue transition-colors">{post.creatorName}</Link>
                          <span className="w-1 h-1 rounded-full bg-foreground/20" />
                          <span className={`text-[10px] font-black uppercase tracking-widest ${post.type === 'post' ? 'text-arena-blue' : post.type === 'reel' ? 'text-arena-purple' : 'text-arena-orange'}`}>{post.type}</span>
                        </div>
                        <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mt-1">Sector Entry: {new Date(post.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button className="w-10 h-10 rounded-full hover:bg-foreground/5 flex items-center justify-center opacity-40 hover:opacity-100 transition-all italic font-black text-xl">...</button>
                    </div>

                    <div className={`leading-relaxed mb-10 ${post.type === 'quote' ? 'font-serif italic text-3xl md:text-4xl text-center px-6 md:px-12 py-12 border-y border-border-arena bg-foreground/[0.02] rounded-[2rem] relative' : 'text-xl md:text-2xl font-medium tracking-tight opacity-90'}`}>
                      {post.type === 'quote' && <span className="absolute top-4 left-6 text-6xl opacity-10 select-none">"</span>}
                      {post.content}
                      {post.type === 'quote' && <span className="absolute bottom-4 right-6 text-6xl opacity-10 select-none">"</span>}
                    </div>

                    <div className="flex items-center gap-10 pt-8 border-t border-border-arena">
                      <button
                        onClick={() => likePost({ postId: post.id || post._id, userId: user?.id || '' })}
                        className={`group/btn flex items-center gap-2.5 font-black text-[10px] tracking-widest uppercase transition-all ${post.likes.includes(user?.id) ? 'text-arena-orange' : 'opacity-40 hover:opacity-100'}`}
                      >
                        <span className={`text-xl transition-transform group-hover/btn:scale-125 ${post.likes.includes(user?.id) ? 'drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]' : ''}`}>❤️</span>
                        {post.likes.length} Reactions
                      </button>

                      <button
                        onClick={() => setActiveCommentId(activeCommentId === post.id ? null : post.id)}
                        className={`group/btn flex items-center gap-2.5 font-black text-[10px] tracking-widest uppercase transition-all ${activeCommentId === post.id ? 'text-arena-blue' : 'opacity-40 hover:opacity-100'}`}
                      >
                        <span className="text-xl transition-transform group-hover/btn:scale-125">💬</span>
                        {post.comments.length} Comms
                      </button>

                      <button className="group/btn flex items-center gap-2.5 font-black text-[10px] opacity-20 hover:opacity-60 tracking-widest uppercase transition-all ml-auto">
                        <span className="text-xl transition-transform group-hover/btn:-rotate-45">🚀</span>
                        Relay
                      </button>
                    </div>

                    {/* Interactive Comment Section */}
                    {activeCommentId === post.id && (
                      <div className="mt-10 space-y-8 animate-slide-up">
                        <div className="flex flex-col gap-4">
                          <input
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)}
                            placeholder="Add frequency analysis..."
                            className="w-full bg-foreground/[0.03] border border-border-arena rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-arena-blue/30 text-sm font-medium"
                          />
                          <p className="text-[9px] font-black opacity-20 uppercase tracking-widest ml-4">Press Enter to Broadcast</p>
                        </div>

                        <div className="space-y-6">
                          {post.comments.map((comment: any, cIdx: number) => (
                            <div key={cIdx} className="group/comm">
                              <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center font-black text-xs">{comment.username[0].toUpperCase()}</div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-black text-xs text-arena-blue">{comment.username}</span>
                                    <span className="text-[9px] font-bold opacity-20">{new Date(comment.createdAt).toLocaleTimeString()}</span>
                                  </div>
                                  <p className="text-sm font-medium opacity-80 leading-relaxed">{comment.text}</p>
                                  <button
                                    onClick={() => setReplyToId(replyToId === comment._id ? null : comment._id)}
                                    className="text-[9px] font-black uppercase tracking-widest text-arena-purple opacity-40 hover:opacity-100 mt-2 block"
                                  >
                                    Respond
                                  </button>

                                  {/* Replies Listing */}
                                  {comment.replies?.length > 0 && (
                                    <div className="mt-4 ml-4 pl-4 border-l border-border-arena space-y-4">
                                      {comment.replies.map((reply: any, rIdx: number) => (
                                        <div key={rIdx} className="flex gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center font-black text-[10px]">{reply.username[0].toUpperCase()}</div>
                                          <div>
                                            <div className="flex items-center gap-2 mb-0.5">
                                              <span className="font-black text-[10px] text-arena-purple">{reply.username}</span>
                                            </div>
                                            <p className="text-xs font-medium opacity-70">{reply.text}</p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Reply Input */}
                                  {replyToId === comment._id && (
                                    <div className="mt-4 ml-4">
                                      <input
                                        autoFocus
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddReply(post.id, comment._id)}
                                        placeholder="Transmission response..."
                                        className="w-full bg-foreground/[0.03] border border-border-arena rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-arena-purple/30 text-xs font-medium"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-10">
          <div className="glass-panel p-10 rounded-[3rem] sticky top-28">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-8 border-l-2 border-arena-blue pl-4">Elite Scout</h3>
            <div className="space-y-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-border-arena flex items-center justify-center font-black text-sm group-hover:bg-arena-blue/10 group-hover:border-arena-blue/30 transition-all">
                      W{i}
                    </div>
                    <div>
                      <p className="font-black text-sm group-hover:text-arena-blue transition-colors">WARRIOR_ALPHA_{i}</p>
                      <p className="text-[9px] font-black opacity-30 uppercase tracking-widest">Level {10 + i} • 92% Rank</p>
                    </div>
                  </div>
                  <button className="text-[9px] font-black uppercase tracking-widest py-2 px-4 rounded-xl border border-border-arena hover:bg-arena-blue hover:text-white hover:border-transparent transition-all">Join</button>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-10 border-t border-border-arena group cursor-pointer">
              <div className="bg-gradient-to-br from-arena-purple/10 to-arena-blue/10 p-8 rounded-[2rem] border border-arena-purple/20 transition-all hover:scale-[1.02]">
                <h3 className="text-xl font-black mb-3">GLOBAL RANK</h3>
                <p className="text-sm opacity-50 font-bold mb-6 leading-relaxed">Broadcast your status. Sync achievements across the network.</p>
                <Link href="/dashboard" className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-arena-purple hover:translate-x-2 transition-transform">Access Intel →</Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
