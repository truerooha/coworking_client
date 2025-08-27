import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import type { Room } from '../App';

interface HomeScreenProps {
  rooms: Room[];
  onRoomSelect: (room: Room) => void;
}

export function HomeScreen({ rooms, onRoomSelect }: HomeScreenProps) {
  const currentTime = new Date().toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Переговорные</h1>
            <p className="text-sm text-gray-600">Текущее время: {currentTime}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Свободна</span>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Занята</span>
            </div>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="p-4 space-y-4">
        {rooms.map((room) => (
          <Card 
            key={room.id} 
            className="overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onRoomSelect(room)}
          >
            <div className="relative">
              <ImageWithFallback
                src={room.image}
                alt={room.name}
                className="w-full h-48 object-cover"
              />
              
              {/* Status overlay */}
              <div className="absolute top-3 right-3">
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

              {/* Capacity badge */}
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-white/90 text-gray-800">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {room.capacity}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{room.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{room.description}</p>
                  
                  {room.isOccupied && room.currentBooking && (
                    <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                      <p className="font-medium">Сейчас занята</p>
                      <p>{room.currentBooking.user} • {room.currentBooking.startTime} - {room.currentBooking.endTime}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Button
                  size="sm"
                  variant={room.isOccupied ? "outline" : "default"}
                  className={room.isOccupied ? "ml-auto text-gray-600" : "ml-auto bg-blue-600 hover:bg-blue-700"}
                  disabled={room.isOccupied}
                >
                  {room.isOccupied ? 'Подробнее' : 'Забронировать'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick stats */}
      <div className="px-4 pb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-3">Сводка</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {rooms.filter(r => !r.isOccupied).length}
              </div>
              <div className="text-xs text-gray-600">Свободно</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-red-600">
                {rooms.filter(r => r.isOccupied).length}
              </div>
              <div className="text-xs text-gray-600">Занято</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900">
                {rooms.length}
              </div>
              <div className="text-xs text-gray-600">Всего</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}