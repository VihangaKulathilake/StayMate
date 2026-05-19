import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from '../pages/landing/LandingPage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ClientHome from '../pages/dashboard/ClientHome';
import Dashboard from '../pages/dashboard/Dashboard';
import Boardings from '../pages/boarding/Boardings';
import AddBoarding from '../pages/boarding/AddBoarding';
import EditBoarding from '../pages/boarding/EditBoarding';
import Tenants from '../pages/tenant/Tenants';
import AddTenant from '../pages/tenant/AddTenant';
import Payments from '../pages/payment/Payments';
import Marketplace from '../pages/client/Marketplace';
import BoardingDetails from '../pages/client/BoardingDetails';
import RoomDetails from '../pages/client/RoomDetails';
import MyBookings from '../pages/client/MyBookings';
import ContactHub from '../pages/client/ContactHub';
import Profile from '../pages/client/Profile';
import NotFound from '../NotFound';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminLandlords from '../pages/admin/AdminLandlords';
import AdminTenants from '../pages/admin/AdminTenants';
import AdminBoardings from '../pages/admin/AdminBoardings';
import AdminUserDetails from '../pages/admin/AdminUserDetails';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/register" element={<Register />} />

            {/* User/Client Routes */}
            <Route element={<ProtectedRoute allowedRoles={["tenant"]} />}>
                <Route path="/client-home" element={<ClientHome />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/boarding/:id" element={<BoardingDetails />} />
                <Route path="/boarding/:id/room/:roomId" element={<RoomDetails />} />
                <Route path="/my-bookings" element={<MyBookings />} />
            </Route>

            {/* Admin/Dashboard Routes */}
            <Route element={<ProtectedRoute allowedRoles={["landlord"]} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/boardings" element={<Boardings />} />
                <Route path="/boardings/add" element={<AddBoarding />} />
                <Route path="/boardings/edit/:id" element={<EditBoarding />} />
                <Route path="/tenants" element={<Tenants />} />
                <Route path="/tenants/add" element={<AddTenant />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["tenant", "landlord"]} />}>
                <Route path="/payments" element={<Payments />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["tenant", "landlord", "admin"]} />}>
                <Route path="/profile" element={<Profile />} />
                <Route path="/contact" element={<ContactHub />} />
            </Route>

            {/* Platform Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/landlords" element={<AdminLandlords />} />
                <Route path="/admin/tenants" element={<AdminTenants />} />
                <Route path="/admin/boardings" element={<AdminBoardings />} />
                <Route path="/admin/users/:id" element={<AdminUserDetails />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}
