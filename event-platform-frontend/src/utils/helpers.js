export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(price);
};

export const generateConfirmationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return re.test(phone);
};

export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getTimeRemaining = (eventDate) => {
  const now = new Date();
  const event = new Date(eventDate);
  const diff = event - now;

  if (diff <= 0) return 'Événement terminé';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `Dans ${days} jour${days > 1 ? 's' : ''}`;
  if (hours > 0) return `Dans ${hours} heure${hours > 1 ? 's' : ''}`;
  return `Dans ${minutes} minute${minutes > 1 ? 's' : ''}`;
};

export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Requête invalide';
      case 401:
        return 'Non autorisé. Veuillez vous reconnecter.';
      case 403:
        return 'Accès interdit';
      case 404:
        return 'Ressource non trouvée';
      case 500:
        return 'Erreur serveur. Veuillez réessayer plus tard.';
      default:
        return `Erreur ${status}: ${data.message || 'Une erreur est survenue'}`;
    }
  } else if (error.request) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
  } else {
    return 'Erreur de configuration de la requête';
  }
};