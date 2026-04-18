import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PriorityColorPipe } from '../../../../shared/pipes/priority-color-pipe';
import { StatusLabelPipe } from '../../../../shared/pipes/status-label-pipe';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago-pipe';
import { TaskItem, TaskStatus } from '../../../../models';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, PriorityColorPipe, StatusLabelPipe, TimeAgoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  @Input({ required: true }) task!: TaskItem;

  @Output() onStatusChange = new EventEmitter<{ task: TaskItem; newStatus: TaskStatus }>();
  @Output() onEdit = new EventEmitter<TaskItem>();
  @Output() onDelete = new EventEmitter<TaskItem>();

  statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
}
