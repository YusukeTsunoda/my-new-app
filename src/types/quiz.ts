export interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
}

export interface Quiz {
  id: string
  title: string
  description?: string
  questions: Question[]
  timeLimit?: number
  passingScore?: number
}

export interface UserAnswer {
  questionId: number
  selectedOption: number
  isCorrect: boolean
  timeSpent?: number
}

export interface QuizResult {
  quizId: string
  userId?: string
  answers: UserAnswer[]
  score: number
  totalQuestions: number
  correctAnswers: number
  percentage: number
  completedAt: Date
  timeSpent: number
}

export interface QuizState {
  currentQuestionIndex: number
  answers: UserAnswer[]
  startTime: Date
  isCompleted: boolean
  score: number
}