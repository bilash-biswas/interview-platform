'use client';
import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { initSocket, getSocket } from '../../redux/services/socket';
import { addMessage, setRoom, setMessages } from '../../redux/features/chatSlice';
import { useGetChatHistoryQuery, useGetConversationsQuery, useMarkAsReadMutation } from '../../redux/services/chatApi';
import { useGetFriendsQuery } from '../../redux/services/socialApi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ChatPage() {
  const { user, token, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const { messages, currentRoom, onlineUsers } = useSelector((state: RootState) => state.chat);
  const [inputText, setInputText] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<any>(null);

  // Get active conversations & friends
  const { data: conversations, refetch: refetchConversations } = useGetConversationsQuery(user?.id || '', { skip: !user?.id });
  const { data: friends } = useGetFriendsQuery(user?.id || '', { skip: !user?.id });

  // Get message history for current room
  const { data: history, isFetching: loadingHistory } = useGetChatHistoryQuery(currentRoom || '', {
    skip: !currentRoom,
    refetchOnMountOrArgChange: true
  });

  useEffect(() => {
    if (history) {
      dispatch(setMessages(history));
    }
  }, [history, dispatch]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    const s = initSocket(token);
    setSocket(s);

    s.on('connect', () => {
      console.log('Socket connected, re-joining room if active:', currentRoom);
      if (currentRoom) {
        s.emit('join_room', currentRoom);
      }
    });

    s.on('receive_message', (msg: any) => {
      dispatch(addMessage(msg));
      refetchConversations();
    });

    return () => {
      s.disconnect();
    };
  }, [isAuthenticated, token, router, dispatch, isInitialized, refetchConversations, currentRoom]);

  // Handle room changes for an already connected socket
  useEffect(() => {
    if (socket && currentRoom) {
      socket.emit('join_room', currentRoom);
    }
  }, [socket, currentRoom]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const selectConversation = (otherUser: any) => {
    const roomId = [user?.id, otherUser.id || otherUser._id].sort().join('_');
    dispatch(setRoom(roomId));
    if (socket) {
      socket.emit('join_room', roomId);
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && currentRoom && inputText.trim() && user) {
      // Determine recipientId from roomId
      const recipientId = currentRoom.split('_').find(id => id !== user.id);

      const msg = {
        content: inputText,
        roomId: currentRoom,
        senderId: user.id,
        senderName: user.username,
        recipientId
      };
      socket.emit('send_message', msg);
      setInputText('');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-full h-full bg-arena-blue/5 blur-[150px] -z-10 pointer-events-none" />
      <div className="arena-scanline" />

      {/* Sidebar: Conversations */}
      <aside className="w-80 border-r border-border-arena flex flex-col glass-panel m-4 rounded-[2.5rem] overflow-hidden">
        <div className="p-8 border-b border-border-arena bg-foreground/[0.02]">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] opacity-40 mb-1">Tactical Comms</h2>
          <h1 className="text-xl font-black uppercase tracking-tight">Active Channels</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {conversations?.map((conv: any) => {
            const otherName = conv.lastMessage.senderId === user?.id ? conv.lastMessage.recipientName || 'Ally' : conv.lastMessage.senderName;
            const isSelected = currentRoom === conv._id;
            return (
              <button
                key={conv._id}
                onClick={() => selectConversation({ id: conv.lastMessage.senderId === user?.id ? conv.lastMessage.recipientId : conv.lastMessage.senderId })}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${isSelected ? 'bg-arena-blue/10 border border-arena-blue/30' : 'hover:bg-foreground/5 border border-transparent'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${isSelected ? 'bg-arena-blue text-black' : 'bg-foreground/10 text-arena-blue'}`}>
                  {otherName?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className={`font-black text-sm uppercase tracking-tight truncate ${isSelected ? 'text-arena-blue' : ''}`}>{otherName}</p>
                  <p className="text-[10px] opacity-40 truncate font-bold uppercase tracking-widest">{conv.lastMessage.content}</p>
                </div>
              </button>
            );
          })}

          <div className="mt-8 pt-8 border-t border-border-arena px-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-20 mb-4">Personnel Registry</h3>
            {friends?.map((friend: any) => {
              const friendData = friend.requester === user?.id ? { id: friend.recipient, name: friend.recipientName } : { id: friend.requester, name: friend.requesterName };
              return (
                <button
                  key={friend.id}
                  onClick={() => selectConversation(friendData)}
                  className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-foreground/5 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-foreground/5 border border-border-arena flex items-center justify-center text-[10px] font-black group-hover:border-arena-blue/30 transition-all">
                    {friendData.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 group-hover:text-arena-blue transition-all">{friendData.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col m-4 ml-0 glass-panel rounded-[2.5rem] overflow-hidden relative">
        {!currentRoom ? (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
            <div className="w-32 h-32 rounded-full bg-arena-blue/5 border-2 border-dashed border-arena-blue/20 flex items-center justify-center mb-8 animate-pulse">
              <span className="text-5xl">📡</span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-[0.4em] mb-4 text-arena-blue">Establishing Uplink</h2>
            <p className="max-w-sm text-xs opacity-30 font-bold uppercase tracking-widest leading-relaxed">
              Select a peer from the registry to initiate an end-to-end encrypted tactical datastream.
            </p>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <header className="p-6 border-b border-border-arena flex items-center justify-between bg-foreground/[0.01]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-arena-blue text-black flex items-center justify-center font-black">
                  {currentRoom.split('_').find(id => id !== user?.id)?.[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-sm">Target ID: {currentRoom.slice(-8)}</h3>
                  <p className="text-[9px] font-black text-success uppercase tracking-[0.2em] animate-pulse">Secure Link Active</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-2 rounded-lg bg-arena-purple/10 border border-arena-purple/20 text-arena-purple text-[9px] font-black uppercase tracking-widest">
                  Sector Auth
                </div>
              </div>
            </header>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-6 custom-scrollbar">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-full gap-4 text-arena-blue opacity-50 font-black tracking-widest uppercase text-xs">
                  <div className="w-4 h-4 rounded-full border-2 border-t-transparent border-arena-blue animate-spin" />
                  Decrypting Archive...
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10">
                  <div className="text-6xl mb-6">🛰️</div>
                  <p className="font-black uppercase tracking-[0.5em] text-sm">Clear Channel</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id || idx} className={`flex flex-col ${isMine ? 'items-end' : 'items-start animate-slide-up'}`}>
                      <div className={`group relative max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl text-sm font-bold leading-relaxed shadow-2xl ${isMine
                          ? 'bg-arena-blue text-black rounded-tr-none shadow-arena-blue/20'
                          : 'glass-panel border-border-arena text-foreground rounded-tl-none border-l-4 border-l-arena-purple'
                          }`}>
                          {msg.content}
                        </div>
                        <p className={`text-[8px] font-black uppercase mt-2 opacity-30 tracking-widest ${isMine ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-8 border-t border-border-arena bg-foreground/[0.02]">
              <div className="flex gap-4 p-2 glass-panel rounded-3xl border-arena-blue/20 focus-within:border-arena-blue/50 transition-all">
                <input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1 bg-transparent border-none px-6 py-4 focus:outline-none font-bold placeholder:opacity-20 text-sm"
                  placeholder="Input tactical transmission..."
                />
                <button type="submit" className="w-14 h-14 bg-arena-blue text-black rounded-2xl flex items-center justify-center text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-arena-blue/20">
                  📡
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
