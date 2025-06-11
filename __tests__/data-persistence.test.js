import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// モックデータ保存機能のテスト
// 現在はlocalStorageベースの実装をシミュレート
describe('Data Persistence Tests - データ保存統合テスト', () => {
  let localStorageMock;

  beforeEach(() => {
    // localStorage のモック
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    global.localStorage = localStorageMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('クイズ結果がlocalStorageに正しく保存されること', () => {
    const quizResult = {
      score: 3,
      totalQuestions: 3,
      answers: [
        { questionId: 1, selectedAnswer: 2, isCorrect: true },
        { questionId: 2, selectedAnswer: 0, isCorrect: true },
        { questionId: 3, selectedAnswer: 1, isCorrect: true }
      ],
      completedAt: new Date().toISOString(),
      timeTaken: 120000 // 2分
    };

    // データ保存のシミュレート
    const saveQuizResult = (result) => {
      const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
      existingResults.push(result);
      localStorage.setItem('quizResults', JSON.stringify(existingResults));
    };

    saveQuizResult(quizResult);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'quizResults',
      JSON.stringify([quizResult])
    );
  });

  test('複数のクイズ結果が正しく蓄積されること', () => {
    const existingResults = [
      { score: 2, totalQuestions: 3, completedAt: '2024-01-01T10:00:00Z' },
      { score: 1, totalQuestions: 3, completedAt: '2024-01-02T10:00:00Z' }
    ];

    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingResults));

    const newResult = {
      score: 3,
      totalQuestions: 3,
      completedAt: '2024-01-03T10:00:00Z'
    };

    const saveQuizResult = (result) => {
      const existing = JSON.parse(localStorage.getItem('quizResults') || '[]');
      existing.push(result);
      localStorage.setItem('quizResults', JSON.stringify(existing));
    };

    saveQuizResult(newResult);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'quizResults',
      JSON.stringify([...existingResults, newResult])
    );
  });

  test('学習進捗データが正しく保存・更新されること', () => {
    const progressData = {
      totalQuizzes: 12,
      completedQuizzes: 8,
      currentStreak: 5,
      totalPoints: 850,
      lastPlayedDate: new Date().toISOString(),
      averageScore: 87
    };

    const saveProgressData = (data) => {
      localStorage.setItem('learningProgress', JSON.stringify(data));
    };

    saveProgressData(progressData);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'learningProgress',
      JSON.stringify(progressData)
    );
  });

  test('連続学習日数が正しく計算・保存されること', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 昨日のプレイ記録があるケース
    const existingProgress = {
      currentStreak: 4,
      lastPlayedDate: yesterday.toISOString()
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingProgress));

    const updateStreak = () => {
      const existing = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      const lastPlayed = new Date(existing.lastPlayedDate || 0);
      const daysDiff = Math.floor((today - lastPlayed) / (1000 * 60 * 60 * 24));

      let newStreak;
      if (daysDiff === 1) {
        // 連続日
        newStreak = (existing.currentStreak || 0) + 1;
      } else if (daysDiff === 0) {
        // 同日
        newStreak = existing.currentStreak || 1;
      } else {
        // 連続途切れ
        newStreak = 1;
      }

      const updatedProgress = {
        ...existing,
        currentStreak: newStreak,
        lastPlayedDate: today.toISOString()
      };

      localStorage.setItem('learningProgress', JSON.stringify(updatedProgress));
      return newStreak;
    };

    const streak = updateStreak();

    expect(streak).toBe(5); // 4 + 1
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  test('ユーザー設定が正しく保存・読み込みされること', () => {
    const userSettings = {
      theme: 'dark',
      soundEnabled: true,
      difficulty: 'medium',
      preferredCategories: ['javascript', 'react', 'nextjs']
    };

    const saveUserSettings = (settings) => {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    };

    const loadUserSettings = () => {
      const settings = localStorage.getItem('userSettings');
      return settings ? JSON.parse(settings) : {};
    };

    // 保存
    saveUserSettings(userSettings);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'userSettings',
      JSON.stringify(userSettings)
    );

    // 読み込み
    localStorageMock.getItem.mockReturnValue(JSON.stringify(userSettings));
    const loadedSettings = loadUserSettings();
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('userSettings');
    expect(loadedSettings).toEqual(userSettings);
  });

  test('データのバックアップとリストア機能が正常に動作すること', () => {
    const backupData = {
      quizResults: [
        { score: 3, totalQuestions: 3, completedAt: '2024-01-01T10:00:00Z' }
      ],
      learningProgress: {
        totalQuizzes: 10,
        completedQuizzes: 5,
        currentStreak: 3
      },
      userSettings: {
        theme: 'light',
        soundEnabled: false
      }
    };

    // バックアップ作成
    const createBackup = () => {
      const quizResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
      const learningProgress = JSON.parse(localStorage.getItem('learningProgress') || '{}');
      const userSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');

      return {
        quizResults,
        learningProgress,
        userSettings,
        exportedAt: new Date().toISOString()
      };
    };

    // リストア実行
    const restoreBackup = (backup) => {
      localStorage.setItem('quizResults', JSON.stringify(backup.quizResults));
      localStorage.setItem('learningProgress', JSON.stringify(backup.learningProgress));
      localStorage.setItem('userSettings', JSON.stringify(backup.userSettings));
    };

    // モックデータ設定
    localStorageMock.getItem
      .mockReturnValueOnce(JSON.stringify(backupData.quizResults))
      .mockReturnValueOnce(JSON.stringify(backupData.learningProgress))
      .mockReturnValueOnce(JSON.stringify(backupData.userSettings));

    const backup = createBackup();
    expect(backup.quizResults).toEqual(backupData.quizResults);

    // リストアテスト
    restoreBackup(backupData);
    expect(localStorageMock.setItem).toHaveBeenCalledTimes(3);
  });

  test('データ整合性チェックが正常に動作すること', () => {
    const validateData = (data) => {
      const errors = [];

      // クイズ結果の検証
      if (data.quizResults) {
        data.quizResults.forEach((result, index) => {
          if (!result.score && result.score !== 0) {
            errors.push(`quizResults[${index}]: score is required`);
          }
          if (!result.totalQuestions) {
            errors.push(`quizResults[${index}]: totalQuestions is required`);
          }
          if (result.score > result.totalQuestions) {
            errors.push(`quizResults[${index}]: score cannot exceed totalQuestions`);
          }
        });
      }

      // 学習進捗の検証
      if (data.learningProgress) {
        const progress = data.learningProgress;
        if (progress.completedQuizzes > progress.totalQuizzes) {
          errors.push('learningProgress: completedQuizzes cannot exceed totalQuizzes');
        }
        if (progress.currentStreak < 0) {
          errors.push('learningProgress: currentStreak cannot be negative');
        }
      }

      return errors;
    };

    // 正常なデータ
    const validData = {
      quizResults: [{ score: 2, totalQuestions: 3 }],
      learningProgress: { totalQuizzes: 10, completedQuizzes: 5, currentStreak: 3 }
    };

    expect(validateData(validData)).toEqual([]);

    // 異常なデータ
    const invalidData = {
      quizResults: [{ score: 5, totalQuestions: 3 }], // スコアが問題数を超過
      learningProgress: { totalQuizzes: 5, completedQuizzes: 10, currentStreak: -1 } // 異常値
    };

    const errors = validateData(invalidData);
    expect(errors).toContain('quizResults[0]: score cannot exceed totalQuestions');
    expect(errors).toContain('learningProgress: completedQuizzes cannot exceed totalQuizzes');
    expect(errors).toContain('learningProgress: currentStreak cannot be negative');
  });

  test('データ容量制限と古いデータの自動削除が正常に動作すること', () => {
    const MAX_RESULTS = 100;
    
    const manageStorageSize = () => {
      const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
      
      if (results.length > MAX_RESULTS) {
        // 古いデータから削除（日付順でソート後、先頭から削除）
        results.sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
        const trimmedResults = results.slice(-MAX_RESULTS);
        localStorage.setItem('quizResults', JSON.stringify(trimmedResults));
        return trimmedResults.length;
      }
      
      return results.length;
    };

    // 101件のモックデータを作成
    const manyResults = Array.from({ length: 101 }, (_, i) => ({
      score: i % 4,
      totalQuestions: 3,
      completedAt: new Date(2024, 0, i + 1).toISOString()
    }));

    localStorageMock.getItem.mockReturnValue(JSON.stringify(manyResults));

    const remainingCount = manageStorageSize();

    expect(remainingCount).toBe(100);
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'quizResults',
      expect.stringContaining('2024-04-11') // 最新の100件が保持される
    );
  });
});