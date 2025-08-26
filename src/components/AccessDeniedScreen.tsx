import React from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { Button } from './ui/button';

export function AccessDeniedScreen() {
  const handleContactManager = () => {
    // В реальном приложении здесь можно открыть чат с менеджером или показать контакты
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.close();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Доступ ограничен</h1>
          <p className="text-gray-600 text-center">Извините, у вас нет доступа к системе бронирования</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <h2 className="text-xl font-semibold">Требуется авторизация</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <svg className="w-8 h-8 text-orange-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-orange-800 font-medium mb-2">
                  Ваш аккаунт не добавлен в систему
                </p>
                <p className="text-xs text-orange-700">
                  Для получения доступа обратитесь к менеджеру коворкинга
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">1</span>
                  </div>
                  <p>Свяжитесь с администратором коворкинга</p>
                </div>
                
                <div className="flex items-start space-x-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">2</span>
                  </div>
                  <p>Предоставьте ваш Telegram логин</p>
                </div>
                
                <div className="flex items-start space-x-3 text-sm text-gray-600">
                  <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-blue-600">3</span>
                  </div>
                  <p>Дождитесь активации аккаунта</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-2">Контакты для связи:</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>+7 (999) 123-45-67</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>manager@coworking.ru</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-.896 6.728-.896 6.728-1.268 1.22-2.896 1.22-2.896s-1.321-.895-2.896-1.22l-1.331 2.067c-.161.249-.456.341-.734.341-.208 0-.417-.061-.591-.183-.293-.207-.468-.544-.468-.903V14.5l2.409-1.83c.125-.095.125-.296 0-.39-.125-.095-.331-.095-.456 0L5.954 13.9l-1.052-.386s-.167-.118-.167-.406c0-.289.167-.407.167-.407L12 9.5l7.098 3.201s.167.118.167.407c0 .288-.167.406-.167.406l-1.529.386z"/>
                  </svg>
                  <span>@coworking_manager</span>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleContactManager}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Связаться с менеджером
            </Button>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Обычно активация занимает до 30 минут
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}