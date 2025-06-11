'use client'

import { useState, useEffect } from 'react';
import { UserProfile } from '@/lib/session';

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    bio: '',
    avatar: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setEditForm({
          displayName: data.profile.displayName || '',
          bio: data.profile.bio || '',
          avatar: data.profile.avatar || ''
        });
      } else {
        setError('プロフィールの取得に失敗しました');
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        avatar: profile.avatar || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setIsEditing(false);
        setSuccess('プロフィールを更新しました');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'プロフィールの更新に失敗しました');
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">プロフィールを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">プロフィールが見つかりません</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>
            <p className="text-gray-600 mt-1">あなたの学習プロフィール情報</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{error}</p>
            </div>
          )}
          {success && (
            <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">{success}</p>
            </div>
          )}

          {/* Profile Content */}
          <div className="p-6">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                  {profile.avatar ? (
                    <img 
                      src={profile.avatar} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                {!isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {profile.displayName}
                      </h2>
                      <p className="text-gray-600">@{profile.username}</p>
                      <p className="text-gray-600">{profile.email}</p>
                    </div>

                    {profile.bio && (
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">自己紹介</h3>
                        <p className="text-gray-700">{profile.bio}</p>
                      </div>
                    )}

                    <div className="text-sm text-gray-500">
                      <p>登録日: {new Date(profile.createdAt).toLocaleDateString('ja-JP')}</p>
                      <p>更新日: {new Date(profile.updatedAt).toLocaleDateString('ja-JP')}</p>
                    </div>

                    <button
                      onClick={handleEdit}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      プロフィールを編集
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        表示名
                      </label>
                      <input
                        type="text"
                        value={editForm.displayName}
                        onChange={(e) => handleInputChange('displayName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="表示名を入力"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        自己紹介
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="自己紹介を入力"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        アバター URL
                      </label>
                      <input
                        type="url"
                        value={editForm.avatar}
                        onChange={(e) => handleInputChange('avatar', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="アバター画像のURLを入力"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleSave}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                      >
                        保存
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">学習統計</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-gray-600">完了クイズ</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">85%</p>
              <p className="text-gray-600">平均正答率</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">7日</p>
              <p className="text-gray-600">連続学習</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}