
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('userId');
}

export function getUserRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('role');
}

export function isAuthenticated(): boolean {
  return !!(getAuthToken() && getUserId());
}

export function isOwner(): boolean {
    return getUserRole() === 'owner';
}

export function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    return token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : {
        'Content-Type': 'application/json'
    }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = getAuthHeaders();

    return fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...options.headers
        }
    }); 
}