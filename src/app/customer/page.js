'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Button,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function CustomerPage() {
  const [products, setProducts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  // Fetch products when the component mounts
  useEffect(() => {
    async function fetchProducts() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/getProducts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setProducts(response.data);
        } else {
          // If not authorized, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        router.push('/login');
      }
    }
    fetchProducts();
  }, [router]);

  // Fetch weather data when the component mounts
  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await axios.get('/api/getWeather');
        if (response.status === 200) {
          setWeather(response.data);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
      }
    }
    fetchWeather();
  }, []);

  // Fetch cart count when the component mounts
  useEffect(() => {
    async function fetchCartCount() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/getCartCount', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setCartCount(response.data.count);
        }
      } catch (error) {
        console.error('Error fetching cart count:', error);
      }
    }
    fetchCartCount();
  }, []);

  // Function to add a product to the cart
  async function addToCart(productId, quantity = 1) {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/putInCart',
        { productId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCartCount(cartCount + quantity);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  }

  // Handle logout
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    router.push('/login');
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Customer Page
          </Typography>
          <IconButton
            color="inherit"
            onClick={() => router.push('/view_cart')}
            aria-label="cart"
          >
            <Badge badgeContent={cartCount} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Weather Display */}
      {weather && (
        <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6">
            Current Weather: {weather.name}, {weather.weather[0].description}
          </Typography>
          <Typography variant="body1">
            Temperature: {weather.main.temp}°C
          </Typography>
        </Box>
      )}

      {/* Products List */}
      <Container>
        <Typography variant="h4" sx={{ mt: 2 }}>
          Products
        </Typography>
        <List>
          {products.map((product) => (
            <React.Fragment key={product._id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar alt={product.title} src={product.image} variant="square" />
                </ListItemAvatar>
                <ListItemText
                  primary={product.title}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        Price: ${parseFloat(product.price).toFixed(2)}
                      </Typography>
                      {' — '}
                      {product.description}
                    </>
                  }
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addToCart(product._id)}
                >
                  Add to Cart
                </Button>
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      </Container>
    </Box>
  );
}
