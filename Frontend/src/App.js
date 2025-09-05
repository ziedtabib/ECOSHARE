import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
// import TestComponent from './components/TestComponent'; // Plus utilisé

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import EmailConfirmationPage from './pages/auth/EmailConfirmationPage';
import EmailConfirmationCodePage from './pages/auth/EmailConfirmationCodePage';
import ResetPasswordCodePage from './pages/auth/ResetPasswordCodePage';
import EmailConfirmationPendingPage from './pages/auth/EmailConfirmationPendingPage';

import ObjectsPage from './pages/ObjectsPage';
import ObjectDetailPage from './pages/ObjectDetailPage';
import CreateObjectPage from './pages/CreateObjectPage';

import FoodsPage from './pages/FoodsPage';
import FoodDetailPage from './pages/FoodDetailPage';
import CreateFoodPage from './pages/CreateFoodPage';

import AssociationsPage from './pages/AssociationsPage';
import AssociationDetailPage from './pages/AssociationDetailPage';
import CreateAssociationPage from './pages/CreateAssociationPage';

import PostsPage from './pages/PostsPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import ContactPage from './pages/ContactPage';


import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import WishlistPage from './pages/WishlistPage';
import LeaderboardPage from './pages/LeaderboardPage';
import DeliveryTrackingPage from './pages/DeliveryTrackingPage';
import ContractsPage from './pages/ContractsPage';
import ContractDetailPage from './pages/ContractDetailPage';

import NotFoundPage from './pages/NotFoundPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Hooks
import { useAuth } from './contexts/AuthContext';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>ECOSHARE - Partagez, Réutilisez, Durable</title>
        <meta name="description" content="Plateforme de partage d'objets et d'aliments pour promouvoir la durabilité et créer une communauté d'entraide." />
      </Helmet>

      <Routes>
        {/* Routes publiques avec layout principal */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          
          {/* Objets */}
          <Route path="objects" element={<ObjectsPage />} />
          <Route path="objects/:id" element={<ObjectDetailPage />} />
          <Route path="objects/create" element={
            <ProtectedRoute>
              <CreateObjectPage />
            </ProtectedRoute>
          } />
          
          {/* Aliments */}
          <Route path="foods" element={<FoodsPage />} />
          <Route path="foods/:id" element={<FoodDetailPage />} />
          <Route path="foods/create" element={
            <ProtectedRoute>
              <CreateFoodPage />
            </ProtectedRoute>
          } />
          
          {/* Associations */}
          <Route path="associations" element={<AssociationsPage />} />
          <Route path="associations/:id" element={<AssociationDetailPage />} />
          <Route path="associations/create" element={
            <ProtectedRoute>
              <CreateAssociationPage />
            </ProtectedRoute>
          } />
          
          {/* Posts communautaires */}
          <Route path="posts" element={<PostsPage />} />
          <Route path="posts/:id" element={<PostDetailPage />} />
          <Route path="posts/create" element={
            <ProtectedRoute>
              <CreatePostPage />
            </ProtectedRoute>
          } />
          
          {/* Classement */}
          <Route path="leaderboard" element={<LeaderboardPage />} />
          
          {/* Contrats */}
          <Route path="contracts" element={
            <ProtectedRoute>
              <ContractsPage />
            </ProtectedRoute>
          } />
          <Route path="contracts/:contractId" element={
            <ProtectedRoute>
              <ContractDetailPage />
            </ProtectedRoute>
          } />
          
          {/* Contact */}
          <Route path="contact" element={<ContactPage />} />
        </Route>

        {/* Routes d'authentification */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="reset-password-code" element={<ResetPasswordCodePage />} />
          <Route path="email-confirmation" element={<EmailConfirmationPendingPage />} />
          <Route path="confirm-email/:token" element={<EmailConfirmationPage />} />
          <Route path="confirm-email-code" element={<EmailConfirmationCodePage />} />
        </Route>

        {/* Routes protégées */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="deliveries" element={<DeliveryTrackingPage />} />
        </Route>

        {/* Route 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
