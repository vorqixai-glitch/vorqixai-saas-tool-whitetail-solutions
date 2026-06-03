/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Residents from './pages/Residents';
import Documents from './pages/Documents';
import Compliance from './pages/Compliance';
import Licensing from './pages/Licensing';
import Settings from './pages/Settings';
import AiAssistant from './pages/AiAssistant';
import Consulting from './pages/Consulting';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';
import AdminClientDetails from './pages/AdminClientDetails';
import { AuthLayout } from './components/AuthLayout';
import { AdminLayout } from './components/AdminLayout';

import AdminLogin from './pages/AdminLogin';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/residents" element={<Residents />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/licensing" element={<Licensing />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          <Route path="/consulting" element={<Consulting />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="clients" element={<AdminDashboard />} />
          <Route path="clients/:id" element={<AdminClientDetails />} />
          <Route path="messages" element={<Messages />} />
          <Route path="settings" element={<div className="p-8 text-white">Admin Settings Coming Soon</div>} />
        </Route>
      </Routes>
    </Router>
  );
}
