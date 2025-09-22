// Environment variables
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

// Routes
export const ROUTES = {
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  DASHBOARD: '/dashboard',
  DOCTORS: '/doctors',
  CALL: '/call/:doctorId',
  CALL_ROOM: '/call-room/:callRoomId',
  PROFILE: '/profile',
  CONSULTATIONS: '/consultations',
  ONBOARDING: '/onboarding'
};

// Doctor specialties
export const DOCTOR_SPECIALTIES = [
  'General Physician',
  'Cardiologist',
  'Dermatologist',
  'Pediatrician',
  'Orthopedic',
  'Gastroenterologist',
  'Neurologist',
  'Psychiatrist',
  'Gynecologist',
  'ENT Specialist',
  'Ophthalmologist',
  'Urologist'
];

// Socket events (matching your VideoCall component)
export const SOCKET_EVENTS = {
  REGISTER_USER: 'register-user',
  USER_REGISTERED: 'user-registered',
  REGISTRATION_ERROR: 'registration-error',
  INITIATE_CALL: 'initiate-call',
  INCOMING_CALL: 'incoming-call',
  CALL_INITIATED: 'call-initiated',
  CALL_RESPONSE: 'call-response',
  CALLING: 'calling',
  DOCTOR_STATUS_CHANGED: 'doctor-status-changed',
  USER_NOT_AVAILABLE: 'user-not-available',
  ERROR: 'error'
};

// Call status
export const CALL_STATUS = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting...',
  CONNECTED: 'connected',
  RINGING: 'ringing...',
  ENDED: 'ended'
};

// Debug logging
if (import.meta.env.DEV) {
  console.log('🔧 Development Mode - Configuration:');
  console.log('📡 API_BASE_URL:', API_BASE_URL);
  console.log('🔌 SOCKET_URL:', SOCKET_URL);
}
