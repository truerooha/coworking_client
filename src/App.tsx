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

  type AccessCheckResponse = {
    allowed: boolean;
    isAdmin: boolean;
    name?: string;
    surname?: string;
  };

  // Получение пользователя из Telegram WebApp API
  const getTelegramUser = (): { username: string; firstName: string; lastName: string } | null => {
    try {
      (window as any)?.Telegram?.WebApp?.ready?.();
    } catch {}
    const user = (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user;

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
      
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setCurrentScreen('home');
        setIsLoading(false);
        return;
      }

      // Получаем данные из Telegram
      const telegramUser = getTelegramUser();
      
      if (!telegramUser || !telegramUser.username) {
        setIsLoading(false);
        return;
      }

      // Проверяем доступ на сервере
      try {
        const url = API_BASE_URL ? `${API_BASE_URL}/api/auth/check` : '/api/auth/check';
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: telegramUser.username })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as AccessCheckResponse;
        if (data.allowed) {
          const user: User = {
            id: telegramUser.username,
            name: data.name ?? telegramUser.firstName,
            surname: data.surname ?? telegramUser.lastName,
            telegramUsername: telegramUser.username,
            isAdmin: !!data.isAdmin
          };
          setCurrentUser(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          setCurrentScreen('home');
        } else {
          setCurrentUser(null);
          setCurrentScreen('denied');
        }
      } catch {
        // На ошибке проверки — считаем, что доступа нет
        setCurrentUser(null);
        setCurrentScreen('denied');
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

  const usernameBanner = null;

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
  if (!currentUser) {
      return (
        <div className="min-h-screen bg-background">
        <AccessDeniedScreen />
        <Toaster />
        </div>
      );
  }

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