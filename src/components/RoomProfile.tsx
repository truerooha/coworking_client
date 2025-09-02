import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import type { Room } from '../App';
import { api } from '../config/api';

interface RoomProfileProps {
  room: Room;
  onBack: () => void;
  onBook: (roomId: string, date: string, startTime: string, endTime: string) => void;
}

export function RoomProfile({ room, onBack, onBook }: RoomProfileProps) {
  // Локальная дата в формате YYYY-MM-DD (без UTC-сдвига)
  const getLocalYMD = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };
  const today = getLocalYMD(new Date());
  
  const [selectedDate, setSelectedDate] = useState(today);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Генерируем следующие 7 дней
  const getDateOptions = (): Array<{ value: string; label: string }> => {
    const dates: Array<{ value: string; label: string }> = [];
    const todayDate = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() + i);
      
      const dateStr = getLocalYMD(date);
      const displayStr = i === 0 ? 'Сегодня' : 
                        i === 1 ? 'Завтра' : 
                        date.toLocaleDateString('ru-RU', { 
                          weekday: 'short', 
                          day: 'numeric',
                          month: 'short'
                        });
      
      dates.push({ value: dateStr, label: displayStr });
    }
    
    return dates;
  };

  // Генерируем временные слоты (9:00 - 23:00 для начала, 9:00 - 00:00 для окончания)
  const getTimeOptions = (): Array<{ value: string; label: string }> => {
    const times: Array<{ value: string; label: string }> = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Время начала: с 9:00 до 23:00
    for (let hour = 9; hour <= 23; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 23 && minute === 30) break; // Заканчиваем в 23:00
        
        // Для сегодняшней даты разрешаем бронирование слота, если текущее время
        // меньше (начало слота + 20 минут). Иначе — обычное правило: только будущие слоты.
        if (selectedDate === today) {
          const candidate = new Date(now);
          const [y, m, d] = selectedDate.split('-').map(Number);
          candidate.setFullYear(y, (m || 1) - 1, d || now.getDate());
          candidate.setHours(hour, minute, 0, 0);

          const candidatePlusGraceMs = candidate.getTime() + 20 * 60 * 1000; // +20 минут
          const nowMs = now.getTime();

          const isFuture = candidate.getTime() > nowMs;
          const withinGrace = nowMs < candidatePlusGraceMs;

          if (!isFuture && !withinGrace) {
            continue;
          }
        }
        
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push({ value: timeStr, label: timeStr });
      }
    }
    return times;
  };

  // Генерируем время окончания (с 9:00 до 00:00)
  const getEndTimeOptions = (): Array<{ value: string; label: string }> => {
    const times: Array<{ value: string; label: string }> = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Время окончания: с 9:00 до 00:00 (следующий день)
    for (let hour = 9; hour <= 23; hour++) {
      for (let minute of [0, 30]) {
        // Если это сегодня и время уже прошло, пропускаем
        if (selectedDate === today) {
          if (hour < currentHour || (hour === currentHour && minute <= currentMinute)) {
            continue;
          }
        }
        
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push({ value: timeStr, label: timeStr });
      }
    }
    // Добавляем 00:00 (полночь) только если это не сегодня
    if (selectedDate !== today) {
      times.push({ value: '00:00', label: '00:00' });
    }
    
    return times;
  };

  // Обработчик смены даты
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    
    // При смене даты сбрасываем выбранные времена
    setStartTime('');
    setEndTime('');
  };

  // Автоматически устанавливаем время окончания через 1 час после начала
  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    
    // Если выбрано время начала, автоматически устанавливаем время окончания
    if (time) {
      const [hours, minutes] = time.split(':').map(Number);
      let endHours = hours + 1;
      let endMinutes = minutes;
      
      // Если время выходит за пределы дня, устанавливаем 00:00
      if (endHours >= 24) {
        setEndTime('00:00');
      } else {
        const endTimeStr = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        setEndTime(endTimeStr);
      }
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast.error('Пожалуйста, выберите дату, время начала и окончания');
      return;
    }

    if (startTime >= endTime) {
      toast.error('Время окончания должно быть позже времени начала');
      return;
    }

    try {
      const raw = localStorage.getItem('currentUser');
      const me = raw ? JSON.parse(raw) : null;
      const userName: string = me?.telegramUsername || me?.name || '';
      if (!userName) {
        toast.error('Не удалось определить пользователя');
        return;
      }
      const res = await fetch(api.bookings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          date: selectedDate,
          startTime,
          endTime,
          userName,
        })
      });

      if (res.status === 409) {
        const data = await res.json();
        toast.error(`Уже забронировано пользователем: ${data.bookedBy}`);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      toast.success('Переговорная успешно забронирована!');
      onBook(room.id, selectedDate, startTime, endTime);
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось создать бронирование');
    }
  };

  const dateOptions = getDateOptions();
  const timeOptions = getTimeOptions();
  const endTimeOptions = getEndTimeOptions();

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
          <h1 className="text-xl font-semibold text-gray-900">Детали переговорной</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Room Image and Basic Info */}
        <Card className="overflow-hidden">
          <div className="relative">
            <ImageWithFallback
              src={room.image}
              alt={room.name}
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-4 right-4">
              <Badge 
                variant={room.isOccupied ? "destructive" : "default"}
                className={`${
                  room.isOccupied 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                {room.isOccupied ? 'Занята' : 'Свободна'}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-4">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">{room.name}</h2>
            <p className="text-gray-600 mb-4">{room.description}</p>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Вместимость: {room.capacity} человек
              </div>
            </div>

            {room.isOccupied && room.currentBooking && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800">Сейчас занята</p>
                <p className="text-sm text-red-600 mt-1">
                  {room.currentBooking.user} • {room.currentBooking.startTime} - {room.currentBooking.endTime}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Form (доступна всегда; сервер проверит конфликты) */}
        (
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-gray-900">Забронировать переговорную</h3>
              <p className="text-sm text-gray-600">Выберите удобную дату и время</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата
                </label>
                <Select value={selectedDate} onValueChange={handleDateChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите дату" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateOptions.map((date) => (
                      <SelectItem key={date.value} value={date.value}>
                        {date.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время начала
                  </label>
                  <Select onValueChange={handleStartTimeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Начало" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время окончания
                  </label>
                  <Select onValueChange={setEndTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Окончание" />
                    </SelectTrigger>
                    <SelectContent>
                      {endTimeOptions.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleBook}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={!selectedDate || !startTime || !endTime}
              >
                Забронировать
              </Button>
            </CardContent>
          </Card>
        )

        {/* Features */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Оснащение</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '🎤', label: 'Аудиосистема' },
                { icon: '💾', label: 'Доска' },
                { icon: '📱', label: 'Видеосвязь' },
                { icon: '❄️', label: 'Кондиционер' }
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <span className="text-lg">{feature.icon}</span>
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}