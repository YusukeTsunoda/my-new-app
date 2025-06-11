import { Question, Quiz, UserAnswer, QuizResult, QuizState } from '@/types/quiz'

describe('Quiz Types', () => {
  describe('Question type', () => {
    it('should have required properties', () => {
      const question: Question = {
        id: 1,
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1
      }

      expect(question.id).toBe(1)
      expect(question.question).toBe('What is 2 + 2?')
      expect(question.options).toHaveLength(4)
      expect(question.correctAnswer).toBe(1)
    })

    it('should accept optional properties', () => {
      const question: Question = {
        id: 1,
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        explanation: 'Basic arithmetic',
        category: 'Math',
        difficulty: 'easy'
      }

      expect(question.explanation).toBe('Basic arithmetic')
      expect(question.category).toBe('Math')
      expect(question.difficulty).toBe('easy')
    })
  })

  describe('Quiz type', () => {
    it('should have required properties', () => {
      const quiz: Quiz = {
        id: 'quiz-1',
        title: 'Math Quiz',
        questions: [
          {
            id: 1,
            question: 'What is 2 + 2?',
            options: ['3', '4', '5', '6'],
            correctAnswer: 1
          }
        ]
      }

      expect(quiz.id).toBe('quiz-1')
      expect(quiz.title).toBe('Math Quiz')
      expect(quiz.questions).toHaveLength(1)
    })
  })

  describe('UserAnswer type', () => {
    it('should track user response correctly', () => {
      const answer: UserAnswer = {
        questionId: 1,
        selectedOption: 1,
        isCorrect: true,
        timeSpent: 5000
      }

      expect(answer.questionId).toBe(1)
      expect(answer.selectedOption).toBe(1)
      expect(answer.isCorrect).toBe(true)
      expect(answer.timeSpent).toBe(5000)
    })
  })

  describe('QuizResult type', () => {
    it('should calculate percentage correctly', () => {
      const result: QuizResult = {
        quizId: 'quiz-1',
        answers: [],
        score: 8,
        totalQuestions: 10,
        correctAnswers: 8,
        percentage: 80,
        completedAt: new Date(),
        timeSpent: 300000
      }

      expect(result.percentage).toBe(80)
      expect(result.score).toBe(8)
      expect(result.totalQuestions).toBe(10)
    })
  })

  describe('QuizState type', () => {
    it('should track quiz progress', () => {
      const state: QuizState = {
        currentQuestionIndex: 0,
        answers: [],
        startTime: new Date(),
        isCompleted: false,
        score: 0
      }

      expect(state.currentQuestionIndex).toBe(0)
      expect(state.isCompleted).toBe(false)
      expect(state.score).toBe(0)
    })
  })
})