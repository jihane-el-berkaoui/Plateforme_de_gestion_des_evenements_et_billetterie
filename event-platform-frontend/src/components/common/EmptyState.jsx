import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Event, Search, Book, Person } from '@mui/icons-material';

const EmptyState = ({ 
  type = 'events', 
  message, 
  actionText, 
  onAction,
  iconSize = 60 
}) => {
  const getConfig = () => {
    switch (type) {
      case 'events':
        return {
          icon: <Event sx={{ fontSize: iconSize, color: 'text.secondary' }} />,
          title: 'Aucun événement trouvé',
          description: message || 'Aucun événement ne correspond à vos critères de recherche.',
          action: actionText || 'Voir tous les événements'
        };
      case 'bookings':
        return {
          icon: <Book sx={{ fontSize: iconSize, color: 'text.secondary' }} />,
          title: 'Aucune réservation',
          description: message || 'Vous n\'avez pas encore de réservations.',
          action: actionText || 'Explorer les événements'
        };
      case 'search':
        return {
          icon: <Search sx={{ fontSize: iconSize, color: 'text.secondary' }} />,
          title: 'Aucun résultat',
          description: message || 'Essayez de modifier vos critères de recherche.',
          action: actionText || 'Réinitialiser la recherche'
        };
      case 'users':
        return {
          icon: <Person sx={{ fontSize: iconSize, color: 'text.secondary' }} />,
          title: 'Aucun utilisateur',
          description: message || 'Aucun utilisateur ne correspond à votre recherche.',
          action: actionText || 'Voir tous les utilisateurs'
        };
      default:
        return {
          icon: <Event sx={{ fontSize: iconSize, color: 'text.secondary' }} />,
          title: 'Aucune donnée',
          description: message || 'Aucune donnée disponible pour le moment.',
          action: actionText || 'Actualiser'
        };
    }
  };

  const config = getConfig();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center'
      }}
    >
      <Box sx={{ mb: 3 }}>
        {config.icon}
      </Box>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {config.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {config.description}
      </Typography>
      {onAction && (
        <Button variant="contained" onClick={onAction}>
          {config.action}
        </Button>
      )}
    </Box>
  );
};

export default EmptyState;