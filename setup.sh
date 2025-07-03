#!/bin/bash

echo "🚀 Setting up School Attendance System with New Features"
echo "=================================================="

# Backend setup
echo "📦 Installing Backend Dependencies..."
cd backend
go mod tidy
echo "✅ Backend dependencies installed"

# Frontend setup
echo "📦 Installing Frontend Dependencies..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

# Mobile app setup
echo "📦 Installing Mobile App Dependencies..."
cd ../mobile-app
npm install
echo "✅ Mobile app dependencies installed"

cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================================================="
echo ""
echo "📋 To run the system:"
echo ""
echo "1. Start Backend (Terminal 1):"
echo "   cd backend && go run main.go"
echo ""
echo "2. Start Frontend (Terminal 2):"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Start Mobile App (Terminal 3):"
echo "   cd mobile-app && npx expo start"
echo ""
echo "🌐 URLs:"
echo "   - Backend API: http://localhost:8080"
echo "   - Frontend Web: http://localhost:3000"
echo "   - WebSocket: ws://localhost:8080/ws"
echo ""
echo "👤 Default Admin Login:"
echo "   - Email: admin@school.com"
echo "   - Password: admin123"
echo ""
echo "🔧 New Features Implemented:"
echo "   ✅ Real-time Notifications (WebSocket)"
echo "   ✅ QR Code-based Attendance System"
echo "   ✅ PDF/Excel Report Export"
echo "   ✅ Enhanced Analytics Dashboard"
echo "   ✅ Parent Notification System"
echo "   ✅ React Native Mobile App"
echo "   ✅ External System Integration"
echo ""
echo "📱 Mobile App Features:"
echo "   - QR Code Scanner for attendance"
echo "   - Real-time notifications"
echo "   - Attendance dashboard"
echo "   - Secure authentication"
echo ""
echo "📊 Analytics Features:"
echo "   - Interactive charts and graphs"
echo "   - Real-time attendance statistics"
echo "   - Exportable reports (PDF/Excel)"
echo "   - Class and student performance metrics"
echo ""
echo "🔔 Notification Features:"
echo "   - Real-time WebSocket notifications"
echo "   - Parent alert system"
echo "   - Push notifications on mobile"
echo "   - Email and SMS integration ready"
echo ""
echo "Happy coding! 🎯"