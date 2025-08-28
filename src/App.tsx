import React, { useState, useEffect } from 'react';
import { AccessDeniedScreen } from './components/AccessDeniedScreen';
import { HomeScreen } from './components/HomeScreen';
import { RoomProfile } from './components/RoomProfile';
import { BookingsScreen } from './components/BookingsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AdminPanel } from './components/AdminPanel';
import { BottomNavigation } from './components/BottomNavigation';
import { Toaster } from './components/ui/sonner';

export type User = {
  id: string;
  name: string;
  surname: string;
  telegramUsername: string;
  isAdmin: boolean;
};

export type Room = {
  id: string;
  name: string;
  image: string;
  capacity: number;
  description: string;
  isOccupied: boolean;
  currentBooking?: {
    user: string;
    startTime: string;
    endTime: string;
  };
};

export type Booking = {
  id: string;
  roomId: string;
  roomName: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'cancelled';
};

export type Screen = 'denied' | 'home' | 'room' | 'bookings' | 'profile' | 'admin';

export default function App() {
  const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  const [currentScreen, setCurrentScreen] = useState<Screen>('denied');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [telegramUsername, setTelegramUsername] = useState<string | null>(null);

  const normalizeUsername = (value: string | null | undefined): string => {
    if (!value) return '';
    return value.replace(/^@/, '').trim().toLowerCase();
  };

  // Список разрешенных Telegram логинов (в реальном приложении будет в базе данных)
  const [allowedTelegramUsers] = useState<string[]>([
    'true_rooha',
    'jane_smith',
    'admin_user'
  ].map(u => u.toLowerCase()));

  // Список администраторов
  const [adminUsers] = useState<string[]>([
    'true_rooha'
  ].map(u => u.toLowerCase()));

  // Давай это пока закомментим и заменим реальным получением пользователя
  /*
  // Имитация получения данных пользователя из Telegram
  const getTelegramUser = (): { username: string; firstName: string; lastName: string } | null => {
    // В реальном приложении здесь будет Telegram WebApp API
    // window.Telegram.WebApp.initDataUnsafe?.user
    
    // Mock данные для демонстрации
    const mockTelegramUsers = [
      { username: 'johndoe123', firstName: 'Иван', lastName: 'Петров' },
      { username: 'jane_smith', firstName: 'Анна', lastName: 'Смирнова' },
      { username: 'true_rooha', firstName: 'Администратор', lastName: 'Системы' },
      { username: 'unauthorized_user', firstName: 'Неавторизованный', lastName: 'Пользователь' }
    ];
    
    // Симулируем случайного пользователя для демо
    return mockTelegramUsers[Math.floor(Math.random() * mockTelegramUsers.length)];
  };
  */

  // Получение пользователя из Telegram WebApp API
  const getTelegramUser = (): { username: string; firstName: string; lastName: string } | null => {
    try {
      // Сигнал Telegram, что WebApp готов (idempotent)
      (window as any)?.Telegram?.WebApp?.ready?.();
    } catch {}

    const user = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user as
      | { id?: number; username?: string; first_name?: string; last_name?: string }
      | undefined;

    if (user && (user.username || user.first_name || user.last_name)) {
      return {
        username: user.username || String(user.id || ''),
        firstName: user.first_name || '',
        lastName: user.last_name || ''
      };
    }

    // Fallback для локальной отладки: берём из query-параметров
    const params = new URLSearchParams(window.location.search);
    const qpUsername = params.get('tg_username') || undefined;
    const qpFirst = params.get('tg_first_name') || undefined;
    const qpLast = params.get('tg_last_name') || undefined;
    const qpId = params.get('tg_id') || undefined;
    if (qpUsername || qpFirst || qpLast || qpId) {
      return {
        username: qpUsername || qpId || '',
        firstName: qpFirst || '',
        lastName: qpLast || ''
      };
    }

    return null;
  };

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuthorization = async () => {
      setIsLoading(true);
      
      // // Проверяем сохраненного пользователя
      // const savedUser = localStorage.getItem('currentUser');
      // if (savedUser) {
      //   const user = JSON.parse(savedUser);
      //   setCurrentUser(user);
      //   setCurrentScreen('home');
      //   setIsLoading(false);
      //   return;
      // }

      // Получаем данные из Telegram
      const telegramUser = getTelegramUser();
      const normalized = normalizeUsername(telegramUser?.username);
      console.log('telegramUser.username:', telegramUser?.username, 'normalized:', normalized);
      if (normalized) {
        setTelegramUsername(normalized);
      }
      
      if (!telegramUser || !normalized) {
        setIsLoading(false);
        return;
      }

      // Проверяем доступ пользователя
      if (allowedTelegramUsers.includes(normalized)) {
        const user: User = {
          id: normalized,
          name: telegramUser.firstName,
          surname: telegramUser.lastName,
          telegramUsername: normalized,
          isAdmin: adminUsers.includes(normalized)
        };
        
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentScreen('home');
      }
      
      setIsLoading(false);
    };

    checkAuthorization();
  }, []);

  // Загрузить комнаты с API
  useEffect(() => {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/rooms` : '/api/rooms';
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Room[]) => setRooms(data))
      .catch(() => setRooms([]));
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentScreen('denied');
    setShowAdmin(false);
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setCurrentScreen('room');
  };

  const handleBookRoom = (roomId: string, date: string, startTime: string, endTime: string) => {
    if (!currentUser) return;
    const roomName = selectedRoom && selectedRoom.id === roomId ? selectedRoom.name : 'Room';

    const newBooking: Booking = {
      id: Date.now().toString(),
      roomId,
      roomName,
      userId: currentUser.id,
      date,
      startTime,
      endTime,
      status: 'active'
    };

    setBookings(prev => [...prev, newBooking]);
    setCurrentScreen('bookings');
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { ...booking, status: 'cancelled' }
          : booking
      )
    );
  };

  const userBookings = bookings.filter(b => b.userId === currentUser?.id && b.status === 'active');

  const usernameBanner = telegramUsername ? (
    <div className="fixed top-2 right-2 z-50 bg-black/70 text-white text-xs px-3 py-1 rounded-md shadow">
      TG: {telegramUsername}
    </div>
  ) : null;

  // Загрузка
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
        {usernameBanner}
      </div>
    );
  }

  // // Нет доступа
  // if (!currentUser) {
  //   return (
  //     <div className="min-h-screen bg-background">
  //       <AccessDeniedScreen />
  //       <Toaster />
  //       {usernameBanner}
  //     </div>
  //   );
  // }

  // Админ панель
  if (showAdmin && currentUser?.isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <AdminPanel onBack={() => setShowAdmin(false)} />
        <Toaster />
        {usernameBanner}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {usernameBanner}
      {currentScreen === 'home' && (
        <HomeScreen 
          rooms={rooms}
          onRoomSelect={handleRoomSelect}
        />
      )}
      
      {currentScreen === 'room' && selectedRoom && (
        <RoomProfile 
          room={selectedRoom}
          onBack={() => setCurrentScreen('home')}
          onBook={handleBookRoom}
        />
      )}
      
      {currentScreen === 'bookings' && (
        <BookingsScreen 
          bookings={userBookings}
          onCancelBooking={handleCancelBooking}
        />
      )}
      
      {currentScreen === 'profile' && currentUser && (
        <ProfileScreen 
          user={currentUser}
          onLogout={handleLogout}
          onAdminAccess={currentUser.isAdmin ? () => setShowAdmin(true) : undefined}
        />
      )}

      <BottomNavigation 
        activeScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        bookingCount={userBookings.length}
      />
      
      <Toaster />
    </div>
  );
}