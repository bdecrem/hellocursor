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
    console.log('Setting cookie with value:', cookieValue);
    console.log('Current hostname:', hostname);
    document.cookie = cookieValue;
    
    // Verify the cookie was set
    const verifyValue = getCookie(name);
    console.log('Verifying cookie was set:', name, 'Value:', verifyValue);
    console.log('All cookies after setting:', document.cookie);
    return verifyValue === value;
  } catch (error) {
    console.error('Error setting cookie:', error);
    return false;
  }
};

export const getCookie = (name) => {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim());
    console.log('Getting cookie:', name);
    console.log('All cookies:', cookies);
    for (const cookie of cookies) {
      if (cookie.startsWith(name + '=')) {
        const value = cookie.substring(name.length + 1);
        console.log('Found cookie value:', value);
        return value;
      }
    }
    console.log('Cookie not found:', name);
    return null;
  } catch (error) {
    console.error('Error getting cookie:', error);
    return null;
  }
}; 