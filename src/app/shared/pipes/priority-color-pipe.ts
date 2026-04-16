import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priorityColor',
  standalone: true,
  pure: true,
})
export class PriorityColorPipe implements PipeTransform {
  transform(priority: string): string {
    switch (priority) {
      case 'HIGH':
        return 'priority-high';
      case 'MEDIUM':
        return 'priority-medium';
      case 'LOW':
        return 'priority-high';
      default:
        return 'priority-medium';
    }
  }
}
