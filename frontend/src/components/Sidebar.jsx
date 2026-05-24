import React from 'react'
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'
import {
  Dashboard as DashboardIcon,
  DirectionsCar as CarIcon,
  Traffic as TrafficIcon,
  Warning as WarningIcon,
  Notifications as NotificationIcon
} from '@mui/icons-material'

const menuItems = [
  { path: '/', label: 'Tableau de bord', icon: <DashboardIcon /> },
  { path: '/vehicles', label: 'Vehicules', icon: <CarIcon /> },
  { path: '/traffic', label: 'Trafic', icon: <TrafficIcon /> },
  { path: '/incidents', label: 'Incidents', icon: <WarningIcon /> },
  { path: '/notifications', label: 'Notifications', icon: <NotificationIcon /> },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: 240, boxSizing: 'border-box', mt: 8 },
      }}
    >
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.path}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
              }
            }}
          >
            <ListItemIcon sx={{ color: location.pathname === item.path ? 'inherit' : undefined }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}
