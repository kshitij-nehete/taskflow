import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!req.url.includes('/auth/')) {
          authService.logout();
        }
      }

      if (error.status === 403) {
        router.navigate(['/dashboard']);
      }

      let errorMessage = 'Something went wrong';

      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Cannot connect to server. Please check your internet';
      } else if (error.status === 404) {
        errorMessage = 'The request resource was not found';
      } else if (error.status === 500) {
        errorMessage = 'Server error. Please try again later';
      }

      console.error(`[HTTP Error] ${error.status} - ${req.url}:`, errorMessage);

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
      }));
    }),
  );
};
