'use client';
import React, { useState } from 'react';
import {
  Container,
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    console.log('Handling registration submit');
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    let email = data.get('email');
    let email2 = data.get('email2');
    let address = data.get('address');
    let password = data.get('password');
    let password2 = data.get('password2');
    let phone = data.get('phone');
    console.log('Sent email:', email);
    console.log('Sent email2:', email2);
    console.log('Sent address:', address);
    console.log('Sent phone:', phone);
    console.log('Sent password:', password);
    console.log('Sent password2:', password2);

    // Client-side validation
    if (email !== email2) {
      setErrorMessage('Emails do not match.');
      return;
    }
    if (password !== password2) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          address,
          phone,
        }),
      });
      const result = await res.json();

      if (res.ok) {
        console.log('Registration successful!');
        // Redirect to login page
        router.push('/login');
      } else {
        console.log('Registration failed:', result.error);
        setErrorMessage(result.error || 'Registration failed.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
      setErrorMessage('An unexpected error occurred.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
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
            id="email2"
            label="Confirm Email Address"
            name="email2"
            autoComplete="email"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="phone"
            label="Phone Number"
            name="phone"
            autoComplete="tel"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Confirm Password"
            type="password"
            id="password2"
            autoComplete="new-password"
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="address"
            label="Address"
            id="address"
            autoComplete="street-address"
          />
          {/*  */}
          {/* <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          /> */}
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Register
          </Button>
          <Typography variant="body2" align="center">
            Already have an account?{' '}
            <Button onClick={() => router.push('/login')} variant="text">
              Login
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
}
