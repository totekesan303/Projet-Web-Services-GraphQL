import React, { useState } from 'react'
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Chip, Grid, FormControl, InputLabel, Select, MenuItem, Paper } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Add as AddIcon } from '@mui/icons-material'
import { useQuery, useMutation, gql } from '@apollo/client'

const GET_INCIDENTS = gql`
  query GetIncidents {
    incidents {
      id
      type
      status
      title
      description
      latitude
      longitude
      address
      severity
      createdAt
    }
    activeIncidents {
      id
      title
      status
    }
  }
`;

const DECLARE_INCIDENT = gql`
  mutation DeclareIncident($input: DeclareIncidentInput!) {
    declareIncident(input: $input) {
      id
      title
      type
      status
    }
  }
`;

const UPDATE_STATUS = gql`
  mutation UpdateIncidentStatus($id: ID!, $input: UpdateStatusInput!) {
    updateIncidentStatus(id: $id, input: $input) {
      id
      status
    }
  }
`;

export default function Incidents() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'ACCIDENT', title: '', description: '', latitude: 36.8, longitude: 10.18, address: '', severity: 'MEDIUM'
  });

  const { data, loading, refetch } = useQuery(GET_INCIDENTS);
  const [declareIncident] = useMutation(DECLARE_INCIDENT);
  const [updateStatus] = useMutation(UPDATE_STATUS);

  const columns = [
    { field: 'title', headerName: 'Titre', width: 200 },
    { field: 'type', headerName: 'Type', width: 130 },
    { field: 'status', headerName: 'Statut', width: 120, renderCell: (params) => (
      <Chip 
        label={params.value} 
        color={params.value === 'RESOLU' ? 'success' : params.value === 'EN_COURS' ? 'warning' : 'error'} 
        size="small" 
      />
    )},
    { field: 'severity', headerName: 'Gravite', width: 100, renderCell: (params) => (
      <Chip label={params.value} color={params.value === 'CRITICAL' ? 'error' : 'default'} size="small" />
    )},
    { field: 'address', headerName: 'Adresse', width: 200 },
    { field: 'createdAt', headerName: 'Date', width: 180 },
    { field: 'actions', headerName: 'Actions', width: 200, sortable: false, renderCell: (params) => (
      params.row.status !== 'RESOLU' && (
        <Box>
          {params.row.status === 'SIGNALE' && (
            <Button size="small" onClick={() => handleStatusChange(params.row.id, 'EN_COURS')}>
              En cours
            </Button>
          )}
          <Button size="small" color="success" onClick={() => handleStatusChange(params.row.id, 'RESOLU')}>
            Resoudre
          </Button>
        </Box>
      )
    )}
  ];

  const handleSubmit = async () => {
    await declareIncident({ variables: { input: formData } });
    setOpen(false);
    refetch();
  };

  const handleStatusChange = async (id, status) => {
    await updateStatus({ variables: { id, input: { status } } });
    refetch();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des Incidents</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Declarer un incident
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
            <Typography variant="h4">{data?.activeIncidents?.length || 0}</Typography>
            <Typography>Incidents actifs</Typography>
          </Paper>
        </Grid>
      </Grid>

      <DataGrid
        rows={data?.incidents || []}
        columns={columns}
        pageSize={10}
        autoHeight
        loading={loading}
        getRowId={(row) => row.id}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Declarer un Incident</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                  <MenuItem value="ACCIDENT">Accident</MenuItem>
                  <MenuItem value="TRAVAUX">Travaux</MenuItem>
                  <MenuItem value="ROUTE_FERMEE">Route fermee</MenuItem>
                  <MenuItem value="EMBOUTEILLAGE">Embouteillage</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="Titre" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></Grid>
            <Grid item xs={12}><TextField fullWidth multiline rows={3} label="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Latitude" type="number" value={formData.latitude} onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Longitude" type="number" value={formData.longitude} onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Adresse" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">Declarer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
