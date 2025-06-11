'use client';

import Image from "next/image";
import { ThemeToggle } from '../components/ThemeToggle';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <nav className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">QuizApp</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                ログイン
              </button>
              <button className="border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 px-4 py-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900 transition-colors">
                登録
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            楽しく学べる
            <span className="text-indigo-600 dark:text-indigo-400 block">学習支援クイズ</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            あなたの学習をサポートする革新的なクイズプラットフォーム。
            ゲーム感覚で知識を身につけ、効率的な学習体験を提供します。
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button className="bg-indigo-600 text-white text-lg px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
              今すぐ始める
            </button>
            <button className="border-2 border-indigo-600 text-indigo-600 text-lg px-8 py-4 rounded-lg hover:bg-indigo-50 transition-colors">
              デモを見る
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-indigo-600 dark:text-indigo-400 text-xl">📚</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-indigo-800 dark:text-indigo-300">豊富な問題</h3>
            <p className="text-gray-600 dark:text-gray-300">
              様々な分野の問題を用意。基礎から応用まで幅広くカバーし、段階的な学習が可能です。
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-indigo-600 dark:text-indigo-400 text-xl">🏆</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-indigo-800 dark:text-indigo-300">進捗管理</h3>
            <p className="text-gray-600 dark:text-gray-300">
              学習の進捗を可視化し、達成度を追跡。モチベーション維持をサポートします。
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
              <span className="text-indigo-600 dark:text-indigo-400 text-xl">🎮</span>
            </div>
            <h3 className="text-xl font-semibold mb-4 text-indigo-800 dark:text-indigo-300">ゲーム要素</h3>
            <p className="text-gray-600 dark:text-gray-300">
              ポイント制度やバッジ機能で楽しく学習。競争要素も取り入れて継続をサポート。
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            学習効果を最大化
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            科学的な学習理論に基づいたクイズシステムで、記憶定着率を向上させます。
            個人の学習ペースに合わせてカスタマイズされた体験を提供。
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">✓</span>
              適応型学習システム
            </div>
            <div className="flex items-center">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">✓</span>
              詳細な解説付き
            </div>
            <div className="flex items-center">
              <span className="text-indigo-600 dark:text-indigo-400 mr-2">✓</span>
              復習スケジュール管理
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">QuizApp</h3>
              <p className="text-gray-400">
                学習をもっと楽しく、もっと効果的に。
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">機能</h4>
              <ul className="space-y-2 text-gray-400">
                <li>クイズ機能</li>
                <li>進捗追跡</li>
                <li>成績分析</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">サポート</h4>
              <ul className="space-y-2 text-gray-400">
                <li>ヘルプセンター</li>
                <li>お問い合わせ</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">会社</h4>
              <ul className="space-y-2 text-gray-400">
                <li>会社概要</li>
                <li>プライバシー</li>
                <li>利用規約</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 QuizApp. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
