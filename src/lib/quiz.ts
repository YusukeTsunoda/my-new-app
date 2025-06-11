import { Quiz, Question, QuizResult, Difficulty } from '../../generated/prisma'
import { prisma } from './prisma'

export interface CreateQuizData {
  title: string
  description?: string
  difficulty?: Difficulty
  timeLimit?: number
  passingScore?: number
  createdBy: string
}

export interface CreateQuestionData {
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
  order: number
}

export interface SubmitQuizData {
  quizId: string
  userId: string
  answers: Array<{
    questionId: string
    selectedOption: number
  }>
  timeSpent: number
}

// Quiz operations
export async function createQuiz(data: CreateQuizData): Promise<Quiz> {
  return await prisma.quiz.create({
    data: {
      title: data.title,
      description: data.description,
      difficulty: data.difficulty || 'MEDIUM',
      timeLimit: data.timeLimit,
      passingScore: data.passingScore,
      createdBy: data.createdBy,
    },
  })
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  return await prisma.quiz.findUnique({
    where: { id },
    include: {
      creator: true,
      questions: {
        orderBy: { order: 'asc' },
      },
      results: {
        include: { user: true },
        orderBy: { completedAt: 'desc' },
      },
    },
  })
}

export async function getPublishedQuizzes(): Promise<Quiz[]> {
  return await prisma.quiz.findMany({
    where: { isPublished: true },
    include: {
      creator: true,
      questions: true,
      _count: {
        select: { results: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getQuizzesByUser(userId: string): Promise<Quiz[]> {
  return await prisma.quiz.findMany({
    where: { createdBy: userId },
    include: {
      questions: true,
      _count: {
        select: { results: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function updateQuiz(
  id: string,
  data: Partial<CreateQuizData>
): Promise<Quiz> {
  return await prisma.quiz.update({
    where: { id },
    data,
  })
}

export async function publishQuiz(id: string): Promise<Quiz> {
  return await prisma.quiz.update({
    where: { id },
    data: { isPublished: true },
  })
}

export async function deleteQuiz(id: string): Promise<Quiz> {
  return await prisma.quiz.delete({
    where: { id },
  })
}

// Question operations
export async function addQuestionToQuiz(
  quizId: string,
  data: CreateQuestionData
): Promise<Question> {
  return await prisma.question.create({
    data: {
      quizId,
      question: data.question,
      options: JSON.stringify(data.options),
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      order: data.order,
    },
  })
}

export async function updateQuestion(
  id: string,
  data: Partial<CreateQuestionData>
): Promise<Question> {
  const updateData: any = { ...data }
  if (data.options) {
    updateData.options = JSON.stringify(data.options)
  }

  return await prisma.question.update({
    where: { id },
    data: updateData,
  })
}

export async function deleteQuestion(id: string): Promise<Question> {
  return await prisma.question.delete({
    where: { id },
  })
}

export async function reorderQuestions(
  quizId: string,
  questionOrders: Array<{ id: string; order: number }>
): Promise<void> {
  await prisma.$transaction(
    questionOrders.map(({ id, order }) =>
      prisma.question.update({
        where: { id },
        data: { order },
      })
    )
  )
}

// Quiz result operations
export async function submitQuizResult(data: SubmitQuizData): Promise<QuizResult> {
  const quiz = await getQuizById(data.quizId)
  if (!quiz) {
    throw new Error('Quiz not found')
  }

  // Calculate score
  let correctAnswers = 0
  const detailedAnswers = data.answers.map((answer) => {
    const question = quiz.questions.find((q) => q.id === answer.questionId)
    if (!question) {
      throw new Error(`Question ${answer.questionId} not found`)
    }

    const isCorrect = answer.selectedOption === question.correctAnswer
    if (isCorrect) correctAnswers++

    return {
      questionId: answer.questionId,
      selectedOption: answer.selectedOption,
      isCorrect,
    }
  })

  const totalQuestions = quiz.questions.length
  const percentage = (correctAnswers / totalQuestions) * 100

  return await prisma.quizResult.create({
    data: {
      quizId: data.quizId,
      userId: data.userId,
      score: correctAnswers,
      totalQuestions,
      correctAnswers,
      percentage,
      timeSpent: data.timeSpent,
      answers: JSON.stringify(detailedAnswers),
    },
  })
}

export async function getQuizResultById(id: string): Promise<QuizResult | null> {
  return await prisma.quizResult.findUnique({
    where: { id },
    include: {
      quiz: {
        include: { questions: true },
      },
      user: true,
    },
  })
}

export async function getQuizResultsByUser(userId: string): Promise<QuizResult[]> {
  return await prisma.quizResult.findMany({
    where: { userId },
    include: {
      quiz: true,
    },
    orderBy: { completedAt: 'desc' },
  })
}

export async function getQuizResultsByQuiz(quizId: string): Promise<QuizResult[]> {
  return await prisma.quizResult.findMany({
    where: { quizId },
    include: {
      user: true,
    },
    orderBy: { completedAt: 'desc' },
  })
}

export async function getQuizLeaderboard(
  quizId: string,
  limit = 10
): Promise<QuizResult[]> {
  return await prisma.quizResult.findMany({
    where: { quizId },
    include: {
      user: true,
    },
    orderBy: [
      { percentage: 'desc' },
      { timeSpent: 'asc' },
    ],
    take: limit,
  })
}

// Statistics operations
export async function getQuizStatistics(quizId: string) {
  const results = await prisma.quizResult.findMany({
    where: { quizId },
  })

  if (results.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      averagePercentage: 0,
      averageTimeSpent: 0,
      passRate: 0,
    }
  }

  const totalAttempts = results.length
  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalAttempts
  const averagePercentage = results.reduce((sum, r) => sum + r.percentage, 0) / totalAttempts
  const averageTimeSpent = results.reduce((sum, r) => sum + r.timeSpent, 0) / totalAttempts

  const quiz = await getQuizById(quizId)
  const passingScore = quiz?.passingScore || 70
  const passedAttempts = results.filter((r) => r.percentage >= passingScore).length
  const passRate = (passedAttempts / totalAttempts) * 100

  return {
    totalAttempts,
    averageScore,
    averagePercentage,
    averageTimeSpent,
    passRate,
  }
}