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
  TextField,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ViewCartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
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

  // Function to handle quantity change
  async function handleQuantityChange(productId, newQuantity) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/updateCartItem',
        { productId, quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        // Update cart items and total cost
        setCartItems(response.data.cartItems);
        setTotalCost(response.data.totalCost);
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  }

  // Function to remove an item from the cart
  async function removeFromCart(productId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/removeFromCart',
        { productId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        // Update cart items and total cost
        setCartItems(response.data.cartItems);
        setTotalCost(response.data.totalCost);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  }

  // Handle logout
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    router.push('/login');
  }

  // Proceed to checkout
  function handleCheckout() {
    router.push('/checkout');
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
            Shopping Cart
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

      {/* Cart Items List */}
      <Container>
        <Typography variant="h4" sx={{ mt: 2 }}>
          Your Cart
        </Typography>
        {cartItems.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 2 }}>
            Your cart is empty.
          </Typography>
        ) : (
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
                        {item.description}
                      </>
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TextField
                      type="number"
                      inputProps={{ min: 1 }}
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.productId, parseInt(e.target.value))
                      }
                      sx={{ width: 60, mr: 2 }}
                    />
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removeFromCart(item.productId)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
        {cartItems.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Total Cost: ${totalCost.toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </>
        )}
      </Container>
    </Box>
  );
}
