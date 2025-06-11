import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuizPage from '../src/app/quiz/page';

describe('Quiz E2E Tests - 回答フロー', () => {
  beforeEach(() => {
    render(<QuizPage />);
  });

  test('クイズが正常に初期化されること', () => {
    expect(screen.getByText('学習支援クイズ')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
    expect(screen.getByText('JavaScriptで変数を宣言するキーワードはどれですか？')).toBeInTheDocument();
    expect(screen.getByText('スコア: 0 / 0')).toBeInTheDocument();
  });

  test('クイズ回答フロー全体が正常に動作すること', async () => {
    // 問題1: 正解を選択（上記すべて）
    const correctOption1 = screen.getByText(/上記すべて/);
    fireEvent.click(correctOption1);
    
    const nextButton1 = screen.getByText('次の問題');
    fireEvent.click(nextButton1);
    
    // 問題2に移動
    await waitFor(() => {
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
      expect(screen.getByText('Reactのフックの中で、状態管理に使用するものはどれですか？')).toBeInTheDocument();
    });
    
    // 問題2: 正解を選択（useState）
    const correctOption2 = screen.getByText(/useState/);
    fireEvent.click(correctOption2);
    
    const nextButton2 = screen.getByText('次の問題');
    fireEvent.click(nextButton2);
    
    // 問題3に移動
    await waitFor(() => {
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
      expect(screen.getByText('Next.jsでページルーティングを行う方法は？')).toBeInTheDocument();
    });
    
    // 問題3: 正解を選択（ファイルベースルーティング）
    const correctOption3 = screen.getByText(/ファイルベースルーティング/);
    fireEvent.click(correctOption3);
    
    const finishButton = screen.getByText('結果を見る');
    fireEvent.click(finishButton);
    
    // 結果画面の確認
    await waitFor(() => {
      expect(screen.getByText('クイズ結果')).toBeInTheDocument();
      expect(screen.getByText('3/3')).toBeInTheDocument();
      expect(screen.getByText('正解率: 100%')).toBeInTheDocument();
    });
  });

  test('不正解を含む回答フローが正常に動作すること', async () => {
    // 問題1: 不正解を選択（var）
    const wrongOption1 = screen.getByText(/var/);
    fireEvent.click(wrongOption1);
    
    const nextButton1 = screen.getByText('次の問題');
    fireEvent.click(nextButton1);
    
    // 問題2: 正解を選択
    await waitFor(() => {
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });
    
    const correctOption2 = screen.getByText(/useState/);
    fireEvent.click(correctOption2);
    
    const nextButton2 = screen.getByText('次の問題');
    fireEvent.click(nextButton2);
    
    // 問題3: 不正解を選択（React Router）
    await waitFor(() => {
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });
    
    const wrongOption3 = screen.getByText(/React Router/);
    fireEvent.click(wrongOption3);
    
    const finishButton = screen.getByText('結果を見る');
    fireEvent.click(finishButton);
    
    // 結果画面の確認
    await waitFor(() => {
      expect(screen.getByText('クイズ結果')).toBeInTheDocument();
      expect(screen.getByText('1/3')).toBeInTheDocument();
      expect(screen.getByText('正解率: 33%')).toBeInTheDocument();
    });
  });

  test('回答を選択せずに次の問題に進めないこと', () => {
    // 回答を選択しない状態では次の問題ボタンが無効化されている
    const nextButton = screen.getByText('次の問題');
    expect(nextButton).toBeDisabled();
    
    // 回答を選択すると次の問題ボタンが有効になる
    const option = screen.getByText(/let/);
    fireEvent.click(option);
    
    expect(nextButton).not.toBeDisabled();
  });

  test('プログレスバーが正常に更新されること', async () => {
    // 問題1回答
    const option1 = screen.getByText(/上記すべて/);
    fireEvent.click(option1);
    
    const nextButton1 = screen.getByText('次の問題');
    fireEvent.click(nextButton1);
    
    // 問題2に移動し、プログレスバー更新確認
    await waitFor(() => {
      expect(screen.getByText('2 / 3')).toBeInTheDocument();
    });
    
    // 問題2回答
    const option2 = screen.getByText(/useState/);
    fireEvent.click(option2);
    
    const nextButton2 = screen.getByText('次の問題');
    fireEvent.click(nextButton2);
    
    // 問題3に移動し、プログレスバー更新確認
    await waitFor(() => {
      expect(screen.getByText('3 / 3')).toBeInTheDocument();
    });
    
    // 問題3回答
    const option3 = screen.getByText(/ファイルベースルーティング/);
    fireEvent.click(option3);
    
    const finishButton = screen.getByText('結果を見る');
    fireEvent.click(finishButton);
    
    // 結果画面に到達
    await waitFor(() => {
      expect(screen.getByText('クイズ結果')).toBeInTheDocument();
    });
  });

  test('やり直しボタンが正常に動作すること', async () => {
    // クイズ完了
    await completeQuiz();
    
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
});

// ヘルパー関数
async function completeQuiz() {
  // 問題1
  const option1 = screen.getByText(/上記すべて/);
  fireEvent.click(option1);
  fireEvent.click(screen.getByText('次の問題'));
  
  // 問題2
  await waitFor(() => screen.getByText('2 / 3'));
  const option2 = screen.getByText(/useState/);
  fireEvent.click(option2);
  fireEvent.click(screen.getByText('次の問題'));
  
  // 問題3
  await waitFor(() => screen.getByText('3 / 3'));
  const option3 = screen.getByText(/ファイルベースルーティング/);
  fireEvent.click(option3);
  fireEvent.click(screen.getByText('結果を見る'));
}