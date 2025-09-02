import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import type { Booking } from '../App';
import { api } from '../config/api';

interface BookingsScreenProps {
  bookings: Booking[];
  onCancelBooking: (bookingId: string) => void;
}

export function BookingsScreen({ bookings, onCancelBooking }: BookingsScreenProps) {
  const [serverBookings, setServerBookings] = useState([] as Booking[]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // Временный userName — берём из localStorage currentUser
        const raw = localStorage.getItem('currentUser');
        const me = raw ? JSON.parse(raw) : null;
        const userName = me?.name || me?.telegramUsername || '';
        if (!userName) {
          setServerBookings([]);
          setLoading(false);
          return;
        }

        const url = `${api.bookings}/me/upcoming?userName=${encodeURIComponent(userName)}`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setServerBookings(Array.isArray(data.bookings) ? data.bookings : []);
      } catch (e: any) {
        toast.error(e?.message || 'Не удалось загрузить бронирования');
        setServerBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);
  const handleCancelBooking = (booking: Booking) => {
    onCancelBooking(booking.id);
    toast.success(`Бронь ${booking.roomName} отменена`);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Сегодня';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Завтра';
    } else {
      return date.toLocaleDateString('ru-RU', { 
        weekday: 'short', 
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const formatTime = (timeStr: string) => {
    return timeStr;
  };

  const isUpcoming = (dateStr: string, timeStr: string) => {
    const bookingDateTime = new Date(`${dateStr}T${timeStr}`);
    return bookingDateTime > new Date();
  };

  const isPast = (dateStr: string, timeStr: string) => {
    const bookingDateTime = new Date(`${dateStr}T${timeStr}`);
    return bookingDateTime < new Date();
  };

  const source = (serverBookings && serverBookings.length > 0) ? serverBookings : bookings;
  const upcomingBookings = source.filter(b => isUpcoming(b.date, b.endTime));
  const pastBookings = source.filter(b => isPast(b.date, b.endTime));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-2xl font-semibold text-gray-900">Мои брони</h1>
        <p className="text-sm text-gray-600">Управление бронированием переговорных</p>
      </div>

      <div className="p-4 space-y-6">
        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-600">Загружаем ваши бронирования...</p>
            </CardContent>
          </Card>
        )}
        {/* Upcoming Bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Предстоящие</h2>
            {upcomingBookings.length > 0 && (
              <Badge variant="default" className="bg-blue-600">
                {upcomingBookings.length}
              </Badge>
            )}
          </div>

          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Нет предстоящих броней</h3>
                <p className="text-sm text-gray-600">Забронируйте переговорную, чтобы увидеть ваши резервации</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{booking.roomName}</h3>
                          <Badge 
                            variant="default" 
                            className="bg-green-100 text-green-800 hover:bg-green-200"
                          >
                            Активна
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(booking.date)}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelBooking(booking)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        Отменить
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Past Bookings */}
        {pastBookings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Прошедшие</h2>
              <Badge variant="secondary">
                {pastBookings.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {pastBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden opacity-75">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-700">{booking.roomName}</h3>
                          <Badge variant="secondary">
                            Завершена
                          </Badge>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(booking.date)}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Сводка по броням</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-semibold text-blue-600">
                  {upcomingBookings.length}
                </div>
                <div className="text-xs text-gray-600">Предстоящие</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-600">
                  {pastBookings.length}
                </div>
                <div className="text-xs text-gray-600">Завершенные</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-semibold text-gray-900">
                  {bookings.length}
                </div>
                <div className="text-xs text-gray-600">Всего</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}