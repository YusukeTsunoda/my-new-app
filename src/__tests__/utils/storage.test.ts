import { QuizResult } from '@/types/quiz'
import { 
  saveQuizResult, 
  getQuizResults, 
  getQuizResultById, 
  clearQuizResults,
  getStorageKey 
} from '@/utils/storage'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Storage Utils', () => {
  const mockQuizResult: QuizResult = {
    quizId: 'quiz-1',
    userId: 'user-1',
    answers: [
      { questionId: 1, selectedOption: 1, isCorrect: true },
      { questionId: 2, selectedOption: 0, isCorrect: false }
    ],
    score: 1,
    totalQuestions: 2,
    correctAnswers: 1,
    percentage: 50,
    completedAt: new Date('2023-01-01T10:00:00.000Z'),
    timeSpent: 120000
  }

  beforeEach(() => {
    localStorage.clear()
  })

  describe('getStorageKey', () => {
    it('should generate correct storage key', () => {
      const key = getStorageKey('quiz-1')
      expect(key).toBe('quiz-results-quiz-1')
    })

    it('should generate correct storage key for user-specific results', () => {
      const key = getStorageKey('quiz-1', 'user-1')
      expect(key).toBe('quiz-results-quiz-1-user-1')
    })
  })

  describe('saveQuizResult', () => {
    it('should save quiz result to localStorage', () => {
      saveQuizResult(mockQuizResult)
      
      const stored = localStorage.getItem('quiz-results-quiz-1-user-1')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(Array.isArray(parsed)).toBe(true)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].quizId).toBe('quiz-1')
    })

    it('should append to existing results', () => {
      const firstResult = { ...mockQuizResult, completedAt: new Date('2023-01-01T09:00:00.000Z') }
      const secondResult = { ...mockQuizResult, completedAt: new Date('2023-01-01T10:00:00.000Z') }
      
      saveQuizResult(firstResult)
      saveQuizResult(secondResult)
      
      const results = getQuizResults('quiz-1', 'user-1')
      expect(results).toHaveLength(2)
    })

    it('should handle quiz result without userId', () => {
      const resultWithoutUser = { ...mockQuizResult, userId: undefined }
      saveQuizResult(resultWithoutUser)
      
      const stored = localStorage.getItem('quiz-results-quiz-1')
      expect(stored).toBeTruthy()
      
      const parsed = JSON.parse(stored!)
      expect(parsed).toHaveLength(1)
    })

    it('should convert Date objects to strings and back', () => {
      saveQuizResult(mockQuizResult)
      
      const results = getQuizResults('quiz-1', 'user-1')
      expect(results[0].completedAt).toBeInstanceOf(Date)
      expect(results[0].completedAt.toISOString()).toBe('2023-01-01T10:00:00.000Z')
    })
  })

  describe('getQuizResults', () => {
    it('should return empty array when no results exist', () => {
      const results = getQuizResults('nonexistent-quiz')
      expect(results).toEqual([])
    })

    it('should retrieve saved quiz results', () => {
      saveQuizResult(mockQuizResult)
      
      const results = getQuizResults('quiz-1', 'user-1')
      expect(results).toHaveLength(1)
      expect(results[0].quizId).toBe('quiz-1')
      expect(results[0].score).toBe(1)
    })

    it('should sort results by completion date (newest first)', () => {
      const oldResult = { ...mockQuizResult, completedAt: new Date('2023-01-01T09:00:00.000Z') }
      const newResult = { ...mockQuizResult, completedAt: new Date('2023-01-01T11:00:00.000Z') }
      
      saveQuizResult(oldResult)
      saveQuizResult(newResult)
      
      const results = getQuizResults('quiz-1', 'user-1')
      expect(results[0].completedAt.getTime()).toBeGreaterThan(results[1].completedAt.getTime())
    })

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('quiz-results-quiz-1', 'invalid-json')
      
      const results = getQuizResults('quiz-1')
      expect(results).toEqual([])
    })
  })

  describe('getQuizResultById', () => {
    it('should return undefined for nonexistent result', () => {
      const result = getQuizResultById('quiz-1', 'nonexistent-id')
      expect(result).toBeUndefined()
    })

    it('should retrieve specific quiz result by timestamp', () => {
      const timestamp = mockQuizResult.completedAt.getTime()
      saveQuizResult(mockQuizResult)
      
      const result = getQuizResultById('quiz-1', timestamp.toString(), 'user-1')
      expect(result).toBeDefined()
      expect(result!.quizId).toBe('quiz-1')
    })

    it('should handle results without userId', () => {
      const resultWithoutUser = { ...mockQuizResult, userId: undefined }
      const timestamp = resultWithoutUser.completedAt.getTime()
      saveQuizResult(resultWithoutUser)
      
      const result = getQuizResultById('quiz-1', timestamp.toString())
      expect(result).toBeDefined()
      expect(result!.quizId).toBe('quiz-1')
    })
  })

  describe('clearQuizResults', () => {
    it('should clear all results for a quiz', () => {
      saveQuizResult(mockQuizResult)
      expect(getQuizResults('quiz-1', 'user-1')).toHaveLength(1)
      
      clearQuizResults('quiz-1', 'user-1')
      expect(getQuizResults('quiz-1', 'user-1')).toHaveLength(0)
    })

    it('should clear results for quiz without userId', () => {
      const resultWithoutUser = { ...mockQuizResult, userId: undefined }
      saveQuizResult(resultWithoutUser)
      expect(getQuizResults('quiz-1')).toHaveLength(1)
      
      clearQuizResults('quiz-1')
      expect(getQuizResults('quiz-1')).toHaveLength(0)
    })

    it('should not affect other quiz results', () => {
      const quiz1Result = { ...mockQuizResult, quizId: 'quiz-1' }
      const quiz2Result = { ...mockQuizResult, quizId: 'quiz-2' }
      
      saveQuizResult(quiz1Result)
      saveQuizResult(quiz2Result)
      
      clearQuizResults('quiz-1', 'user-1')
      
      expect(getQuizResults('quiz-1', 'user-1')).toHaveLength(0)
      expect(getQuizResults('quiz-2', 'user-1')).toHaveLength(1)
    })
  })

  describe('Error handling', () => {
    it('should handle localStorage quota exceeded error', () => {
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn(() => {
        throw new Error('QuotaExceededError')
      })
      
      expect(() => saveQuizResult(mockQuizResult)).not.toThrow()
      
      localStorage.setItem = originalSetItem
    })

    it('should handle localStorage access denied error', () => {
      const originalGetItem = localStorage.getItem
      localStorage.getItem = jest.fn(() => {
        throw new Error('Access denied')
      })
      
      const results = getQuizResults('quiz-1')
      expect(results).toEqual([])
      
      localStorage.getItem = originalGetItem
    })
  })
})