import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import {
  createQuiz,
  getQuizById,
  addQuestionToQuiz,
  submitQuizResult,
  getQuizStatistics,
  getQuizLeaderboard,
} from '@/lib/quiz'
import { createUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

describe('Quiz Library', () => {
  let testUser: any

  beforeEach(async () => {
    // Clean up test data
    await prisma.quizResult.deleteMany()
    await prisma.question.deleteMany()
    await prisma.quiz.deleteMany()
    await prisma.session.deleteMany()
    await prisma.user.deleteMany()

    // Create test user
    testUser = await createUser({
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    })
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.quizResult.deleteMany()
    await prisma.question.deleteMany()
    await prisma.quiz.deleteMany()
    await prisma.session.deleteMany()
    await prisma.user.deleteMany()
  })

  describe('Quiz operations', () => {
    it('should create a quiz successfully', async () => {
      const quizData = {
        title: 'Test Quiz',
        description: 'A test quiz',
        difficulty: 'MEDIUM' as const,
        timeLimit: 300,
        passingScore: 70,
        createdBy: testUser.id,
      }

      const quiz = await createQuiz(quizData)

      expect(quiz.id).toBeDefined()
      expect(quiz.title).toBe(quizData.title)
      expect(quiz.description).toBe(quizData.description)
      expect(quiz.difficulty).toBe(quizData.difficulty)
      expect(quiz.timeLimit).toBe(quizData.timeLimit)
      expect(quiz.passingScore).toBe(quizData.passingScore)
      expect(quiz.createdBy).toBe(quizData.createdBy)
      expect(quiz.isPublished).toBe(false)
    })

    it('should get quiz by ID with relations', async () => {
      const quiz = await createQuiz({
        title: 'Test Quiz',
        createdBy: testUser.id,
      })

      const foundQuiz = await getQuizById(quiz.id)

      expect(foundQuiz).toBeDefined()
      expect(foundQuiz!.id).toBe(quiz.id)
      expect(foundQuiz!.creator).toBeDefined()
      expect(foundQuiz!.questions).toBeDefined()
      expect(foundQuiz!.results).toBeDefined()
    })
  })

  describe('Question operations', () => {
    let testQuiz: any

    beforeEach(async () => {
      testQuiz = await createQuiz({
        title: 'Test Quiz',
        createdBy: testUser.id,
      })
    })

    it('should add question to quiz', async () => {
      const questionData = {
        question: 'What is 2 + 2?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 2,
        explanation: 'Basic arithmetic',
        order: 1,
      }

      const question = await addQuestionToQuiz(testQuiz.id, questionData)

      expect(question.id).toBeDefined()
      expect(question.quizId).toBe(testQuiz.id)
      expect(question.question).toBe(questionData.question)
      expect(question.options).toBe(JSON.stringify(questionData.options))
      expect(question.correctAnswer).toBe(questionData.correctAnswer)
      expect(question.explanation).toBe(questionData.explanation)
      expect(question.order).toBe(questionData.order)
    })
  })

  describe('Quiz result operations', () => {
    let testQuiz: any
    let question1: any
    let question2: any

    beforeEach(async () => {
      testQuiz = await createQuiz({
        title: 'Test Quiz',
        passingScore: 70,
        createdBy: testUser.id,
      })

      question1 = await addQuestionToQuiz(testQuiz.id, {
        question: 'What is 2 + 2?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 2,
        order: 1,
      })

      question2 = await addQuestionToQuiz(testQuiz.id, {
        question: 'What is 3 + 3?',
        options: ['5', '6', '7', '8'],
        correctAnswer: 1,
        order: 2,
      })
    })

    it('should submit quiz result and calculate score', async () => {
      const submitData = {
        quizId: testQuiz.id,
        userId: testUser.id,
        answers: [
          { questionId: question1.id, selectedOption: 2 }, // Correct
          { questionId: question2.id, selectedOption: 0 }, // Incorrect
        ],
        timeSpent: 120000,
      }

      const result = await submitQuizResult(submitData)

      expect(result.id).toBeDefined()
      expect(result.quizId).toBe(testQuiz.id)
      expect(result.userId).toBe(testUser.id)
      expect(result.score).toBe(1)
      expect(result.totalQuestions).toBe(2)
      expect(result.correctAnswers).toBe(1)
      expect(result.percentage).toBe(50)
      expect(result.timeSpent).toBe(120000)
      
      const answers = JSON.parse(result.answers)
      expect(answers).toHaveLength(2)
      expect(answers[0].isCorrect).toBe(true)
      expect(answers[1].isCorrect).toBe(false)
    })

    it('should calculate perfect score', async () => {
      const submitData = {
        quizId: testQuiz.id,
        userId: testUser.id,
        answers: [
          { questionId: question1.id, selectedOption: 2 }, // Correct
          { questionId: question2.id, selectedOption: 1 }, // Correct
        ],
        timeSpent: 90000,
      }

      const result = await submitQuizResult(submitData)

      expect(result.score).toBe(2)
      expect(result.correctAnswers).toBe(2)
      expect(result.percentage).toBe(100)
    })

    it('should throw error for non-existent quiz', async () => {
      const submitData = {
        quizId: 'non-existent-quiz',
        userId: testUser.id,
        answers: [],
        timeSpent: 60000,
      }

      await expect(submitQuizResult(submitData)).rejects.toThrow('Quiz not found')
    })

    it('should throw error for non-existent question', async () => {
      const submitData = {
        quizId: testQuiz.id,
        userId: testUser.id,
        answers: [
          { questionId: 'non-existent-question', selectedOption: 0 },
        ],
        timeSpent: 60000,
      }

      await expect(submitQuizResult(submitData)).rejects.toThrow('Question non-existent-question not found')
    })
  })

  describe('Statistics operations', () => {
    let testQuiz: any
    let question: any

    beforeEach(async () => {
      testQuiz = await createQuiz({
        title: 'Test Quiz',
        passingScore: 70,
        createdBy: testUser.id,
      })

      question = await addQuestionToQuiz(testQuiz.id, {
        question: 'What is 2 + 2?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 2,
        order: 1,
      })
    })

    it('should return empty statistics for quiz with no results', async () => {
      const stats = await getQuizStatistics(testQuiz.id)

      expect(stats.totalAttempts).toBe(0)
      expect(stats.averageScore).toBe(0)
      expect(stats.averagePercentage).toBe(0)
      expect(stats.averageTimeSpent).toBe(0)
      expect(stats.passRate).toBe(0)
    })

    it('should calculate statistics correctly', async () => {
      // Submit multiple results
      await submitQuizResult({
        quizId: testQuiz.id,
        userId: testUser.id,
        answers: [{ questionId: question.id, selectedOption: 2 }], // 100%
        timeSpent: 60000,
      })

      const user2 = await createUser({
        email: 'test2@example.com',
        username: 'testuser2',
        password: 'password123',
      })

      await submitQuizResult({
        quizId: testQuiz.id,
        userId: user2.id,
        answers: [{ questionId: question.id, selectedOption: 0 }], // 0%
        timeSpent: 120000,
      })

      const stats = await getQuizStatistics(testQuiz.id)

      expect(stats.totalAttempts).toBe(2)
      expect(stats.averageScore).toBe(0.5)
      expect(stats.averagePercentage).toBe(50)
      expect(stats.averageTimeSpent).toBe(90000)
      expect(stats.passRate).toBe(50) // One passed (100% >= 70%), one failed
    })

    it('should get quiz leaderboard', async () => {
      const user2 = await createUser({
        email: 'test2@example.com',
        username: 'testuser2',
        password: 'password123',
      })

      // User 1: 100%, faster time
      await submitQuizResult({
        quizId: testQuiz.id,
        userId: testUser.id,
        answers: [{ questionId: question.id, selectedOption: 2 }],
        timeSpent: 60000,
      })

      // User 2: 100%, slower time
      await submitQuizResult({
        quizId: testQuiz.id,
        userId: user2.id,
        answers: [{ questionId: question.id, selectedOption: 2 }],
        timeSpent: 120000,
      })

      const leaderboard = await getQuizLeaderboard(testQuiz.id, 10)

      expect(leaderboard).toHaveLength(2)
      expect(leaderboard[0].userId).toBe(testUser.id) // Faster time, same percentage
      expect(leaderboard[1].userId).toBe(user2.id)
    })
  })
})