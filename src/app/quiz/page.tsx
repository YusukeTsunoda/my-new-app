'use client'

import { useState } from 'react'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
}

const mockQuestions: Question[] = [
  {
    id: 1,
    question: "JavaScriptで変数を宣言するキーワードはどれですか？",
    options: ["var", "let", "const", "上記すべて"],
    correctAnswer: 3
  },
  {
    id: 2,
    question: "Reactのフックの中で、状態管理に使用するものはどれですか？",
    options: ["useEffect", "useState", "useContext", "useReducer"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "Next.jsでページルーティングを行う方法は？",
    options: ["React Router", "ファイルベースルーティング", "Vue Router", "Express Router"],
    correctAnswer: 1
  }
]

export default function QuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [answers, setAnswers] = useState<number[]>([])

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswer(optionIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return

    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (selectedAnswer === mockQuestions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }

    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
    } else {
      setShowResult(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResult(false)
    setAnswers([])
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
            クイズ結果
          </h1>
          <div className="text-center">
            <div className="text-6xl font-bold text-green-500 mb-4">
              {score}/{mockQuestions.length}
            </div>
            <p className="text-xl mb-6">
              正解率: {Math.round((score / mockQuestions.length) * 100)}%
            </p>
            <button
              onClick={resetQuiz}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              もう一度挑戦する
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-blue-600">学習支援クイズ</h1>
            <span className="text-gray-600">
              {currentQuestion + 1} / {mockQuestions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%`
              }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">
            {mockQuestions[currentQuestion].question}
          </h2>
          
          <div className="space-y-3">
            {mockQuestions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            スコア: {score} / {currentQuestion}
          </div>
          <button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null}
            className={`font-bold py-3 px-6 rounded-lg transition-colors ${
              selectedAnswer === null
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {currentQuestion === mockQuestions.length - 1 ? '結果を見る' : '次の問題'}
          </button>
        </div>
      </div>
    </div>
  )
}