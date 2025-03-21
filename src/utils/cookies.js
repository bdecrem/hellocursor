// Cookie management utilities
export const setCookie = (name, value, days = 365) => {
  try {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    
    // Get the hostname and handle localhost specially
    const hostname = window.location.hostname;
    const domain = hostname === 'localhost' ? '' : `;domain=${hostname}`;
    
    // Build cookie string - omit domain for localhost
    const cookieValue = `${name}=${value};${expires};path=/;SameSite=Lax${domain}`;
    document.cookie = cookieValue;
    
    // Verify the cookie was set
    const verifyValue = getCookie(name);
    return verifyValue === value;
  } catch (error) {
    console.error('Error setting cookie:', error);
    return false;
  }
};

export const getCookie = (name) => {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim());
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