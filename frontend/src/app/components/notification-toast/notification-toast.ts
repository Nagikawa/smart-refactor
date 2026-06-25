import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification/notification';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-toast',
  imports: [CommonModule],
  templateUrl: './notification-toast.html',
  styleUrl: './notification-toast.scss',
})
export class NotificationToast {
  public notificationService = inject(NotificationService);
}
