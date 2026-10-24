import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './contexts/UserContext';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { Bookings } from './features/bookings/Bookings';
import { BookingForm } from './features/bookings/BookingForm';
import { LeadBoard } from './features/leads/LeadBoard';
import { MarketingDashboard } from './features/marketing/MarketingDashboard';
import { ContentCalendar } from './features/marketing/ContentCalendar';
import { WebsiteCMS } from './features/marketing/WebsiteCMS';
import { AiStudio } from './features/studio/AiStudio';
import { MediaLibrary } from './features/media/MediaLibrary';
import { CampaignBuilder } from './features/campaigns/CampaignBuilder';
import { Customers } from './features/customers/Customers';
import { Operations } from './features/jobs/Operations';
import { Payments } from './features/payments/Payments';
import { Reports } from './features/reports/Reports';
import { Analytics } from './features/analytics/Analytics';
import { Settings } from './features/settings/Settings';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useUser();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
      <Route path="/bookings/new" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><LeadBoard /></ProtectedRoute>} />
      <Route path="/marketing" element={<ProtectedRoute><MarketingDashboard /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><ContentCalendar /></ProtectedRoute>} />
      <Route path="/cms" element={<ProtectedRoute><WebsiteCMS /></ProtectedRoute>} />
      <Route path="/studio" element={<ProtectedRoute><AiStudio /></ProtectedRoute>} />
      <Route path="/media" element={<ProtectedRoute><MediaLibrary /></ProtectedRoute>} />
      <Route path="/campaigns/new" element={<ProtectedRoute><CampaignBuilder /></ProtectedRoute>} />
      <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
      <Route path="/operations" element={<ProtectedRoute><Operations /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
