import React from 'react';
import { Badge } from './ui/badge';
import type { Screen } from '../App';

interface BottomNavigationProps {
  activeScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  bookingCount: number;
}

export function BottomNavigation({ activeScreen, onScreenChange, bookingCount }: BottomNavigationProps) {
  const tabs = [
    {
      id: 'home' as Screen,
      label: 'Главная',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3zm14 5h-4" />
        </svg>
      )
    },
    {
      id: 'bookings' as Screen,
      label: 'Брони',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      badge: bookingCount > 0 ? bookingCount : undefined
    },
    {
      id: 'profile' as Screen,
      label: 'Профиль',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onScreenChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center py-4 px-1 relative transition-colors ${
              activeScreen === tab.id
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="relative">
              {tab.icon}
              {tab.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-5"
                >
                  {tab.badge}
                </Badge>
              )}
            </div>
            <span className="text-xs mt-1 font-medium">{tab.label}</span>
            
            {activeScreen === tab.id && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}