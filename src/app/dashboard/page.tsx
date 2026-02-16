'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from '@/lib/firebase';
import WorkoutForm from '@/components/WorkoutForm';
import WorkoutList from '@/components/WorkoutList';
import ChatBot from '@/components/ChatBot';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleFormSuccess = () => {
    // ワークアウトリストを更新
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="mt-4 text-gray-600">ロード中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              💪 Workout Tracker
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {user.displayName || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Form and List */}
          <div className="lg:col-span-2 space-y-6">
            <WorkoutForm onSuccess={handleFormSuccess} key={refreshKey} />
            <WorkoutList key={refreshKey} />
          </div>

          {/* Right Column: ChatBot */}
          <div className="lg:col-span-1">
            <ChatBot />
          </div>
        </div>
      </main>
    </div>
  );
}
