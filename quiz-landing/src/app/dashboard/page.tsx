'use client';

import { useState } from 'react';

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const mockStats = {
    totalQuizzes: 156,
    correctAnswers: 124,
    accuracy: 79.5,
    streak: 7,
    totalTime: 240,
    levelProgress: 65
  };

  const recentActivities = [
    { id: 1, quiz: '数学基礎', score: 85, date: '2024-01-15', time: '15分' },
    { id: 2, quiz: '英語文法', score: 92, date: '2024-01-14', time: '12分' },
    { id: 3, quiz: '歴史近世', score: 78, date: '2024-01-13', time: '18分' },
    { id: 4, quiz: '物理力学', score: 88, date: '2024-01-12', time: '20分' },
    { id: 5, quiz: '化学基礎', score: 95, date: '2024-01-11', time: '14分' }
  ];

  const weeklyProgress = [
    { day: '月', completed: 8, target: 10 },
    { day: '火', completed: 12, target: 10 },
    { day: '水', completed: 6, target: 10 },
    { day: '木', completed: 15, target: 10 },
    { day: '金', completed: 9, target: 10 },
    { day: '土', completed: 11, target: 10 },
    { day: '日', completed: 7, target: 10 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">QuizApp</h1>
              <span className="ml-4 text-gray-600">ダッシュボード</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-yellow-100 px-3 py-1 rounded-full">
                <span className="text-yellow-600 text-sm font-medium">🔥 {mockStats.streak}日連続</span>
              </div>
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">T</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">おかえりなさい！</h2>
          <p className="text-gray-600">今日も学習頑張りましょう。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">総クイズ数</h3>
              <span className="text-2xl">📚</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockStats.totalQuizzes}</p>
            <p className="text-sm text-green-600 mt-1">+12 今週</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">正答率</h3>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockStats.accuracy}%</p>
            <p className="text-sm text-green-600 mt-1">+2.3% 先週比</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">学習時間</h3>
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockStats.totalTime}分</p>
            <p className="text-sm text-blue-600 mt-1">今週</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">レベル進捗</h3>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{mockStats.levelProgress}%</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${mockStats.levelProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">週間進捗</h3>
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="week">今週</option>
                  <option value="month">今月</option>
                  <option value="year">今年</option>
                </select>
              </div>
              
              <div className="grid grid-cols-7 gap-4">
                {weeklyProgress.map((day, index) => (
                  <div key={index} className="text-center">
                    <div className="text-sm text-gray-600 mb-2">{day.day}</div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-24 flex items-end">
                        <div 
                          className="bg-indigo-600 rounded-full transition-all duration-500"
                          style={{ 
                            height: `${(day.completed / day.target) * 100}%`,
                            width: '100%'
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{day.completed}/{day.target}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">最近のクイズ結果</h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                        activity.score >= 90 ? 'bg-green-500' : 
                        activity.score >= 80 ? 'bg-blue-500' : 
                        activity.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {activity.score}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{activity.quiz}</h4>
                        <p className="text-sm text-gray-600">{activity.date} • {activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">スコア</div>
                      <div className="font-semibold text-gray-900">{activity.score}点</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">今日の目標</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">クイズ完了</span>
                  <span className="font-semibold">5/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">学習時間</span>
                  <span className="font-semibold">25/60分</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">おすすめクイズ</h3>
              <div className="space-y-3">
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <h4 className="font-medium text-indigo-900">数学応用</h4>
                  <p className="text-sm text-indigo-600 mt-1">前回: 78点 • 15問</p>
                  <button className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors">
                    チャレンジ
                  </button>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900">英語読解</h4>
                  <p className="text-sm text-green-600 mt-1">新着 • 20問</p>
                  <button className="mt-3 bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
                    開始
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">達成バッジ</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-xs text-gray-600">連続学習</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="text-xs text-gray-600">高正答率</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-1">⚡</div>
                  <div className="text-xs text-gray-600">スピード</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}