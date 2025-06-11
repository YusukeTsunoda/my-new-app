import { useState, useEffect } from 'react';
import Head from 'next/head';
import { ThemeToggle } from '../quiz-landing/src/components/ThemeToggle';

export default function Dashboard() {
  const [progressData, setProgressData] = useState({
    totalQuizzes: 12,
    completedQuizzes: 8,
    currentStreak: 5,
    totalPoints: 850
  });

  const [recentScores, setRecentScores] = useState([
    { subject: '数学', score: 85, date: '2024-01-15' },
    { subject: '英語', score: 92, date: '2024-01-14' },
    { subject: '理科', score: 78, date: '2024-01-13' },
    { subject: '社会', score: 88, date: '2024-01-12' },
    { subject: '国語', score: 94, date: '2024-01-11' }
  ]);

  const progressPercentage = (progressData.completedQuizzes / progressData.totalQuizzes) * 100;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Head>
        <title>学習ダッシュボード - クイズアプリ</title>
        <meta name="description" content="学習進捗と成績を確認" />
      </Head>

      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">学習ダッシュボード</h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">今日も頑張りましょう！</p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 学習進捗セクション */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">完了クイズ</h3>
            <p className="text-2xl font-bold text-blue-600">
              {progressData.completedQuizzes}/{progressData.totalQuizzes}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">連続学習日数</h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{progressData.currentStreak}日</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">素晴らしい継続力！</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">総獲得ポイント</h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{progressData.totalPoints}pt</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">次の目標まで150pt</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">平均スコア</h3>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">87%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">先週より+3%</p>
          </div>
        </div>

        {/* 最近の成績セクション */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">最近の成績</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentScores.map((score, index) => (
                <div key={index} className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">{score.subject[0]}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{score.subject}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{score.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-2xl font-bold ${
                      score.score >= 90 ? 'text-green-600' : 
                      score.score >= 80 ? 'text-blue-600' : 
                      score.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {score.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            新しいクイズを始める
          </button>
          <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            学習履歴を見る
          </button>
          <button className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            設定
          </button>
        </div>
      </main>

      <style jsx>{`
        .min-h-screen {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
}