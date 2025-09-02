import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { api } from '../config/api';

interface AdminPanelProps {
  onBack: () => void;
}

interface User {
  username: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UsersListProps {
  isLoading: boolean;
  allowedUsers: string[];
  adminUsers: string[];
  onToggleAdmin: (username: string) => void;
  onRemoveUser: (username: string) => void;
}

function UsersList({ isLoading, allowedUsers, adminUsers, onToggleAdmin, onRemoveUser }: UsersListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        <span className="text-gray-600">Загрузка пользователей...</span>
      </div>
    );
  }

  if (allowedUsers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Пользователи не найдены</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {allowedUsers.map((telegramLogin, index) => (
        <div key={telegramLogin}>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {telegramLogin.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">
                    @{telegramLogin}
                  </p>
                  {adminUsers.includes(telegramLogin) && (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                      Админ
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">Telegram пользователь</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onToggleAdmin(telegramLogin)}
                className={adminUsers.includes(telegramLogin) ? "text-purple-600 hover:text-purple-700" : "text-blue-600 hover:text-blue-700"}
              >
                {adminUsers.includes(telegramLogin) ? 'Убрать админа' : 'Сделать админом'}
              </Button>
              
              {!adminUsers.includes(telegramLogin) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveUser(telegramLogin)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              )}
            </div>
          </div>
          {index < allowedUsers.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}

export function AdminPanel({ onBack }: AdminPanelProps) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newTelegramLogin, setNewTelegramLogin] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Получаем список пользователей с сервера
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(api.auth.users);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        toast.error('Сервер недоступен. Проверьте подключение к интернету.');
      } else {
        toast.error(`Ошибка при загрузке пользователей: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      // Устанавливаем пустой массив в случае ошибки
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Загружаем пользователей при монтировании компонента
  React.useEffect(() => {
    fetchUsers();
  }, []);

  // Получаем списки для совместимости с существующим кодом
  const allowedUsers = users.map(user => user.username);
  const adminUsers = users.filter(user => user.isAdmin).map(user => user.username);

  const handleAddTelegramUser = async (e: any) => {
    e.preventDefault();
    
    const cleanLogin = newTelegramLogin.replace('@', '').trim();
    
    if (!cleanLogin) {
      toast.error('Введите Telegram логин');
      return;
    }

    if (allowedUsers.includes(cleanLogin)) {
      toast.error('Пользователь уже есть в списке');
      return;
    }

    setIsAddingUser(true);

    try {
      const response = await fetch(api.auth.users, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: cleanLogin,
          isAdmin: false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user');
      }

      toast.success(`Пользователь @${cleanLogin} добавлен в систему`);
      setNewTelegramLogin('');
      setIsDialogOpen(false);
      
      // Обновляем список пользователей
      await fetchUsers();
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error(`Ошибка при добавлении пользователя: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleRemoveUser = async (telegramLogin: string) => {
    if (adminUsers.includes(telegramLogin)) {
      toast.error('Нельзя удалить администратора');
      return;
    }

    try {
      // Здесь нужно добавить endpoint для удаления пользователей на сервере
      // Пока что просто обновляем локальное состояние
      setUsers(prev => prev.filter(user => user.username !== telegramLogin));
      toast.success(`Пользователь @${telegramLogin} удален из системы`);
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Ошибка при удалении пользователя');
    }
  };

  const toggleAdminStatus = async (telegramLogin: string) => {
    try {
      // Здесь нужно добавить endpoint для обновления статуса админа на сервере
      // Пока что просто обновляем локальное состояние
      setUsers(prev => prev.map(user => 
        user.username === telegramLogin 
          ? { ...user, isAdmin: !user.isAdmin }
          : user
      ));
      
      const isCurrentlyAdmin = adminUsers.includes(telegramLogin);
      if (isCurrentlyAdmin) {
        toast.success(`@${telegramLogin} больше не администратор`);
      } else {
        toast.success(`@${telegramLogin} получил права администратора`);
      }
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast.error('Ошибка при изменении статуса администратора');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack}
            className="p-2 -ml-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Панель администратора</h1>
            <p className="text-sm text-gray-600">Управление пользователями и системой</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Обзор системы</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600">
                  {isLoading ? '...' : allowedUsers.length}
                </div>
                <div className="text-xs text-gray-600">Всего пользователей</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-purple-600">
                  {isLoading ? '...' : adminUsers.length}
                </div>
                <div className="text-xs text-gray-600">Администраторов</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-green-600">
                  4
                </div>
                <div className="text-xs text-gray-600">Переговорных</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Управление доступом</h3>
              <div className="flex space-x-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Добавить пользователя
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Добавить Telegram пользователя</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddTelegramUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="telegram">Telegram логин</Label>
                      <Input
                        id="telegram"
                        value={newTelegramLogin}
                        onChange={(e) => setNewTelegramLogin(e.target.value)}
                        placeholder="username или @username"
                        disabled={isAddingUser}
                      />
                      <p className="text-xs text-gray-600">
                        Введите логин пользователя Telegram без символа @ или с ним
                      </p>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Примечание:</strong> Пользователь сможет войти в приложение только после добавления его логина в этот список.
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isAddingUser}
                      >
                        Отмена
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        disabled={isAddingUser}
                      >
                        {isAddingUser ? 'Добавление...' : 'Добавить'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Только пользователи из этого списка могут получить доступ к приложению. 
              Данные загружаются с сервера MongoDB.
            </p>
          </CardHeader>
          <CardContent>
            <UsersList 
              isLoading={isLoading}
              allowedUsers={allowedUsers}
              adminUsers={adminUsers}
              onToggleAdmin={toggleAdminStatus}
              onRemoveUser={handleRemoveUser}
            />
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Настройки системы</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Уведомления о бронях</p>
                <p className="text-sm text-gray-600">Отправка напоминаний о предстоящих бронях</p>
              </div>
              <Button variant="outline" size="sm">
                Настроить
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Доступность переговорных</p>
                <p className="text-sm text-gray-600">Управление расписанием и техобслуживанием</p>
              </div>
              <Button variant="outline" size="sm">
                Управлять
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Ограничения бронирования</p>
                <p className="text-sm text-gray-600">Настройка максимальной длительности и заблаговременности броней</p>
              </div>
              <Button variant="outline" size="sm">
                Настроить
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Инструкция для пользователей</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">1</span>
                </div>
                <p>Пользователь должен быть добавлен в список разрешенных Telegram логинов</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">2</span>
                </div>
                <p>При входе через Telegram Mini App происходит автоматическая авторизация</p>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-blue-600">3</span>
                </div>
                <p>Если пользователя нет в списке - показывается экран с отказом в доступе</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}