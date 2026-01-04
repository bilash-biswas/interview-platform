'use client';

import React, { useState } from 'react';
import { useAnalyzeTextMutation, useReviewCodeMutation } from '../../redux/services/aiApi';

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<'text' | 'code'>('text');
  const [text, setText] = useState('');
  const [code, setCode] = useState('');

  const [analyzeText, { data: textResult, isLoading: isTextLoading, error: textError }] = useAnalyzeTextMutation();
  const [reviewCode, { data: codeResult, isLoading: isCodeLoading, error: codeError }] = useReviewCodeMutation();

  const handleAnalyze = async () => {
    if (activeTab === 'text') {
      if (!text.trim()) return;
      await analyzeText({ text }).unwrap().catch(err => console.error(err));
    } else {
      if (!code.trim()) return;
      await reviewCode({ code }).unwrap().catch(err => console.error(err));
    }
  };

  const isLoading = isTextLoading || isCodeLoading;
  const error = activeTab === 'text' ? textError : codeError;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-2">AI Intelligence Hub</h2>
          <p className="text-center text-gray-500 text-sm">Powered by Python Microservices</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'text' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('text')}
          >
            Text Analysis
          </button>
          <button
            className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'code' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('code')}
          >
            AI Code Reviewer
          </button>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mt-4">
          <label htmlFor="ai-input" className="block text-sm font-medium text-gray-700 mb-2">
            {activeTab === 'text' ? 'Enter text to analyze' : 'Paste Python code for review'}
          </label>
          <textarea
            id="ai-input"
            rows={8}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 block w-full sm:text-sm border-gray-300 rounded-md p-3 font-mono"
            placeholder={activeTab === 'text' ? "Type something here..." : "def my_function():\n    print('Hello World')"}
            value={activeTab === 'text' ? text : code}
            onChange={(e) => activeTab === 'text' ? setText(e.target.value) : setCode(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAnalyze}
              disabled={isLoading || (activeTab === 'text' ? !text.trim() : !code.trim())}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : (activeTab === 'text' ? 'Analyze Text' : 'Review Code')}
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">Service Error: Unable to complete request.</p>
          </div>
        )}

        {/* Text Analysis Results */}
        {activeTab === 'text' && textResult && (
          <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-100 animate-fade-in-up">
            <h3 className="text-lg leading-6 font-medium text-gray-900 border-b border-indigo-200 pb-3 mb-4">Sentiment Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sentiment</span>
                <div className="mt-2 text-2xl font-bold text-indigo-700">{textResult.analysis.sentiment}</div>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Confidence</span>
                <div className="mt-2 text-2xl font-bold text-gray-900">{Math.round(textResult.analysis.confidence * 100)}%</div>
              </div>
              <div className="bg-white p-5 rounded-lg shadow-sm md:col-span-2">
                <p className="text-gray-700">{textResult.analysis.summary}</p>
              </div>
            </div>
          </div>
        )}

        {/* Code Review Results */}
        {activeTab === 'code' && codeResult && (
          <div className="mt-8 bg-gray-900 rounded-xl p-6 border border-gray-700 animate-fade-in-up text-gray-100">
            <h3 className="text-lg leading-6 font-medium text-white border-b border-gray-700 pb-3 mb-4">Code Analysis Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <span className="text-xs font-semibold text-gray-400 uppercase">Functions</span>
                <div className="mt-1 text-2xl font-bold text-blue-400">{codeResult.analysis.function_count}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <span className="text-xs font-semibold text-gray-400 uppercase">Classes</span>
                <div className="mt-1 text-2xl font-bold text-purple-400">{codeResult.analysis.class_count}</div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <span className="text-xs font-semibold text-gray-400 uppercase">Complexity Warning</span>
                <div className={`mt-1 text-2xl font-bold ${codeResult.analysis.complexity_warning ? 'text-red-500' : 'text-green-500'}`}>
                  {codeResult.analysis.complexity_warning ? 'DETECTED' : 'NONE'}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Imports</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {codeResult.analysis.imports.length > 0 ? codeResult.analysis.imports.map((imp, i) => (
                  <span key={i} className="px-2 py-1 bg-gray-700 rounded text-sm font-mono text-yellow-300">{imp}</span>
                )) : <span className="text-gray-500 text-sm italic">No imports detected</span>}
              </div>
            </div>

            {codeResult.analysis.suggestions.length > 0 && (
              <div className="mt-6 bg-gray-800 p-5 rounded-lg border border-gray-700">
                <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">Suggestions</span>
                <ul className="mt-3 space-y-2 list-disc list-inside text-gray-300">
                  {codeResult.analysis.suggestions.map((sugg, i) => (
                    <li key={i}>{sugg}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
