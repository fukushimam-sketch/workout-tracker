'use client';

import React, { useState, useRef, useEffect } from 'react';
import { generateWorkoutAdvice } from '@/lib/gemini';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatBot() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !user) return;

    setError('');
    const userMessage = inputValue;
    setInputValue('');

    // ユーザーのメッセージをチャットに追加
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setIsLoading(true);

    try {
      // 最近のワークアウト履歴をコンテキストとして送信
      const workoutHistory = 'ユーザーが定期的にワークアウトを記録しています。';

      const response = await generateWorkoutAdvice(userMessage, workoutHistory);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error('ChatBot error:', err);
      setError('メッセージの送信に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[500px] flex-col rounded-lg bg-white shadow-md">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-bold text-gray-900">💪 筋トレコーチ AI</h2>
        <p className="text-sm text-gray-600">筋トレについて何でも聞いてください！</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="text-gray-500">何か質問してみてください！</p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs rounded-lg px-4 py-2 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center justify-center w-4 h-4 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                <p className="text-sm text-gray-600">入力中...</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded bg-red-100 p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="質問を入力..."
            disabled={isLoading}
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:bg-gray-400"
          >
            送信
          </button>
        </div>
      </form>
    </div>
  );
}
