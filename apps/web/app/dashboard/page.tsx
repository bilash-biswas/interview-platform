'use client';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, isInitialized } = useSelector((state: RootState) => state.auth);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return null; 
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-140px)] bg-gray-50 text-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Welcome, {user?.username}!
        </h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-blue-600">Text Chat</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Simple text-only communication for quick discussions.
            </p>
            <Link 
              href="/chat" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Start Chat
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-indigo-600">Video Call</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Video and audio communication with integrated chat.
            </p>
            <Link 
              href="/video" 
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
            >
              Join Video
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-2 text-green-600">Interview Room</h2>
            <p className="text-gray-600 mb-4 text-sm">
              The full experience: Code editor, video, and chat.
            </p>
            <Link 
              href="/interview" 
              className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
            >
              Enter Room
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
