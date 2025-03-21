// Cookie management utilities
export const setCookie = (name, value, days = 365) => {
  try {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    // Add domain and secure attributes for better Safari support
    const cookieValue = `${name}=${value};${expires};path=/;SameSite=Lax;domain=${window.location.hostname}`;
    console.log('Setting cookie with value:', cookieValue);
    document.cookie = cookieValue;
    
    // Verify the cookie was set
    const verifyValue = getCookie(name);
    console.log('Verifying cookie was set:', name, 'Value:', verifyValue);
    return verifyValue === value;
  } catch (error) {
    console.error('Error setting cookie:', error);
    return false;
  }
};

export const getCookie = (name) => {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim());
    console.log('All cookies when getting:', name, ':', cookies);
    for (const cookie of cookies) {
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
}; 