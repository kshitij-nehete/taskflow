import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, ToastNotification } from '../../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification implements OnInit, OnDestroy {
  notifications: ToastNotification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifcation$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => {
        this.notifications = [...this.notifications, notification];

        setTimeout(() => {
          this.dismiss(notification.id);
        }, notification.duration || 3000);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  dismiss(id: number): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  getPrefix(type: string): string {
    switch (type) {
      case 'success':
        return '[OK]';
      case 'error':
        return '[ERR]';
      case 'warning':
        return '[!]';
      case 'info':
        return '[i]';
      default:
        return '[i]';
    }
  }

  trackById(index: number, n: ToastNotification): number {
    return n.id;
  }
}
