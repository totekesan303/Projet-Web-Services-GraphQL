import React from 'react'
import { Grid, Paper, Typography, Box } from '@mui/material'
import { useQuery, gql } from '@apollo/client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const DASHBOARD_STATS = gql`
  query DashboardStats {
    trafficSummary {
      totalZones
      congestedZones
      zonesByDensity {
        faible
        moyen
        eleve
      }
    }
    incidentStats {
      total
      criticalCount
      byStatus {
        signale
        enCours
        resolu
      }
      byType {
        accident
        travaux
        routeFermee
        embouteillage
      }
    }
    vehicles {
      id
    }
    activeIncidents {
      id
      title
      status
      severity
    }
  }
`;

const COLORS = ['#4caf50', '#ff9800', '#f44336'];

export default function Dashboard() {
  const { data, loading } = useQuery(DASHBOARD_STATS);

  if (loading) return <Typography>Chargement...</Typography>;

  const densityData = data?.trafficSummary ? [
    { name: 'Faible', value: data.trafficSummary.zonesByDensity.faible },
    { name: 'Moyen', value: data.trafficSummary.zonesByDensity.moyen },
    { name: 'Eleve', value: data.trafficSummary.zonesByDensity.eleve },
  ] : [];

  const incidentStatusData = data?.incidentStats ? [
    { name: 'Signale', value: data.incidentStats.byStatus.signale },
    { name: 'En cours', value: data.incidentStats.byStatus.enCours },
    { name: 'Resolu', value: data.incidentStats.byStatus.resolu },
  ] : [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Tableau de bord</Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="h3">{data?.vehicles?.length || 0}</Typography>
            <Typography>Vehicules</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'white' }}>
            <Typography variant="h3">{data?.trafficSummary?.totalZones || 0}</Typography>
            <Typography>Zones</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light', color: 'white' }}>
            <Typography variant="h3">{data?.activeIncidents?.length || 0}</Typography>
            <Typography>Incidents actifs</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'error.light', color: 'white' }}>
            <Typography variant="h3">{data?.trafficSummary?.congestedZones || 0}</Typography>
            <Typography>Zones congestionnees</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Densite du trafic</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={densityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {densityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Statut des incidents</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incidentStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
