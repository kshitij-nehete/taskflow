import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: true,
  pure: true,
})
export class StatusLabelPipe implements PipeTransform {
  private labels: Record<string, string> = {
    'TODO': 'To Do',
    'IN_PROGRESS': 'In Progress',
    'DONE': 'Done',
    'LOW': 'Low',
    'MEDIUM': 'Medium',
    'HIGH': 'High',
    'USER': 'User',
    'ADMIN': 'Admin',
  };

  transform(value: string): string {
    return this.labels[value] || value;
  }
}
