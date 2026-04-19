import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Observable, Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Project, TaskItem, User } from '../../models';
import { StatsCard } from './stats-card/stats-card';
import { TimeAgoPipe } from '../../shared/pipes/time-ago-pipe';
import { PriorityColorPipe } from '../../shared/pipes/priority-color-pipe';
import { StatusLabelPipe } from '../../shared/pipes/status-label-pipe';
import { TaskService } from '../../services/task.service';
import { ProjectService } from '../../services/project.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatsCard, TimeAgoPipe, PriorityColorPipe, StatusLabelPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  currentUser$: Observable<User | null>;

  stats = { total: 0, todo: 0, inProgress: 0, done: 0 };
  recentProjects: Project[] = [];
  recentTasks: TaskItem[] = [];

  isLoading = false;
  errorMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private taskService: TaskService,
    private projectService: ProjectService,
    private router: Router,
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      stats: this.taskService.getStats(),
      projects: this.projectService.getProjects(),
      tasks: this.taskService.getTasks(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          const statsData = result.stats.data || {};
          this.stats = {
            total: statsData['TOTAL'] || 0,
            todo: statsData['TODO'] || 0,
            inProgress: statsData['INPROGRESS'] || 0,
            done: statsData['DONE'] || 0,
          };

          this.recentProjects = (result.projects.data || []).slice(0, 5);
          this.recentTasks = (result.tasks.data || []).slice(0, 5);

          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load dashboard';
          this.isLoading = false;
        },
      });
  }

  get completionRate(): number {
    if (this.stats.total === 0) return 0;
    return Math.round((this.stats.done / this.stats.total) * 100);
  }

  viewProjectTasks(project: Project): void {
    this.router.navigate(['/tasks'], {
      queryParams: { projectId: project.id, projectName: project.name },
    });
  }

  trackById(index: number, item: { id: string }): string {
    return item.id;
  }
}
