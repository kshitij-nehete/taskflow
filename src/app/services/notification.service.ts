import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface ToastNotification {
  id: number;
  message: string;
  type: NotificationType;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new Subject<ToastNotification>();

  notifcation$ = this.notificationSubject.asObservable();

  private nextId = 0;

  show(message: string, type: NotificationType = 'info', duration = 3000): void {
    const notification: ToastNotification = {
      id: ++this.nextId,
      message,
      type,
      duration,
    };
    this.notificationSubject.next(notification);
  }

  success(message: string, duration = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration = 4000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration = 3000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration = 4000): void {
    this.show(message, 'warning', duration);
  }
}
