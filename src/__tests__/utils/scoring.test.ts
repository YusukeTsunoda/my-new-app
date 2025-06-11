import { Question, UserAnswer, QuizResult } from '@/types/quiz'
import { calculateScore, calculatePercentage, generateQuizResult } from '@/utils/scoring'

describe('Scoring Logic', () => {
  const mockQuestions: Question[] = [
    {
      id: 1,
      question: 'What is 2 + 2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: 1
    },
    {
      id: 2,
      question: 'What is 3 + 3?',
      options: ['5', '6', '7', '8'],
      correctAnswer: 1
    },
    {
      id: 3,
      question: 'What is 4 + 4?',
      options: ['6', '7', '8', '9'],
      correctAnswer: 2
    }
  ]

  const mockUserAnswers: UserAnswer[] = [
    {
      questionId: 1,
      selectedOption: 1,
      isCorrect: true,
      timeSpent: 5000
    },
    {
      questionId: 2,
      selectedOption: 0,
      isCorrect: false,
      timeSpent: 3000
    },
    {
      questionId: 3,
      selectedOption: 2,
      isCorrect: true,
      timeSpent: 4000
    }
  ]

  describe('calculateScore', () => {
    it('should calculate correct score from user answers', () => {
      const score = calculateScore(mockUserAnswers)
      expect(score).toBe(2)
    })

    it('should return 0 for empty answers', () => {
      const score = calculateScore([])
      expect(score).toBe(0)
    })

    it('should return 0 for all incorrect answers', () => {
      const incorrectAnswers: UserAnswer[] = [
        {
          questionId: 1,
          selectedOption: 0,
          isCorrect: false
        },
        {
          questionId: 2,
          selectedOption: 2,
          isCorrect: false
        }
      ]
      const score = calculateScore(incorrectAnswers)
      expect(score).toBe(0)
    })

    it('should return full score for all correct answers', () => {
      const correctAnswers: UserAnswer[] = [
        {
          questionId: 1,
          selectedOption: 1,
          isCorrect: true
        },
        {
          questionId: 2,
          selectedOption: 1,
          isCorrect: true
        }
      ]
      const score = calculateScore(correctAnswers)
      expect(score).toBe(2)
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate correct percentage', () => {
      const percentage = calculatePercentage(2, 3)
      expect(percentage).toBeCloseTo(66.67, 2)
    })

    it('should return 100% for perfect score', () => {
      const percentage = calculatePercentage(5, 5)
      expect(percentage).toBe(100)
    })

    it('should return 0% for zero score', () => {
      const percentage = calculatePercentage(0, 5)
      expect(percentage).toBe(0)
    })

    it('should handle edge case of zero total questions', () => {
      const percentage = calculatePercentage(0, 0)
      expect(percentage).toBe(0)
    })
  })

  describe('generateQuizResult', () => {
    it('should generate complete quiz result', () => {
      const startTime = new Date('2023-01-01T10:00:00.000Z')
      const endTime = new Date('2023-01-01T10:05:00.000Z')
      
      const result = generateQuizResult(
        'quiz-1',
        mockUserAnswers,
        mockQuestions.length,
        startTime,
        endTime
      )

      expect(result.quizId).toBe('quiz-1')
      expect(result.score).toBe(2)
      expect(result.totalQuestions).toBe(3)
      expect(result.correctAnswers).toBe(2)
      expect(result.percentage).toBeCloseTo(66.67, 2)
      expect(result.timeSpent).toBe(300000) // 5 minutes in milliseconds
      expect(result.answers).toEqual(mockUserAnswers)
    })

    it('should handle perfect score', () => {
      const perfectAnswers: UserAnswer[] = [
        {
          questionId: 1,
          selectedOption: 1,
          isCorrect: true
        },
        {
          questionId: 2,
          selectedOption: 1,
          isCorrect: true
        },
        {
          questionId: 3,
          selectedOption: 2,
          isCorrect: true
        }
      ]

      const startTime = new Date('2023-01-01T10:00:00.000Z')
      const endTime = new Date('2023-01-01T10:03:00.000Z')
      
      const result = generateQuizResult(
        'quiz-1',
        perfectAnswers,
        3,
        startTime,
        endTime
      )

      expect(result.score).toBe(3)
      expect(result.correctAnswers).toBe(3)
      expect(result.percentage).toBe(100)
    })

    it('should handle zero score', () => {
      const incorrectAnswers: UserAnswer[] = [
        {
          questionId: 1,
          selectedOption: 0,
          isCorrect: false
        },
        {
          questionId: 2,
          selectedOption: 0,
          isCorrect: false
        }
      ]

      const startTime = new Date('2023-01-01T10:00:00.000Z')
      const endTime = new Date('2023-01-01T10:02:00.000Z')
      
      const result = generateQuizResult(
        'quiz-1',
        incorrectAnswers,
        2,
        startTime,
        endTime
      )

      expect(result.score).toBe(0)
      expect(result.correctAnswers).toBe(0)
      expect(result.percentage).toBe(0)
    })
  })
})