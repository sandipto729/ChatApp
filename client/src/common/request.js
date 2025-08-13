const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

const fetchDetails = async (endpoint, options = {}) => {
  try {
    let url = endpoint.url;
    const method = endpoint.method || 'GET';
    
    // Handle dynamic URLs (like chat messages with chatId)
    if (options.params) {
      Object.keys(options.params).forEach(key => {
        url = url.replace(`{${key}}`, options.params[key]);
      });
    }
    
    // Get access token from localStorage
    const accessToken = localStorage.getItem('accessToken');
    
    const response = await fetch(`${BACKEND_URL}${url}`, {
      method: method,
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching details:', error);
    throw error;
  }
};

// Helper function for POST requests
const postRequest = async (endpoint, body, options = {}) => {
  return fetchDetails(endpoint, {
    ...options,
    body: JSON.stringify(body)
  });
};

// Helper function for GET requests with parameters
const getRequest = async (endpoint, params = {}, options = {}) => {
  return fetchDetails(endpoint, {
    ...options,
    params
  });
};

export default fetchDetails;
export { postRequest, getRequest };
