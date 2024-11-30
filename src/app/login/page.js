'use client';
import * as React from 'react';
import { useState } from 'react';
import {
  Button,
  TextField,
  Container,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [loginError, setLoginError] = useState('');
  const router = useRouter();

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoginError('');
    const data = new FormData(event.currentTarget);
    const email = data.get('email');
    const password = data.get('password');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok) {
        console.log('Login successful!');
        // Store token and user role
        localStorage.setItem('token', result.token);
        localStorage.setItem('userRole', result.role);

        // Redirect based on user role
        if (result.role === 'manager') {
          router.push('/manager');
        } else {
          router.push('/customer');
        }
      } else {
        console.error('Login failed:', result.error);
        setLoginError(result.error || 'Invalid email or password.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setLoginError('An unexpected error occurred.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
        <Box component="form" onSubmit={handleLoginSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          {loginError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loginError}
            </Alert>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
            Login
          </Button>
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Button onClick={() => router.push('/register')} variant="text">
                Register
              </Button>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
