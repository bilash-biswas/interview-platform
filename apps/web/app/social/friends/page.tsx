"use client";

import { useState } from 'react';
import {
  useGetFriendsQuery,
  useGetPendingFriendsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation
} from '@/redux/services/socialApi';
import { useGetAllUsersQuery } from '@/redux/services/authApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import Link from 'next/link';

export default function FriendCenterPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: friends, isLoading: loadingFriends } = useGetFriendsQuery(user?.id || '', { skip: !user?.id });
  const { data: pending, isLoading: loadingPending } = useGetPendingFriendsQuery(user?.id || '', { skip: !user?.id });
  const { data: allUsers, isLoading: loadingUsers } = useGetAllUsersQuery();

  const [sendRequest] = useSendFriendRequestMutation();
  const [acceptRequest] = useAcceptFriendRequestMutation();

  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleSendRequest = async (recipientId: string, recipientName: string) => {
    if (!user || isProcessing) return;
    setIsProcessing(recipientId);
    try {
      await sendRequest({
        requester: user.id,
        requesterName: user.username,
        recipient: recipientId,
        recipientName
      }).unwrap();
      alert('Alliance request transmitted successfully.');
    } catch (err: any) {
      alert(err?.data?.error || 'Link connection failed.');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleAccept = async (requestId: string) => {
    if (isProcessing) return;
    setIsProcessing(requestId);
    try {
      await acceptRequest({ requestId }).unwrap();
      alert('Alliance confirmed. Data channels synced.');
    } catch (err: any) {
      alert(err?.data?.error || 'Authorization failed.');
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredUsers = allUsers?.filter(u => {
    if (u.id === user?.id) return false;
    const isFriend = friends?.some(f => f.requester === u.id || f.recipient === u.id);
    if (isFriend) return false;
    const isPendingReceived = pending?.some(p => p.requester === u.id);
    if (isPendingReceived) return false;
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-arena-purple/5 blur-[150px] -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <div className="inline-block px-4 py-1.5 mb-4 rounded-full border border-arena-blue/20 bg-arena-blue/5 text-arena-blue text-[10px] font-black uppercase tracking-[0.2em]">
            Personnel Network
          </div>
          <h1 className="text-5xl font-black tracking-tightest uppercase md:text-7xl">
            YOUR <span className="text-arena-blue italic">COMRADES</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="glass-panel p-10 rounded-[3rem] relative overflow-hidden group hover:border-arena-blue/50 transition-all duration-500">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-4xl group-hover:scale-110 transition-transform">👥</div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-10 border-l-2 border-arena-blue pl-4">Registry</h3>

            {loadingFriends ? (
              <div className="space-y-6 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-20 bg-foreground/5 rounded-2xl" />)}
              </div>
            ) : !friends || friends.length === 0 ? (
              <div className="py-12 text-center opacity-40 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-foreground/5 rounded-3xl">
                No personnel found in current sector.
              </div>
            ) : (
              <div className="space-y-6">
                {friends?.map((f: any) => (
                  <div key={f.id} className="group/item flex items-center justify-between p-6 bg-foreground/[0.03] rounded-[2rem] border border-border-arena hover:bg-arena-blue/5 hover:border-arena-blue/30 transition-all">
                    <div className="flex items-center gap-5">
                      <Link href={`/social/profile/${f.requester === user?.id ? f.recipient : f.requester}`} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-arena-blue/20 to-arena-blue/5 border border-arena-blue/30 flex items-center justify-center font-black text-arena-blue text-xl group-hover/item:scale-110 transition-transform">
                        {(f.requester === user?.id ? f.recipientName : f.requesterName)?.[0].toUpperCase() || 'W'}
                      </Link>
                      <div>
                        <Link href={`/social/profile/${f.requester === user?.id ? f.recipient : f.requester}`} className="font-black text-lg block group-hover/item:text-arena-blue transition-colors">
                          {f.requester === user?.id ? f.recipientName : f.requesterName}
                        </Link>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-30">Active Sector 74</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-arena-blue bg-arena-blue/10 px-4 py-2 rounded-xl border border-arena-blue/20">Uplinked</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-10 rounded-[3rem] relative overflow-hidden group hover:border-arena-purple/50 transition-all duration-500 bg-gradient-to-br from-transparent to-arena-purple/[0.02]">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-4xl group-hover:scale-110 transition-transform">📩</div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-10 border-l-2 border-arena-purple pl-4">Requests Center</h3>

            {loadingPending ? (
              <div className="space-y-6 animate-pulse">
                {[1, 2].map(i => <div key={i} className="h-20 bg-foreground/5 rounded-2xl" />)}
              </div>
            ) : !pending || pending.length === 0 ? (
              <div className="py-20 text-center opacity-30 flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-foreground/20 flex items-center justify-center text-xl">⏳</div>
                <p className="text-xs font-black uppercase tracking-widest">No pending authorizations...</p>
                <p className="text-[10px] italic font-bold max-w-[200px]">Strategic alliances are clear.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pending.map((p: any) => (
                  <div key={p.id} className="group/item flex items-center justify-between p-6 bg-foreground/[0.03] rounded-[2rem] border border-border-arena hover:bg-arena-purple/5 hover:border-arena-purple/30 transition-all">
                    <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-xl bg-arena-purple/10 border border-arena-purple/20 flex items-center justify-center font-black text-arena-purple uppercase">
                        {p.requesterName?.[0]}
                      </div>
                      <div>
                        <p className="font-black text-sm">{p.requesterName}</p>
                        <p className="text-[8px] font-bold opacity-30 uppercase">Inbound Request</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAccept(p.id)}
                      disabled={isProcessing === p.id}
                      className="px-6 py-2.5 bg-arena-purple text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-arena-purple/20"
                    >
                      {isProcessing === p.id ? 'Confirming...' : 'Authorize'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 pt-16 border-t border-border-arena">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">DISCOVER RECRUITS</h3>
            <span className="text-[9px] font-black opacity-20 uppercase tracking-widest">Global Sector Access</span>
          </div>

          {loadingUsers ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-foreground/5 rounded-[2rem]" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filteredUsers.map((u: any) => (
                <div key={u.id} className="glass-panel p-8 rounded-[2rem] text-center group hover:scale-[1.05] transition-all cursor-pointer border-transparent hover:border-arena-blue/30 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-arena-blue opacity-0 group-hover:opacity-30 transition-opacity" />
                  <Link href={`/social/profile/${u.id}`} className="w-20 h-20 rounded-2xl bg-foreground/5 mx-auto mb-6 border border-border-arena flex items-center justify-center font-black text-2xl group-hover:bg-arena-blue/10 transition-all">
                    {u.username?.[0]?.toUpperCase()}
                  </Link>
                  <Link href={`/social/profile/${u.id}`} className="font-black text-sm mb-1 group-hover:text-arena-blue transition-colors uppercase tracking-tight block">{u.username}</Link>
                  <p className="text-[9px] font-black opacity-20 uppercase tracking-widest mb-6 px-2 truncate">{u.email}</p>
                  <button
                    disabled={isProcessing === u.id}
                    onClick={() => handleSendRequest(u.id, u.username)}
                    className="w-full py-3 bg-foreground text-background text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-arena-blue hover:text-white transition-all shadow-lg shadow-foreground/5 disabled:opacity-50"
                  >
                    {isProcessing === u.id ? 'Linking...' : 'Initiate Link'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
