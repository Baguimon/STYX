import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AuthNavigator from './navigation/AuthNavigator';

export default function App() {
  return (
    <AuthProvider>
      <AuthNavigator />
    </AuthProvider>
  );
}
