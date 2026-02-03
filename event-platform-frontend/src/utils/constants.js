export const EVENT_CATEGORIES = [
  'CONCERT',
  'SPORTS',
  'CONFERENCE',
  'FESTIVAL',
  'THEATER',
  'ART',
  'FOOD',
  'OTHER'
];

export const EVENT_STATUS = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  POSTPONED: 'POSTPONED'
};

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED'
};

export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

export const API_ENDPOINTS = {
  EVENTS: '/api/events',
  BOOKINGS: '/api/bookings',
  USERS: '/api/users',
  AUTH: '/api/auth'
};
export const ROLES = {
  ADMIN: 'ADMIN',
  CLIENT: 'CLIENT',
  ORGANIZER: 'ORGANIZER' 
};

export const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  CLIENT: 'Client',
  ORGANIZER: 'Organisateur'
};