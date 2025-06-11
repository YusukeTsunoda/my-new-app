'use client'

import { useState } from 'react'
import { Question, UserAnswer, QuizResult } from '@/types/quiz'
import { generateQuizResult } from '@/utils/scoring'

interface QuizComponentProps {
  questions: Question[]
  title: string
  onComplete?: (result: QuizResult) => void
}

export function QuizComponent({ questions, title, onComplete }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [showResult, setShowResult] = useState(false)
  const [startTime] = useState(new Date())

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswer(optionIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return

    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption: selectedAnswer,
      isCorrect: selectedAnswer === currentQuestion.correctAnswer
    }

    const newAnswers = [...answers, userAnswer]
    setAnswers(newAnswers)

    if (isLastQuestion) {
      const endTime = new Date()
      const result = generateQuizResult(
        'quiz-1',
        newAnswers,
        questions.length,
        startTime,
        endTime
      )
      
      setShowResult(true)
      onComplete?.(result)
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setAnswers([])
    setShowResult(false)
  }

  const score = answers.filter(answer => answer.isCorrect).length

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100)
    
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
            クイズ結果
          </h1>
          <div className="text-center">
            <div className="text-6xl font-bold text-green-500 mb-4">
              {score}/{questions.length}
            </div>
            <p className="text-xl mb-6">
              正解率: {percentage}%
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
            <h1 className="text-2xl font-bold text-blue-600">{title}</h1>
            <span className="text-gray-600">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              role="progressbar"
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
              }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-6">
            {currentQuestion.question}
          </h2>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
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
            スコア: {score} / {currentQuestionIndex}
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
            {isLastQuestion ? '結果を見る' : '次の問題'}
          </button>
        </div>
      </div>
    </div>
  )
}