import { Injectable } from '@angular/core';
import { ApiResponse, AuthResponse, User } from '../models/index';
import { environment } from '../../environments/environment.prod';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest, SignupRequests } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasValidToken());

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromToken());

  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.success) {
          localStorage.setItem('access_token', response.data.accessToken);

          localStorage.setItem('current_user', JSON.stringify(response.data.user));

          this.isLoggedInSubject.next(true);

          const user: User = {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role as any,
          };

          this.currentUserSubject.next(user);
        }
      }),
    );
  }

  signup(data: SignupRequests): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/register`, data).pipe(
      tap((response) => {
        if (response.success) {
          localStorage.setItem('access_token', response.data.accessToken);

          localStorage.setItem('current_user', JSON.stringify(response.data.user));

          this.isLoggedInSubject.next(true);

          const user: User = {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role as any,
          };

          this.currentUserSubject.next(user);
        }
      }),
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');

    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);

    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  hasValidToken(): boolean {
    const token = this.getToken();

    if (!token) return false;

    try {
      const payload: {exp: number; sub:string; userId:string; role: string} = JSON.parse(atob(token.split('.')[1]))

      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  private getUserFromToken(): User | null {
    try {
      const userJson = localStorage.getItem('current_user');
      return userJson ? JSON.parse(userJson) : null;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }
}
