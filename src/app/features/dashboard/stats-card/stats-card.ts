import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats-card.html',
  styleUrl: './stats-card.css',
})
export class StatsCard {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string;
  @Input() icon = '📊';
  @Input() color = '#667eea';
  @Input() subtitle = '';
}
