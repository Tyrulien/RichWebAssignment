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
  CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const router = useRouter();

  // Fetch cart items when the component mounts
  useEffect(() => {
    async function fetchCartItems() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/getCartItems', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setCartItems(response.data.cartItems);
          setTotalCost(response.data.totalCost);
        } else {
          // If not authorized, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
        router.push('/login');
      }
    }
    fetchCartItems();
  }, [router]);

  // Handle logout
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    router.push('/login');
  }

  // Handle order confirmation
  async function handleConfirmOrder() {
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/confirmOrder',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        setOrderConfirmed(true);
        // Clear cart items after order confirmation
        setCartItems([]);
        setTotalCost(0);
      } else {
        console.error('Error confirming order:', response.data.error);
      }
    } catch (error) {
      console.error('Error confirming order:', error);
    } finally {
      setIsProcessing(false);
    }
  }

  // Navigate back to products page
  function handleContinueShopping() {
    router.push('/customer');
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
            Checkout
          </Typography>
          <IconButton color="inherit" aria-label="cart">
            <Badge badgeContent={cartItems.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Checkout Content */}
      <Container>
        <Typography variant="h4" sx={{ mt: 2 }}>
          Order Summary
        </Typography>
        {cartItems.length === 0 ? (
          orderConfirmed ? (
            <Typography variant="body1" sx={{ mt: 2 }}>
              Thank you for your purchase! An email confirmation has been sent to you.
            </Typography>
          ) : (
            <Typography variant="body1" sx={{ mt: 2 }}>
              Your cart is empty.
            </Typography>
          )
        ) : (
          <>
            <List>
              {cartItems.map((item) => (
                <React.Fragment key={item.productId}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar alt={item.title} src={item.image} variant="square" />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.title}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            Price: ${parseFloat(item.price).toFixed(2)}
                          </Typography>
                          {' — '}
                          Quantity: {item.quantity}
                        </>
                      }
                    />
                    <Typography variant="body2">
                      Subtotal: ${(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Total Cost: ${totalCost.toFixed(2)}
            </Typography>
            <Box sx={{ display: 'flex', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmOrder}
                disabled={isProcessing}
              >
                {isProcessing ? <CircularProgress size={24} /> : 'Confirm Order'}
              </Button>
              <Button
                variant="outlined"
                sx={{ ml: 2 }}
                onClick={handleContinueShopping}
                disabled={isProcessing}
              >
                Continue Shopping
              </Button>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
}
