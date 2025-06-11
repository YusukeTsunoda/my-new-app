import { UserAnswer, QuizResult } from '@/types/quiz'

export function calculateScore(answers: UserAnswer[]): number {
  return answers.filter(answer => answer.isCorrect).length
}

export function calculatePercentage(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0
  return Math.round((correctAnswers / totalQuestions) * 100 * 100) / 100
}

export function generateQuizResult(
  quizId: string,
  answers: UserAnswer[],
  totalQuestions: number,
  startTime: Date,
  endTime: Date,
  userId?: string
): QuizResult {
  const correctAnswers = calculateScore(answers)
  const percentage = calculatePercentage(correctAnswers, totalQuestions)
  const timeSpent = endTime.getTime() - startTime.getTime()

  return {
    quizId,
    userId,
    answers,
    score: correctAnswers,
    totalQuestions,
    correctAnswers,
    percentage,
    completedAt: endTime,
    timeSpent
  }
}