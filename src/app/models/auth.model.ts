export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequests {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}
