'use client';

import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface WorkoutFormProps {
  onSuccess?: () => void;
}

export default function WorkoutForm({ onSuccess }: WorkoutFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    exercise: '',
    sets: '',
    reps: '',
    weight: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!user) {
      setError('ログインが必要です');
      setIsLoading(false);
      return;
    }

    if (!formData.exercise || !formData.sets || !formData.reps) {
      setError('種目、セット数、回数は必須です');
      setIsLoading(false);
      return;
    }

    try {
      await addDoc(collection(db, 'workouts'), {
        userId: user.uid,
        exercise: formData.exercise,
        sets: parseInt(formData.sets),
        reps: parseInt(formData.reps),
        weight: formData.weight ? parseInt(formData.weight) : null,
        notes: formData.notes,
        timestamp: Timestamp.now(),
        createdAt: new Date(),
      });

      // フォームをリセット
      setFormData({
        exercise: '',
        sets: '',
        reps: '',
        weight: '',
        notes: '',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error('Error adding workout:', err);
      setError('ワークアウトの保存に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">ワークアウトを記録</h2>

      {error && (
        <div className="mb-4 rounded bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="exercise" className="block text-sm font-medium text-gray-700">
            種目
          </label>
          <input
            type="text"
            id="exercise"
            name="exercise"
            value={formData.exercise}
            onChange={handleChange}
            placeholder="例：ベンチプレス"
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="sets" className="block text-sm font-medium text-gray-700">
              セット数
            </label>
            <input
              type="number"
              id="sets"
              name="sets"
              value={formData.sets}
              onChange={handleChange}
              min="1"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="reps" className="block text-sm font-medium text-gray-700">
              回数
            </label>
            <input
              type="number"
              id="reps"
              name="reps"
              value={formData.reps}
              onChange={handleChange}
              min="1"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
              重量 (kg)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              step="0.5"
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            メモ
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="その他の詳細情報..."
            rows={3}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {isLoading ? '保存中...' : '記録する'}
        </button>
      </form>
    </div>
  );
}
