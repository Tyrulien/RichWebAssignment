'use client';
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  AppBar,
  Toolbar,
  Button,
  IconButton,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function ManagerDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0 });
  const router = useRouter();

  // Fetch orders and stats when the component mounts
  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/getOrders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 200) {
          setOrders(response.data.orders);
          setStats(response.data.stats);
        } else {
          // If not authorized, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        router.push('/login');
      }
    }
    fetchOrders();
  }, [router]);

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
            Manager Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Manager Dashboard Content */}
      <Container>
        <Typography variant="h4" sx={{ mt: 2 }}>
          Orders Summary
        </Typography>
        <Typography variant="h6" sx={{ mt: 2 }}>
          Total Orders: {stats.totalOrders}
        </Typography>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Total Revenue: ${stats.totalRevenue.toFixed(2)}
        </Typography>
        <List>
          {orders.map((order) => (
            <ListItem key={order._id} alignItems="flex-start">
              <ListItemText
                primary={`Order ID: ${order.orderId}`}
                secondary={
                  <>
                    <Typography variant="body2" color="text.primary">
                      Customer: {order.customerEmail}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      Date: {new Date(order.orderDate).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      Total Cost: ${order.totalCost.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      Products:
                    </Typography>
                    <ul>
                      {order.products.map((product) => (
                        <li key={product.productId}>
                          {product.title} (x{product.quantity}) - $
                          {(product.price * product.quantity).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Container>
    </Box>
  );
}
