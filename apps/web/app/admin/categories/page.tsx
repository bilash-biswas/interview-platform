'use client';

import React, { useState } from 'react';
import { 
  useGetCategoriesQuery, 
  useAddCategoryMutation, 
  useUpdateCategoryMutation, 
  useDeleteCategoryMutation 
} from '@/redux/services/quizApi';

export default function CategoryManager() {
  const { data: categories, isLoading } = useGetCategoriesQuery();
  const [addCategory] = useAddCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [form, setForm] = useState({ name: '', description: '', icon: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateCategory({ id: editingId, category: form });
      setEditingId(null);
    } else {
      await addCategory(form);
    }
    setForm({ name: '', description: '', icon: '' });
  };

  const handleEdit = (cat: any) => {
    setForm({ name: cat.name, description: cat.description, icon: cat.icon || '' });
    setEditingId(cat.id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Category Management</h1>

      <form onSubmit={handleSubmit} className="bg-gray-900/50 p-6 rounded-xl border border-blue-500/20 mb-12">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Category' : 'Add New Category'}</h2>
        <div className="grid grid-cols-1 gap-4">
          <input
            type="text"
            placeholder="Category Name"
            className="bg-black border border-gray-700 p-2 rounded"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <textarea
            placeholder="Description"
            className="bg-black border border-gray-700 p-2 rounded h-24"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Icon URL (Optional)"
            className="bg-black border border-gray-700 p-2 rounded"
            value={form.icon}
            onChange={(e) => setForm({ ...form, icon: e.target.value })}
          />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded font-bold transition">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setForm({ name: '', description: '', icon: '' }); }}
                className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded font-bold transition"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories?.map((cat) => (
          <div key={cat.id} className="bg-gray-900 border border-gray-800 p-4 rounded-lg flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-blue-400">{cat.name}</h3>
              <p className="text-sm text-gray-400 mt-1">{cat.description}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(cat)} className="text-blue-500 hover:text-blue-400 text-sm">Edit</button>
              <button onClick={() => deleteCategory(cat.id)} className="text-red-500 hover:text-red-400 text-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
