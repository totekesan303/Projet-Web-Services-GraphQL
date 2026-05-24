import React, { useState } from 'react'
import { Box, Typography, List, ListItem, ListItemText, IconButton, Badge, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress } from '@mui/material'
import { Add as AddIcon, MarkEmailRead as ReadIcon } from '@mui/icons-material'
import { useQuery, useMutation, gql } from '@apollo/client'
import { useAuth } from '../hooks/useAuth'

const GET_NOTIFICATIONS = gql`
  query GetNotifications {
    myNotifications {
      id
      title
      message
      type
      isRead
      readAt
      createdAt
    }
    unreadCount
  }
`;

const MARK_READ = gql`
  mutation MarkAsRead($input: MarkReadInput!) {
    markAsRead(input: $input) {
      id
      isRead
    }
  }
`;

const MARK_ALL_READ = gql`
  mutation MarkAllAsRead {
    markAllAsRead
  }
`;

const SEND_NOTIFICATION = gql`
  mutation SendNotification($input: SendNotificationInput!) {
    sendNotification(input: $input) {
      id
      title
      message
      type
      isRead
      createdAt
    }
  }
`;

export default function Notifications() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'GENERAL'
  });
  const { data, loading, error, refetch } = useQuery(GET_NOTIFICATIONS);
  const [markAsRead] = useMutation(MARK_READ);
  const [markAllAsRead] = useMutation(MARK_ALL_READ);
  const [sendNotification, { loading: sending }] = useMutation(SEND_NOTIFICATION);

  const handleMarkRead = async (id) => {
    await markAsRead({ variables: { input: { notificationId: id } } });
    refetch();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    refetch();
  };

  const handleSend = async () => {
    await sendNotification({
      variables: {
        input: {
          ...formData,
          userId: user.id
        }
      }
    });
    setFormData({ title: '', message: '', type: 'GENERAL' });
    setOpen(false);
    refetch();
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'INCIDENT': return 'error';
      case 'TRAFFIC_ALERT': return 'warning';
      case 'STATUS_UPDATE': return 'info';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Notifications
          {data?.unreadCount > 0 && (
            <Badge badgeContent={data.unreadCount} color="error" sx={{ ml: 2 }} />
          )}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Envoyer
          </Button>
          <IconButton onClick={handleMarkAllRead} title="Tout marquer comme lu">
            <ReadIcon />
          </IconButton>
        </Box>
      </Box>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">Erreur notifications: {error.message}</Alert>}
      {!loading && !error && data?.myNotifications?.length === 0 && (
        <Alert severity="info">Aucune notification pour le moment.</Alert>
      )}

      <List>
        {data?.myNotifications?.map((notif) => (
          <ListItem
            key={notif.id}
            sx={{
              mb: 1,
              bgcolor: notif.isRead ? 'background.paper' : 'action.hover',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider'
            }}
            secondaryAction={
              !notif.isRead && (
                <IconButton edge="end" onClick={() => handleMarkRead(notif.id)}>
                  <ReadIcon />
                </IconButton>
              )
            }
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: notif.isRead ? 'normal' : 'bold' }}>
                    {notif.title}
                  </Typography>
                  <Chip label={notif.type} color={getTypeColor(notif.type)} size="small" />
                </Box>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary">
                    {notif.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(notif.createdAt).toLocaleString('fr-FR')}
                  </Typography>
                </>
              }
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Envoyer une notification</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Titre"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            select
            fullWidth
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            margin="normal"
          >
            <MenuItem value="GENERAL">GENERAL</MenuItem>
            <MenuItem value="SYSTEM">SYSTEM</MenuItem>
            <MenuItem value="INCIDENT">INCIDENT</MenuItem>
            <MenuItem value="STATUS_UPDATE">STATUS_UPDATE</MenuItem>
            <MenuItem value="TRAFFIC_ALERT">TRAFFIC_ALERT</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            disabled={sending || !formData.title || !formData.message}
            onClick={handleSend}
          >
            {sending ? 'Envoi...' : 'Envoyer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
