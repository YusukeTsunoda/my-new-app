import { QuizResult } from '@/types/quiz'

export function getStorageKey(quizId: string, userId?: string): string {
  const baseKey = `quiz-results-${quizId}`
  return userId ? `${baseKey}-${userId}` : baseKey
}

export function saveQuizResult(result: QuizResult): void {
  try {
    const storageKey = getStorageKey(result.quizId, result.userId)
    const existingResults = getQuizResults(result.quizId, result.userId)
    
    const updatedResults = [...existingResults, result]
    
    localStorage.setItem(storageKey, JSON.stringify(updatedResults))
  } catch (error) {
    console.warn('Failed to save quiz result:', error)
  }
}

export function getQuizResults(quizId: string, userId?: string): QuizResult[] {
  try {
    const storageKey = getStorageKey(quizId, userId)
    const stored = localStorage.getItem(storageKey)
    
    if (!stored) {
      return []
    }
    
    const parsed = JSON.parse(stored)
    
    if (!Array.isArray(parsed)) {
      return []
    }
    
    // Convert date strings back to Date objects and sort by completion date (newest first)
    return parsed
      .map((result: any) => ({
        ...result,
        completedAt: new Date(result.completedAt)
      }))
      .sort((a: QuizResult, b: QuizResult) => 
        b.completedAt.getTime() - a.completedAt.getTime()
      )
  } catch (error) {
    console.warn('Failed to get quiz results:', error)
    return []
  }
}

export function getQuizResultById(
  quizId: string, 
  resultId: string, 
  userId?: string
): QuizResult | undefined {
  try {
    const results = getQuizResults(quizId, userId)
    return results.find(result => 
      result.completedAt.getTime().toString() === resultId
    )
  } catch (error) {
    console.warn('Failed to get quiz result by ID:', error)
    return undefined
  }
}

export function clearQuizResults(quizId: string, userId?: string): void {
  try {
    const storageKey = getStorageKey(quizId, userId)
    localStorage.removeItem(storageKey)
  } catch (error) {
    console.warn('Failed to clear quiz results:', error)
  }
}

export function getAllQuizResults(): Record<string, QuizResult[]> {
  try {
    const results: Record<string, QuizResult[]> = {}
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('quiz-results-')) {
        const stored = localStorage.getItem(key)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) {
              results[key] = parsed.map((result: any) => ({
                ...result,
                completedAt: new Date(result.completedAt)
              }))
            }
          } catch (parseError) {
            console.warn(`Failed to parse results for key ${key}:`, parseError)
          }
        }
      }
    }
    
    return results
  } catch (error) {
    console.warn('Failed to get all quiz results:', error)
    return {}
  }
}