import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import type { Room } from '../App';

interface RoomProfileProps {
  room: Room;
  onBack: () => void;
  onBook: (roomId: string, date: string, startTime: string, endTime: string) => void;
}

export function RoomProfile({ room, onBack, onBook }: RoomProfileProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');

  // Генерируем следующие 7 дней
  const getDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
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

  // Генерируем временные слоты (9:00 - 18:00)
  const getTimeOptions = () => {
    const times = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 18 && minute === 30) break; // Заканчиваем в 18:00
        
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push({ value: timeStr, label: timeStr });
      }
    }
    return times;
  };

  const handleBook = () => {
    if (!selectedDate || !startTime || !endTime) {
      toast.error('Пожалуйста, выберите дату, время начала и окончания');
      return;
    }

    if (startTime >= endTime) {
      toast.error('Время окончания должно быть позже времени начала');
      return;
    }

    onBook(room.id, selectedDate, startTime, endTime);
    toast.success('Переговорная успешно забронирована!');
  };

  const dateOptions = getDateOptions();
  const timeOptions = getTimeOptions();

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

        {/* Booking Form */}
        {!room.isOccupied && (
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
                <Select onValueChange={setSelectedDate}>
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
                  <Select onValueChange={setStartTime}>
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
                      {timeOptions.map((time) => (
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
        )}

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