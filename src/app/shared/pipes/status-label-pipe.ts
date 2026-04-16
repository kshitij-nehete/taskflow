import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: true,
  pure: true,
})
export class StatusLabelPipe implements PipeTransform {
  private labels: Record<string, string> = {
    'TODO': 'To Do',
    'IN_PROGRESS': 'To Do',
    'DONE': 'To Do',
    'LOW': 'To Do',
    'MEDIUM': 'To Do',
    'HIGH': 'To Do',
    'USER': 'To Do',
    'ADMIN': 'To Do',
  };

  transform(value: string): string {
    return this.labels[value] || value;
  }
}
