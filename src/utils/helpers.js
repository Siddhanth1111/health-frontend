// Format call duration in MM:SS format
export const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Debug media stream information
export const debugMediaStream = (stream, label = '') => {
  if (!stream) {
    console.log(`📹 ${label} stream: null`);
    return;
  }

  const videoTracks = stream.getVideoTracks();
  const audioTracks = stream.getAudioTracks();
  
  console.log(`📹 ${label} stream:`, {
    id: stream.id,
    active: stream.active,
    videoTracks: videoTracks.length,
    audioTracks: audioTracks.length,
    videoEnabled: videoTracks.length > 0 ? videoTracks[0].enabled : false,
    audioEnabled: audioTracks.length > 0 ? audioTracks[0].enabled : false
  });

  videoTracks.forEach((track, index) => {
    console.log(`  📹 Video track ${index}:`, {
      id: track.id,
      kind: track.kind,
      label: track.label,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState,
      settings: track.getSettings?.()
    });
  });

  audioTracks.forEach((track, index) => {
    console.log(`  🎵 Audio track ${index}:`, {
      id: track.id,
      kind: track.kind,
      label: track.label,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState
    });
  });
};

// Check if device supports WebRTC
export const checkWebRTCSupport = () => {
  const supported = {
    webrtc: !!(window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection),
    getUserMedia: !!(navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia),
    mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  };

  console.log('🔧 WebRTC Support:', supported);
  return supported;
};

// Generate avatar URL
export const generateAvatarUrl = (name, backgroundColor = '4f46e5', textColor = 'fff', size = 150) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${backgroundColor}&color=${textColor}&size=${size}`;
};

// Parse call room ID
export const parseCallRoomId = (callRoomId) => {
  if (!callRoomId || typeof callRoomId !== 'string') {
    return null;
  }

  const parts = callRoomId.split('_');
  if (parts.length < 3) {
    return null;
  }

  return {
    prefix: parts[0],
    initiatorId: parts[1],
    receiverId: parts[2],
    timestamp: parts[3] ? parseInt(parts[3]) : null
  };
};

// Get user-friendly error messages
export const getMediaErrorMessage = (error) => {
  if (!error || !error.name) {
    return 'Unknown error occurred while accessing media devices';
  }

  switch (error.name) {
    case 'NotAllowedError':
      return 'Camera and microphone access denied. Please allow access in your browser settings.';
    case 'NotFoundError':
      return 'No camera or microphone found. Please connect your devices.';
    case 'NotReadableError':
      return 'Camera or microphone is already in use by another application.';
    case 'OverconstrainedError':
      return 'Camera or microphone constraints could not be satisfied.';
    case 'SecurityError':
      return 'Media access blocked due to security restrictions.';
    case 'TypeError':
      return 'Invalid media constraints specified.';
    case 'AbortError':
      return 'Media access request was aborted.';
    default:
      return `Media error: ${error.message || error.name}`;
  }
};

// Validate user data
export const validateUserData = (user) => {
  if (!user) return false;
  
  const required = ['_id', 'name'];
  return required.every(field => user[field] && user[field].toString().trim().length > 0);
};

// Create safe user object for VideoCall component
export const createSafeUserObject = (userData, fallbackName = 'User') => {
  return {
    _id: userData?._id || userData?.id || 'unknown',
    name: userData?.name || userData?.fullName || userData?.firstName || fallbackName,
    email: userData?.email || userData?.emailAddresses?.[0]?.emailAddress || '',
    avatar: userData?.avatar || userData?.imageUrl || generateAvatarUrl(userData?.name || fallbackName),
    userType: userData?.userType || 'patient'
  };
};
