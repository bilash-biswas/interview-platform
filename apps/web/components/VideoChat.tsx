'use client';
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getSocket } from '../redux/services/socket';

export default function VideoChat({ roomId }: { roomId: string }) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const socket = getSocket();
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { roomId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    });

    setPeerConnection(pc);

    socket.on('offer', async (data: any) => {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('answer', { roomId, answer });
    });

    socket.on('answer', async (data: any) => {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.on('ice-candidate', async (data: any) => {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    return () => {
      pc.close();
    };
  }, [roomId]);

  const startCall = async () => {
    if (peerConnection) {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        const socket = getSocket();
        socket.emit('offer', { roomId, offer });
    }
  };

  return (
    <div className="flex flex-col bg-gray-900 p-4 rounded text-white">
      <h3 className="mb-2">Video Chat</h3>
      <div className="flex gap-2">
        <video ref={localVideoRef} autoPlay playsInline muted className="w-1/2 bg-black rounded" />
        <video ref={remoteVideoRef} autoPlay playsInline className="w-1/2 bg-black rounded" />
      </div>
      <button onClick={startCall} className="mt-2 bg-blue-600 p-2 rounded">Start Call</button>
    </div>
  );
}
