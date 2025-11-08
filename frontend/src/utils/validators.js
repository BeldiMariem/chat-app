export const validateUserId = (userId) => {
  if (!userId?.trim()) {
    return 'Username is required';
  }
  
  if (userId.length < 2) {
    return 'Username must be at least 2 characters long';
  }
  
  if (userId.length > 20) {
    return 'Username must be less than 20 characters';
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
    return 'Username can only contain letters, numbers, underscores, and hyphens';
  }
  
  return null;
};

export const validateRoomId = (roomId) => {
  if (!roomId?.trim()) {
    return 'Room ID is required';
  }
  
  if (roomId.length < 1) {
    return 'Room ID is required';
  }
  
  if (roomId.length > 30) {
    return 'Room ID must be less than 30 characters';
  }
  
  return null;
};

export const validateMessage = (message) => {
  if (!message?.trim()) {
    return 'Message cannot be empty';
  }
  
  if (message.length > 1000) {
    return 'Message must be less than 1000 characters';
  }
  
  return null;
};