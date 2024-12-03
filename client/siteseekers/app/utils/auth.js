export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("token");
};

export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const getUserData = () => {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem("userData");
  return userData ? JSON.parse(userData) : null;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userData");
}; 