export const validateEventForm = (formData) => {
  const errors = {};

  if (!formData.name || formData.name.trim() === '') {
    errors.name = 'Le nom de l\'événement est requis';
  } else if (formData.name.length < 3) {
    errors.name = 'Le nom doit contenir au moins 3 caractères';
  }

  if (!formData.description || formData.description.trim() === '') {
    errors.description = 'La description est requise';
  } else if (formData.description.length < 10) {
    errors.description = 'La description doit contenir au moins 10 caractères';
  }

  if (!formData.date) {
    errors.date = 'La date est requise';
  } else {
    const eventDate = new Date(formData.date);
    const now = new Date();
    if (eventDate <= now) {
      errors.date = 'La date doit être future';
    }
  }

  if (!formData.location || formData.location.trim() === '') {
    errors.location = 'Le lieu est requis';
  }

  if (!formData.capacity || formData.capacity <= 0) {
    errors.capacity = 'La capacité doit être supérieure à 0';
  }

  if (!formData.price || formData.price < 0) {
    errors.price = 'Le prix doit être positif';
  }

  return errors;
};

export const validateBookingForm = (formData, availableTickets) => {
  const errors = {};

  if (!formData.quantity || formData.quantity <= 0) {
    errors.quantity = 'La quantité doit être supérieure à 0';
  } else if (formData.quantity > availableTickets) {
    errors.quantity = `Seulement ${availableTickets} billets disponibles`;
  }

  return errors;
};

export const validateUserForm = (formData) => {
  const errors = {};

  if (!formData.firstName || formData.firstName.trim() === '') {
    errors.firstName = 'Le prénom est requis';
  }

  if (!formData.lastName || formData.lastName.trim() === '') {
    errors.lastName = 'Le nom est requis';
  }

  if (!formData.email || formData.email.trim() === '') {
    errors.email = 'L\'email est requis';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Email invalide';
    }
  }

  if (formData.phone && formData.phone.trim() !== '') {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Numéro de téléphone invalide';
    }
  }

  return errors;
};

export const validateLoginForm = (formData) => {
  const errors = {};

  if (!formData.email || formData.email.trim() === '') {
    errors.email = 'L\'email est requis';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Email invalide';
    }
  }

  if (!formData.password || formData.password.trim() === '') {
    errors.password = 'Le mot de passe est requis';
  } else if (formData.password.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
  }

  return errors;
};