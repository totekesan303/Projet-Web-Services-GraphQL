import React, { useState } from 'react'
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Grid, Chip } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { Add as AddIcon, LocationOn as LocationIcon } from '@mui/icons-material'
import { useQuery, useMutation, gql } from '@apollo/client'

const GET_VEHICLES = gql`
  query GetVehicles {
    vehicles {
      id
      plateNumber
      brand
      model
      type
      year
      color
      ownerName
      ownerPhone
      isActive
      lastPosition {
        latitude
        longitude
      }
    }
  }
`;

const CREATE_VEHICLE = gql`
  mutation CreateVehicle($input: CreateVehicleInput!) {
    createVehicle(input: $input) {
      id
      plateNumber
      brand
      model
    }
  }
`;

const SIMULATE_POSITIONS = gql`
  mutation SimulatePositions($vehicleId: ID!, $count: Int) {
    simulatePositions(vehicleId: $vehicleId, count: $count) {
      id
      latitude
      longitude
    }
  }
`;

export default function Vehicles() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    plateNumber: '', brand: '', model: '', type: 'CAR', year: '', color: '', ownerName: '', ownerPhone: ''
  });

  const { data, loading, refetch } = useQuery(GET_VEHICLES);
  const [createVehicle] = useMutation(CREATE_VEHICLE);
  const [simulatePositions] = useMutation(SIMULATE_POSITIONS);

  const columns = [
    { field: 'plateNumber', headerName: 'Plaque', width: 120 },
    { field: 'brand', headerName: 'Marque', width: 120 },
    { field: 'model', headerName: 'Modele', width: 120 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'ownerName', headerName: 'Proprietaire', width: 150 },
    { field: 'isActive', headerName: 'Actif', width: 100, renderCell: (params) => (
      <Chip label={params.value ? 'Oui' : 'Non'} color={params.value ? 'success' : 'error'} size="small" />
    )},
    { field: 'actions', headerName: 'Actions', width: 200, sortable: false, renderCell: (params) => (
      <Button
        size="small"
        startIcon={<LocationIcon />}
        onClick={() => handleSimulate(params.row.id)}
      >
        Simuler GPS
      </Button>
    )}
  ];

  const handleSubmit = async () => {
    await createVehicle({ variables: { input: formData } });
    setOpen(false);
    refetch();
  };

  const handleSimulate = async (vehicleId) => {
    await simulatePositions({ variables: { vehicleId, count: 5 } });
    refetch();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des Vehicules</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
          Ajouter un vehicule
        </Button>
      </Box>

      <DataGrid
        rows={data?.vehicles || []}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10]}
        loading={loading}
        autoHeight
        getRowId={(row) => row.id}
      />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nouveau Vehicule</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField fullWidth label="Plaque" value={formData.plateNumber} onChange={(e) => setFormData({...formData, plateNumber: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Marque" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Modele" value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Type" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Annee" type="number" value={formData.year} onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Couleur" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Proprietaire" value={formData.ownerName} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Telephone" value={formData.ownerPhone} onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">Creer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
