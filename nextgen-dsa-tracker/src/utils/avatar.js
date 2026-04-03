// src/utils/avatar.js
export const getAvatarUrl = (userObject) => {
  if (userObject?.avatar) return userObject.avatar;
  const seed = userObject?.username || 'developer';
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${seed}&backgroundColor=0f172a`;
};