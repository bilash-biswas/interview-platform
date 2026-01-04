'use client';

import React, { useState } from 'react';
import { 
  useGetQuestionsQuery, 
  useAddQuestionMutation, 
  useUpdateQuestionMutation, 
  useDeleteQuestionMutation,
  useGetCategoriesQuery
} from '@/redux/services/quizApi';

export default function QuestionManager() {
  const { data: questions, isLoading } = useGetQuestionsQuery();
  const { data: categories } = useGetCategoriesQuery();
  const [addQuestion] = useAddQuestionMutation();
  const [updateQuestion] = useUpdateQuestionMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();

  const [form, setForm] = useState({
    text: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    category: '',
    difficulty: 'medium'
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateQuestion({ id: editingId, question: form });
      setEditingId(null);
    } else {
      await addQuestion(form);
    }
    setForm({
      text: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      category: '',
      difficulty: 'medium'
    });
  };

  const handleEdit = (q: any) => {
    setForm({
      text: q.text,
      options: [...q.options],
      correctOptionIndex: q.correctOptionIndex,
      category: q.category,
      difficulty: q.difficulty || 'medium'
    });
    setEditingId(q.id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Question Management</h1>

      <form onSubmit={handleSubmit} className="bg-gray-900/50 p-6 rounded-xl border border-purple-500/20 mb-12">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Question' : 'Add New Question'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <textarea
              placeholder="Question Text"
              className="w-full bg-black border border-gray-700 p-3 rounded h-20"
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              required
            />
          </div>
          
          {form.options.map((opt, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="radio"
                name="correct"
                checked={form.correctOptionIndex === i}
                onChange={() => setForm({ ...form, correctOptionIndex: i })}
              />
              <input
                type="text"
                placeholder={`Option ${i + 1}`}
                className="w-full bg-black border border-gray-700 p-2 rounded"
                value={opt}
                onChange={(e) => {
                  const newOpts = [...form.options];
                  newOpts[i] = e.target.value;
                  setForm({ ...form, options: newOpts });
                }}
                required
              />
            </div>
          ))}

          <select
            className="bg-black border border-gray-700 p-2 rounded"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {Array.isArray(categories) && categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            className="bg-black border border-gray-700 p-2 rounded"
            value={form.difficulty}
            onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 px-8 py-2 rounded font-bold transition">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setForm({ text: '', options: ['', '', '', ''], correctOptionIndex: 0, category: '', difficulty: 'medium' }); }}
                className="bg-gray-700 hover:bg-gray-600 px-8 py-2 rounded font-bold transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {Array.isArray(questions) && questions.map((q) => (
          <div key={q.id} className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex justify-between items-center">
            <div className="flex-1">
              <div className="flex gap-2 mb-1 text-xs">
                <span className="bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded">{q.category}</span>
                <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded capitalize">{q.difficulty}</span>
              </div>
              <p className="text-gray-200">{q.text}</p>
            </div>
            <div className="flex gap-4 ml-8 whitespace-nowrap">
              <button onClick={() => handleEdit(q)} className="text-blue-500 hover:text-blue-400">Edit</button>
              <button onClick={() => deleteQuestion(q.id)} className="text-red-500 hover:text-red-400">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
