import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import QuickDemoBar from './components/QuickDemoBar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import RoomsIndex from './pages/RoomsIndex';
import RoomDetail from './pages/RoomDetail';
import BookingFunnel from './pages/BookingFunnel';
import BookingConfirmation from './pages/BookingConfirmation';
import Dining from './pages/Dining';
import Experiences from './pages/Experiences';
import ExperienceDetail from './pages/ExperienceDetail';
import Gallery from './pages/Gallery';
import Offers from './pages/Offers';
import BlogIndex from './pages/BlogIndex';
import BlogShow from './pages/BlogShow';
import About from './pages/About';
import Faqs from './pages/Faqs';
import Contact from './pages/Contact';
import AuthLogin from './pages/AuthLogin';
import AuthRegister from './pages/AuthRegister';
import GuestDashboard from './pages/GuestDashboard';
import ReceptionDashboard from './pages/ReceptionDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Helper component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Protected Route Guard
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-[#A6ADA1]">Verifying credentials...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto py-24 text-center space-y-4 px-4">
        <h2 className="text-xl font-bold text-rose-400">Access Restricted</h2>
        <p className="text-xs text-[#A6ADA1]">Your current account ({user.role}) does not have permission to access this area.</p>
        <Navigate to="/" replace />
      </div>
    );
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen bg-[#2C332C] text-[#EAEBE8] antialiased">
          
          {/* Top Demo Bar with instant 1-click test role logins */}
          <QuickDemoBar />

          {/* Main Luxury Navigation Bar */}
          <Navbar />

          {/* Routed Main View */}
          <main className="flex-1">
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<RoomsIndex />} />
              <Route path="/accommodations" element={<Navigate to="/rooms" replace />} />
              <Route path="/rooms/:slug" element={<RoomDetail />} />
              <Route path="/book" element={<BookingFunnel />} />
              <Route path="/booking/:bookingNumber/confirmation" element={<BookingConfirmation />} />
              <Route path="/dining" element={<Dining />} />
              <Route path="/experiences" element={<Experiences />} />
              <Route path="/experiences/:id" element={<ExperienceDetail />} />
              <Route path="/amenities" element={<Navigate to="/experiences" replace />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/offers" element={<Offers />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogShow />} />
              <Route path="/about" element={<About />} />
              <Route path="/faqs" element={<Faqs />} />
              <Route path="/policies" element={<Faqs />} />
              <Route path="/contact" element={<Contact />} />

              {/* Authentication */}
              <Route path="/login" element={<AuthLogin />} />
              <Route path="/register" element={<AuthRegister />} />

              {/* Protected Portals */}
              <Route
                path="/guest"
                element={
                  <ProtectedRoute allowedRoles={['guest', 'admin', 'reception']}>
                    <GuestDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reception"
                element={
                  <ProtectedRoute allowedRoles={['reception', 'admin']}>
                    <ReceptionDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Luxury Footer */}
          <Footer />

        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
