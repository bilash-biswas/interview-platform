'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCategoriesQuery } from '@/redux/services/quizApi';
import { useCreateExamMutation } from '@/redux/services/examApi';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function CreateExamPage() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: categories, isLoading: loadingCats } = useGetCategoriesQuery();
  const [createExam, { isLoading: isCreating }] = useCreateExamMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    questionCount: 10,
    startTime: '',
    totalTime: 60,
    negativeMarkingValue: 0.25,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please login first');

    try {
      await createExam({
        ...formData,
        creatorId: user.id
      }).unwrap();
      router.push('/exams');
    } catch (err) {
      alert('Failed to create exam');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto bg-gray-900/50 backdrop-blur-md p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <h1 className="text-4xl font-black mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          CREATE ELITE EXAM
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Exam Title</label>
            <input
              type="text"
              required
              className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="e.g. Master Backend Engineering"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
            <textarea
              className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all min-h-[100px]"
              placeholder="Enter exam instructions and details..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Category</label>
              <select
                required
                className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Number of Questions</label>
              <input
                type="number"
                required
                min="1"
                className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={formData.questionCount}
                onChange={e => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
  <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
    Start Time
  </label>

  <input
    type="datetime-local"
    required
    min={new Date().toISOString().slice(0, 16)}
    className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 
               focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
    value={formData.startTime}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        startTime: e.target.value
      }))
    }
  />
</div>

            <div>
              <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Duration (Minutes)</label>
              <input
                type="number"
                required
                min="1"
                className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                value={formData.totalTime}
                onChange={e => setFormData({ ...formData, totalTime: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Negative Marking (0 - 1)</label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              required
              className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-pink-500 font-bold"
              value={formData.negativeMarkingValue}
              onChange={e => setFormData({ ...formData, negativeMarkingValue: parseFloat(e.target.value) })}
            />
            <p className="mt-2 text-xs text-gray-500 italic">Deducted per incorrect answer. Standard is 0.25.</p>
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-purple-500/20 disabled:opacity-50"
          >
            {isCreating ? 'GENERATING EXAM...' : 'LAUNCH EXAM'}
          </button>
        </form>
      </div>
    </div>
  );
}
