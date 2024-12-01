'use client';
import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography'; // Added import
import Alert from '@mui/material/Alert'; // Added import for user feedback
import { useRouter } from 'next/navigation'; // Added import for routing

export default function Home() {
  const [error, setError] = useState(null); // State for error messages
  const [success, setSuccess] = useState(null); // State for success messages
  const router = useRouter(); // Initialize router

  const handleSubmit = async (event) => {
    console.log("Handling submit");
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const data = new FormData(event.currentTarget);
    let email = data.get('email');
    let password = data.get('password'); // Changed from 'pass' to 'password'
    console.log("Sent email:", email);
    console.log("Sent password:", password);

    // Client-side validation
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    // Prepare payload
    const payload = { email, password };

    try {
      const res = await fetch('/api/login', { // Use relative path
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Check if the response is empty
      if (res.status === 204) { // 204 No Content
        setError("No content received from the server.");
        return;
      }

      const result = await res.json();

      if (res.ok) {
        setSuccess("Login successful!");
        console.log("Login is valid!");

        // Store token and user role in localStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('userRole', result.role);

        // Redirect based on user role
        if (result.role === 'manager') {
          router.push('/manager');
        } else if (result.role === 'customer') {
          router.push('/customer');
        } else {
          setError("Unknown user role.");
        }
      } else {
        setError(result.error || 'Login failed.');
        console.log("Not valid");
      }
    } catch (err) {
      console.error("Error during fetch:", err);
      setError("Failed to connect to the server.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          {/* You can place an icon here */}
        </Avatar>
        <Typography component="h1" variant="h5"> {/* Typography component used correctly */}
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          {/* Display error or success messages */}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

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
            name="password" // Changed name from 'pass' to 'password'
            label="Password"
            type="password" // Changed type from 'pass' to 'password'
            id="password"
            autoComplete="current-password"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Link href="/register" variant="body2">
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
