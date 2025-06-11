import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizPage from '../src/app/quiz/page';

describe('Quiz Scoring Tests - 採点結果表示', () => {
  beforeEach(() => {
    render(<QuizPage />);
  });

  test('満点時の採点結果とメッセージが正しく表示されること', async () => {
    // 全問正解のテストフロー
    await completeQuizWithAllCorrectAnswers();
    
    // 結果画面の詳細確認
    await waitFor(() => {
      expect(screen.getByText('クイズ結果')).toBeInTheDocument();
      expect(screen.getByText('3/3')).toBeInTheDocument();
      expect(screen.getByText('正解率: 100%')).toBeInTheDocument();
      
      // スコア表示の色やスタイルの確認
      const scoreElement = screen.getByText('3/3');
      expect(scoreElement).toHaveClass('text-6xl', 'font-bold', 'text-green-500');
    });
  });

  test('部分正解時の採点結果とメッセージが正しく表示されること', async () => {
    // 2問正解のテストフロー
    await completeQuizWithPartialCorrectAnswers();
    
    await waitFor(() => {
      expect(screen.getByText('クイズ結果')).toBeInTheDocument();
      expect(screen.getByText('2/3')).toBeInTheDocument();
      expect(screen.getByText('正解率: 67%')).toBeInTheDocument();
      
      // スコア表示の色の確認
      const scoreElement = screen.getByText('2/3');
      expect(scoreElement).toHaveClass('text-6xl', 'font-bold', 'text-green-500');
    });
  });

  test('低得点時の採点結果とメッセージが正しく表示されること', async () => {
    // 1問正解のテストフロー
    await completeQuizWithLowScore();
    
    await waitFor(() => {
      expect(screen.getByText('クイズ結果')).toBeInTheDocument();
      expect(screen.getByText('1/3')).toBeInTheDocument();
      expect(screen.getByText('正解率: 33%')).toBeInTheDocument();
      
      // スコア表示の色の確認
      const scoreElement = screen.getByText('1/3');
      expect(scoreElement).toHaveClass('text-6xl', 'font-bold', 'text-green-500');
    });
  });

  test('0点時の採点結果とメッセージが正しく表示されること', async () => {
    // 全問不正解のテストフロー
    await completeQuizWithAllWrongAnswers();
    
    await waitFor(() => {
      expect(screen.getByText('クイズ結果')).toBeInTheDocument();
      expect(screen.getByText('0/3')).toBeInTheDocument();
      expect(screen.getByText('正解率: 0%')).toBeInTheDocument();
      
      // スコア表示の色の確認
      const scoreElement = screen.getByText('0/3');
      expect(scoreElement).toHaveClass('text-6xl', 'font-bold', 'text-green-500');
    });
  });

  test('スコア計算が各問題で正しく更新されること', async () => {
    let currentScore = 0;
    
    // 問題1: 正解選択（上記すべて）
    const correctOption1 = screen.getByText(/上記すべて/);
    fireEvent.click(correctOption1);
    currentScore++;
    
    // スコア更新確認（問題回答後）
    expect(screen.getByText(`スコア: ${currentScore} / 1`)).toBeInTheDocument();
    
    const nextButton1 = screen.getByText('次の問題');
    fireEvent.click(nextButton1);
    
    // 問題2: 不正解選択
    await waitFor(() => {
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });
    
    const wrongOption2 = screen.getByText(/useEffect/);
    fireEvent.click(wrongOption2);
    // スコアは増加しない
    
    expect(screen.getByText(`スコア: ${currentScore} / 2`)).toBeInTheDocument();
    
    const nextButton2 = screen.getByText('次の問題');
    fireEvent.click(nextButton2);
    
    // 問題3: 正解選択
    await waitFor(() => {
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });
    
    const correctOption3 = screen.getByText(/ファイルベースルーティング/);
    fireEvent.click(correctOption3);
    currentScore++;
    
    expect(screen.getByText(`スコア: ${currentScore} / 3`)).toBeInTheDocument();
    
    const finishButton = screen.getByText('結果を見る');
    fireEvent.click(finishButton);
    
    // 最終スコア確認
    await waitFor(() => {
      expect(screen.getByText(`${currentScore}/3`)).toBeInTheDocument();
    });
  });

  test('やり直しボタンが正常に動作すること', async () => {
    // クイズ完了
    await completeQuizWithAllCorrectAnswers();
    
    // やり直しボタンクリック
    await waitFor(() => {
      const restartButton = screen.getByText('もう一度挑戦する');
      fireEvent.click(restartButton);
    });
    
    // 初期状態に戻ることを確認
    await waitFor(() => {
      expect(screen.getByText('1 / 3')).toBeInTheDocument();
      expect(screen.getByText('JavaScriptで変数を宣言するキーワードはどれですか？')).toBeInTheDocument();
      expect(screen.getByText('スコア: 0 / 0')).toBeInTheDocument();
      
      // 結果画面が非表示になることを確認
      expect(screen.queryByText('クイズ結果')).not.toBeInTheDocument();
    });
  });

  test('パーセント表示が正しく計算されること', async () => {
    // 2/3問正解のケース
    await completeQuizWithPartialCorrectAnswers();
    
    await waitFor(() => {
      // 正答率の計算確認 (2/3 = 66.67%)
      const percentageText = screen.getByText(/67%/);
      expect(percentageText).toBeInTheDocument();
    });
  });
});

// ヘルパー関数
async function completeQuizWithAllCorrectAnswers() {
  // 問題1: 正解
  const option1 = screen.getByText(/上記すべて/);
  fireEvent.click(option1);
  fireEvent.click(screen.getByText('次の問題'));
  
  // 問題2: 正解
  await waitFor(() => screen.getByText('2 / 3'));
  const option2 = screen.getByText(/useState/);
  fireEvent.click(option2);
  fireEvent.click(screen.getByText('次の問題'));
  
  // 問題3: 正解
  await waitFor(() => screen.getByText('3 / 3'));
  const option3 = screen.getByText(/ファイルベースルーティング/);
  fireEvent.click(option3);
  fireEvent.click(screen.getByText('結果を見る'));
}

async function completeQuizWithPartialCorrectAnswers() {
  // 問題1: 正解
  const option1 = screen.getByText(/上記すべて/);
  fireEvent.click(option1);
  fireEvent.click(screen.getByText('次の問題'));
  
  // 問題2: 正解
  await waitFor(() => screen.getByText('2 / 3'));
  const option2 = screen.getByText(/useState/);
  fireEvent.click(option2);
  fireEvent.click(screen.getByText('次の問題'));
  
  // 問題3: 不正解
  await waitFor(() => screen.getByText('3 / 3'));
  const option3 = screen.getByText(/React Router/);
  fireEvent.click(option3);
  fireEvent.click(screen.getByText('結果を見る'));
}

async function completeQuizWithLowScore() {
  // 問題1: 不正解
  const option1 = screen.getByText(/var/);
  fireEvent.click(option1);
  fireEvent.click(screen.getByText('次の問題'));
  
  // 問題2: 正解
  await waitFor(() => screen.getByText('2 / 3'));
  const option2 = screen.getByText(/useState/);
  fireEvent.click(option2);
  fireEvent.click(screen.getByText('次の問題'));
  
  // 問題3: 不正解
  await waitFor(() => screen.getByText('3 / 3'));
  const option3 = screen.getByText(/React Router/);
  fireEvent.click(option3);
  fireEvent.click(screen.getByText('結果を見る'));
}

async function completeQuizWithAllWrongAnswers() {
  // 問題1: 不正解
  const option1 = screen.getByText(/var/);
  fireEvent.click(option1);
  fireEvent.click(screen.getByText('次の問題'));
  
  // 問題2: 不正解
  await waitFor(() => screen.getByText('2 / 3'));
  const option2 = screen.getByText(/useEffect/);
  fireEvent.click(option2);
  fireEvent.click(screen.getByText('次の問題'));
  
  // 問題3: 不正解
  await waitFor(() => screen.getByText('3 / 3'));
  const option3 = screen.getByText(/React Router/);
  fireEvent.click(option3);
  fireEvent.click(screen.getByText('結果を見る'));
}