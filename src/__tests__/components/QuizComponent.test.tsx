import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuizComponent } from '@/components/QuizComponent'
import { Question } from '@/types/quiz'

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
  }
]

describe('QuizComponent', () => {
  it('should render quiz title and first question', () => {
    render(<QuizComponent questions={mockQuestions} title="Math Quiz" />)
    
    expect(screen.getByText('Math Quiz')).toBeInTheDocument()
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('should display all answer options for current question', () => {
    render(<QuizComponent questions={mockQuestions} title="Math Quiz" />)
    
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('6')).toBeInTheDocument()
  })

  it('should allow user to select an answer', async () => {
    const user = userEvent.setup()
    render(<QuizComponent questions={mockQuestions} title="Math Quiz" />)
    
    const buttons = screen.getAllByRole('button')
    const option4Button = buttons.find(button => button.textContent?.includes('4'))
    expect(option4Button).toBeDefined()
    
    if (option4Button) {
      await user.click(option4Button)
      expect(option4Button).toHaveClass('border-blue-500')
    }
  })

  it('should disable next button when no answer is selected', () => {
    render(<QuizComponent questions={mockQuestions} title="Math Quiz" />)
    
    const nextButton = screen.getByRole('button', { name: /次の問題/i })
    expect(nextButton).toBeDisabled()
  })

  it('should enable next button when answer is selected', async () => {
    const user = userEvent.setup()
    render(<QuizComponent questions={mockQuestions} title="Math Quiz" />)
    
    const buttons = screen.getAllByRole('button')
    const option4Button = buttons.find(button => button.textContent?.includes('4'))
    
    if (option4Button) {
      await user.click(option4Button)
    }
    
    const nextButton = screen.getByRole('button', { name: /次の問題/i })
    expect(nextButton).not.toBeDisabled()
  })

  it('should move to next question when next button is clicked', async () => {
    const user = userEvent.setup()
    render(<QuizComponent questions={mockQuestions} title="Math Quiz" />)
    
    // Select an answer
    const buttons = screen.getAllByRole('button')
    const option4Button = buttons.find(button => button.textContent?.includes('4'))
    if (option4Button) {
      await user.click(option4Button)
    }
    
    // Click next button
    const nextButton = screen.getByRole('button', { name: /次の問題/i })
    await user.click(nextButton)
    
    // Check if second question is displayed
    expect(screen.getByText('What is 3 + 3?')).toBeInTheDocument()
    expect(screen.getByText('2 / 2')).toBeInTheDocument()
  })

  it('should show result button on last question', async () => {
    const user = userEvent.setup()
    render(<QuizComponent questions={mockQuestions} title="Math Quiz" />)
    
    // Answer first question
    const buttons1 = screen.getAllByRole('button')
    const option4Button = buttons1.find(button => button.textContent?.includes('4'))
    if (option4Button) await user.click(option4Button)
    await user.click(screen.getByRole('button', { name: /次の問題/i }))
    
    // Answer second question
    const buttons2 = screen.getAllByRole('button')
    const option6Button = buttons2.find(button => button.textContent?.includes('6'))
    if (option6Button) await user.click(option6Button)
    
    // Check if result button is shown
    expect(screen.getByRole('button', { name: /結果を見る/i })).toBeInTheDocument()
  })

  it('should show quiz result when quiz is completed', async () => {
    const user = userEvent.setup()
    render(<QuizComponent questions={mockQuestions} title="Math Quiz" />)
    
    // Answer first question correctly
    const buttons1 = screen.getAllByRole('button')
    const option4Button = buttons1.find(button => button.textContent?.includes('4'))
    if (option4Button) await user.click(option4Button)
    await user.click(screen.getByRole('button', { name: /次の問題/i }))
    
    // Answer second question correctly
    const buttons2 = screen.getAllByRole('button')
    const option6Button = buttons2.find(button => button.textContent?.includes('6'))
    if (option6Button) await user.click(option6Button)
    await user.click(screen.getByRole('button', { name: /結果を見る/i }))
    
    // Check if result is displayed
    expect(screen.getByText('クイズ結果')).toBeInTheDocument()
    expect(screen.getByText('2/2')).toBeInTheDocument()
    expect(screen.getByText('正解率: 100%')).toBeInTheDocument()
  })

  it('should show progress bar with correct percentage', () => {
    render(<QuizComponent questions={mockQuestions} title="Math Quiz" />)
    
    const progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveStyle({ width: '50%' })
  })

  it('should display current score during quiz', async () => {
    const user = userEvent.setup()
    render(<QuizComponent questions={mockQuestions} title="Math Quiz" />)
    
    // Initially score should be 0
    expect(screen.getByText('スコア: 0 / 0')).toBeInTheDocument()
    
    // Answer first question correctly
    const buttons = screen.getAllByRole('button')
    const option4Button = buttons.find(button => button.textContent?.includes('4'))
    if (option4Button) await user.click(option4Button)
    await user.click(screen.getByRole('button', { name: /次の問題/i }))
    
    // Score should be updated
    expect(screen.getByText('スコア: 1 / 1')).toBeInTheDocument()
  })

  it('should reset quiz when reset button is clicked', async () => {
    const user = userEvent.setup()
    render(<QuizComponent questions={mockQuestions} title="Math Quiz" />)
    
    // Complete the quiz
    const buttons1 = screen.getAllByRole('button')
    const option4Button = buttons1.find(button => button.textContent?.includes('4'))
    if (option4Button) await user.click(option4Button)
    await user.click(screen.getByRole('button', { name: /次の問題/i }))
    
    const buttons2 = screen.getAllByRole('button')
    const option6Button = buttons2.find(button => button.textContent?.includes('6'))
    if (option6Button) await user.click(option6Button)
    await user.click(screen.getByRole('button', { name: /結果を見る/i }))
    
    // Click reset button
    await user.click(screen.getByRole('button', { name: /もう一度挑戦する/i }))
    
    // Should be back to first question
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
  })

  it('should handle quiz with onComplete callback', async () => {
    const mockOnComplete = jest.fn()
    const user = userEvent.setup()
    
    render(
      <QuizComponent 
        questions={mockQuestions} 
        title="Math Quiz" 
        onComplete={mockOnComplete}
      />
    )
    
    // Complete the quiz
    const buttons1 = screen.getAllByRole('button')
    const option4Button = buttons1.find(button => button.textContent?.includes('4'))
    if (option4Button) await user.click(option4Button)
    await user.click(screen.getByRole('button', { name: /次の問題/i }))
    
    const buttons2 = screen.getAllByRole('button')
    const option6Button = buttons2.find(button => button.textContent?.includes('6'))
    if (option6Button) await user.click(option6Button)
    await user.click(screen.getByRole('button', { name: /結果を見る/i }))
    
    expect(mockOnComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        score: 2,
        totalQuestions: 2,
        percentage: 100
      })
    )
  })
})