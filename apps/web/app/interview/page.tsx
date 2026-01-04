'use client';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { initSocket } from '../../redux/services/socket';
import { addMessage, setRoom } from '../../redux/features/chatSlice';
import { useRouter } from 'next/navigation';
import VideoChat from '../../components/VideoChat';
import CodeEditor from '../../components/CodeEditor';

export default function InterviewPage() {
  const { user, token, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const { messages, currentRoom } = useSelector((state: RootState) => state.chat);
  const [inputText, setInputText] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const dispatch = useDispatch();
  const router = useRouter();
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || !token) {
      router.push('/login');
      return;
    }

    const s = initSocket(token);
    setSocket(s);

    s.on('connect', () => {
      console.log('Connected to socket');
    });

    s.on('receive_message', (msg: any) => {
      dispatch(addMessage(msg));
    });

    return () => {
      s.disconnect();
    };
  }, [isAuthenticated, token, router, dispatch]);

  const joinRoom = () => {
      if (socket && roomIdInput) {
          socket.emit('join_room', roomIdInput);
          dispatch(setRoom(roomIdInput));
      }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && currentRoom && inputText && user) {
      const msg = {
        content: inputText,
        roomId: currentRoom,
        senderId: user.id || 'unknown',
      };
      socket.emit('send_message', msg);
      setInputText('');
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-screen bg-gray-100 text-black">
      {/* Left: Chat & Video */}
      <div className="w-1/3 flex flex-col border-r border-gray-300">
          <header className="bg-gray-800 text-white p-4">
            <h1 className="text-xl">Interview Room: {currentRoom}</h1>
            <div className="text-sm text-gray-400">User: {user?.username}</div>
          </header>
          
          {currentRoom && <VideoChat roomId={currentRoom} />}

          {!currentRoom ? (
             <div className="flex-1 flex items-center justify-center p-4">
                 <div className="w-full">
                     <h2 className="text-xl mb-4">Join Interview</h2>
                     <div className="flex gap-2">
                        <input 
                            value={roomIdInput}
                            onChange={(e) => setRoomIdInput(e.target.value)}
                            className="border p-2 flex-1 rounded"
                            placeholder="Room ID"
                        />
                        <button onClick={joinRoom} className="bg-blue-500 text-white p-2 rounded">Join</button>
                     </div>
                 </div>
             </div>
          ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`p-2 rounded max-w-[80%] break-words ${msg.senderId === user?.id ? 'bg-blue-500 text-white ml-auto' : 'bg-white text-black'}`}>
                            <div className="text-xs opacity-75">{msg.senderId}</div>
                            <div>{msg.content}</div>
                        </div>
                    ))}
                </div>
                <form onSubmit={sendMessage} className="p-4 bg-gray-200 flex gap-2">
                    <input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 border p-2 rounded border-gray-400 focus:outline-none focus:border-blue-500"
                        placeholder="Type a message..."
                    />
                    <button type="submit" className="bg-green-600 text-white px-4 rounded hover:bg-green-700">Send</button>
                </form>
              </div>
          )}
      </div>

      {/* Right: Code Editor */}
      <div className="flex-1 flex flex-col">
         <CodeEditor />
      </div>
    </div>
  );
}
