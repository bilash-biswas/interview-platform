'use client';
import { useState } from 'react';
import api from '../redux/services/api';

export default function CodeEditor() {
  const [code, setCode] = useState('// Write your javascript code here\nconsole.log("Hello World");');
  const [output, setOutput] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const runCode = async () => {
    setLoading(true);
    setLogs([]);
    setOutput('');
    try {
      const { data } = await api.post('/code/execute', { code, language: 'javascript' });
      setOutput(JSON.stringify(data.result));
      setLogs(data.logs || []);
    } catch (err: any) {
      setOutput('Error: ' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white p-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Code Editor</h3>
        <button 
            onClick={runCode} 
            disabled={loading}
            className={`px-4 py-1 rounded ${loading ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'}`}
        >
            {loading ? 'Running...' : 'Run'}
        </button>
      </div>
      <textarea
        className="flex-1 w-full bg-gray-900 font-mono p-2 resize-none focus:outline-none border border-gray-700 rounded"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
      />
      <div className="h-1/3 bg-black mt-2 p-2 font-mono overflow-auto border-t border-gray-700">
        <div className="text-gray-400 text-sm">Output:</div>
        <div className="text-green-400">{output}</div>
        {logs.length > 0 && <div className="text-yellow-400 mt-2">Logs:</div>}
        {logs.map((log, i) => <div key={i} className="text-gray-300">{log}</div>)}
      </div>
    </div>
  );
}
