'use client';

import React, { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

interface Workout {
  id: string;
  exercise: string;
  sets: number;
  reps: number;
  weight: number | null;
  notes: string;
  createdAt: any;
}

export default function WorkoutList() {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'workouts'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const workoutList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Workout[];
        setWorkouts(workoutList);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('ワークアウト情報の取得に失敗しました');
      setIsLoading(false);
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="inline-flex items-center justify-center w-8 h-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded bg-red-100 p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="rounded-lg bg-white p-8 text-center shadow-md">
        <p className="text-gray-600">まだワークアウトが記録されていません。</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow-md overflow-hidden">
      <h2 className="px-6 pt-6 pb-4 text-2xl font-bold text-gray-900">ワークアウト履歴</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-t border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">種目</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">セット × 回数</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">重量</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">日付</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {workouts.map(workout => (
              <tr key={workout.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {workout.exercise}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {workout.sets} × {workout.reps}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {workout.weight ? `${workout.weight}kg` : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {workout.createdAt?.toDate ? workout.createdAt.toDate().toLocaleDateString('ja-JP') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {workouts.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
          全 {workouts.length} 件
        </div>
      )}
    </div>
  );
}
