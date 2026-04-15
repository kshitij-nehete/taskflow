import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Route, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Router],

  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  isLoading = false;
  errorMessage = '';

  signupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.signupForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.signupForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }

  getFieldError(fieldName: string, errorType: string): boolean {
    return !!this.signupForm.get(fieldName)?.hasError(errorType);
  }

  onSubmit(): void {
    this.signupForm.markAllAsTouched();

    this.isLoading = true;
    this.errorMessage = '';

    const { name, email, password } = this.signupForm.value;

    this.authService.signup({ name, email, password }).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['dashboard']);
        } else {
          this.errorMessage = response.message || 'Signup failed';
          this.isLoading = false;
        }
      },
      error: (err) => {
        this.errorMessage = err.message || 'Signup failed. Please try again';
        this.isLoading = false;
      },
    });
  }
}
