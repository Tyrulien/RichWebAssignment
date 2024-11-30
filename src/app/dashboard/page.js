'use client';
import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { green } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    secondary: {
      main: green[500],
    },
  },
});

export default function Page() {
  const [data, setData] = useState(null);
  const [weather, setWeatherData] = useState(0);

  useEffect(() => {
    // Fetch products
    fetch('http://localhost:3000/api/getProducts')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
      });
  }, []);

  useEffect(() => {
    // Fetch weather
    fetch('http://localhost:3000/api/getWeather')
      .then((res) => res.json())
      .then((weather) => {
        setWeatherData(weather);
      });
  }, []);

  // Show loading or error states
  if (!data) return <p>Loading...</p>;
  if (!weather) return <p>No weather</p>;

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        {/* Your Dashboard Header */}
        <Box sx={{ fontSize: '40px', marginBottom: '20px' }}>Dashboard</Box>

        {/* Adding the Weather Data Here */}
        <Box sx={{ fontSize: '20px', marginBottom: '20px' }}>
          {/* Checking if weather data exists before displaying */}
          {weather && `Today's temperature: ${JSON.stringify(weather.temp)}`}
        </Box>

        {/* Your Product List */}
        <div>
          {data.map((item) => (
            <Box key={item._id} sx={{ padding: '20px', borderBottom: '1px solid #ccc' }}>
              <strong>{item.pname}</strong> - {item.price} - UID: {item._id}
              <Button variant="outlined" sx={{ marginLeft: '20px' }}>
                Add to cart
              </Button>
            </Box>
          ))}
        </div>
      </Container>
    </ThemeProvider>
  );
}
