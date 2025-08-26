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
  const [currentScreen, setCurrentScreen] = useState<Screen>('denied');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Список разрешенных Telegram логинов (в реальном приложении будет в базе данных)
  const [allowedTelegramUsers] = useState<string[]>([
    'johndoe123',
    'jane_smith',
    'admin_user'
  ]);

  // Список администраторов
  const [adminUsers] = useState<string[]>([
    'admin_user'
  ]);

  // Mock данные комнат
  const [rooms] = useState<Room[]>([
    {
      id: '1',
      name: 'Конференц-зал',
      image: 'https://i.postimg.cc/WtpDfQPt/room.jpg',
      capacity: 10,
      description: 'Большой конференц-зал с видеоконференцсвязью',
      isOccupied: false,
    },
    {
      id: '2', 
      name: 'Zoom room 1',
      image: 'https://i.postimg.cc/8JNFGYJK/zoom1.jpg',
      capacity: 1,
      description: 'Уютная комната для видеозвонков',
      isOccupied: true,
      currentBooking: {
        user: 'Иван Петров',
        startTime: '14:00',
        endTime: '15:30'
      }
    },
    {
      id: '3',
      name: 'Zoom room 2',
      image: 'https://i.postimg.cc/8JNFGYJK/zoom1.jpg',
      capacity: 1,
      description: 'Уютная комната для видеозвонков',
      isOccupied: false,
    }
  ]);

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      roomId: '1',
      roomName: 'Конференц-зал А',
      userId: 'user1',
      date: '2025-08-23',
      startTime: '10:00',
      endTime: '11:30',
      status: 'active'
    },
    {
      id: '2',
      roomId: '3',
      roomName: 'Творческая студия',
      userId: 'user1',
      date: '2025-08-24',
      startTime: '14:00',
      endTime: '16:00',
      status: 'active'
    }
  ]);

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

  // Проверка авторизации при загрузке
  useEffect(() => {
    const checkAuthorization = async () => {
      setIsLoading(true);
      
      // Проверяем сохраненного пользователя
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

      // Проверяем доступ пользователя
      if (allowedTelegramUsers.includes(telegramUser.username)) {
        const user: User = {
          id: telegramUser.username,
          name: telegramUser.firstName,
          surname: telegramUser.lastName,
          telegramUsername: telegramUser.username,
          isAdmin: adminUsers.includes(telegramUser.username)
        };
        
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentScreen('home');
      }
      
      setIsLoading(false);
    };

    checkAuthorization();
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
    const room = rooms.find(r => r.id === roomId);
    if (!room || !currentUser) return;

    const newBooking: Booking = {
      id: Date.now().toString(),
      roomId,
      roomName: room.name,
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

  // Загрузка
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Нет доступа
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
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