import React, { useState } from 'react'
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress, MenuItem } from '@mui/material'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('admin@smarttraffic.tn');
  const [password, setPassword] = useState('admin123');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('OPERATOR');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = mode === 'login'
      ? await login(email, password)
      : await register({ email, password, firstName, lastName, role });

    if (!result.success) {
      setError(result.error || (mode === 'login' ? 'Erreur de connexion' : 'Erreur d inscription'));
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      <Paper elevation={6} sx={{ p: 4, width: 400, borderRadius: 2 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Smart Traffic
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          {mode === 'login' ? 'Connexion a la plateforme' : 'Creation d un compte utilisateur'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <TextField
                fullWidth
                label="Prenom"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Nom"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                margin="normal"
                required
              />
            </>
          )}
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          {mode === 'register' && (
            <TextField
              select
              fullWidth
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              margin="normal"
            >
              <MenuItem value="OPERATOR">OPERATOR</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
            </TextField>
          )}
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : mode === 'login' ? 'Se connecter' : 'Creer le compte'}
          </Button>
        </form>

        <Button
          fullWidth
          variant="text"
          sx={{ mt: 2 }}
          onClick={() => {
            setError('');
            setMode(mode === 'login' ? 'register' : 'login');
            if (mode === 'login') {
              setEmail('');
              setPassword('');
            } else {
              setEmail('admin@smarttraffic.tn');
              setPassword('admin123');
            }
          }}
        >
          {mode === 'login' ? 'Creer un compte' : 'Deja un compte ? Se connecter'}
        </Button>

        <Typography variant="caption" color="text.secondary" align="center" sx={{ mt: 2, display: 'block' }}>
          Defaut: admin@smarttraffic.tn / admin123
        </Typography>
      </Paper>
    </Box>
  );
}
