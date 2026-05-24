import React from 'react'
import { AppBar, Toolbar, Typography, Box, IconButton, Badge, Avatar, Menu, MenuItem } from '@mui/material'
import { Notifications as NotificationsIcon, Logout as LogoutIcon } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useQuery, gql } from '@apollo/client'
import { useAuth } from '../hooks/useAuth'

const UNREAD_COUNT = gql`
  query UnreadCount {
    unreadCount
  }
`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { data } = useQuery(UNREAD_COUNT, {
    pollInterval: 10000,
    fetchPolicy: 'cache-and-network'
  });

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Smart Traffic Platform
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit" component={Link} to="/notifications">
            <Badge badgeContent={data?.unreadCount || 0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Box 
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {user?.firstName?.[0]}
            </Avatar>
            <Typography variant="body2">
              {user?.fullName}
            </Typography>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={logout}>
              <LogoutIcon sx={{ mr: 1 }} /> Deconnexion
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
