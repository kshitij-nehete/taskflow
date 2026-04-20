import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TimeAgoPipe } from '../../../shared/pipes/time-ago-pipe';
import { Project } from '../../../models';
import { Subject, takeUntil } from 'rxjs';
import { ProjectService } from '../../../services/project.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe, FormsModule],
  templateUrl: './project-list.html',
  styleUrl: './project-list.css',
})
export class ProjectList implements OnInit, OnDestroy {
  projects: Project[] = [];
  isLoading = false;
  errorMessage = '';

  showCreateForm = false;
  isCreating = false;
  formSubmitted = false;
  newProject = {
    name: '',
    description: '',
  };

  editingProjectId: string | null = null;
  editProject = {
    name: '',
    description: '',
  };

  private destroy$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private router: Router,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProjects(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.projectService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.projects = response.data || [];
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load projects';
          this.isLoading = false;
        },
      });
  }

  createProject(): void {
    this.formSubmitted = true;
    if (!this.newProject.name.trim()) return;

    this.isCreating = true;

    this.projectService
      .createProject(this.newProject)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.projects = [response.data, ...this.projects];
          this.cancelCreate();
          this.isCreating = false;
          this.notificationService.success('Project created succesfully');
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to create project';
          this.isCreating = false;
        },
      });
  }

  cancelCreate(): void {
    this.showCreateForm = false;
    this.newProject = {
      name: '',
      description: '',
    };
    this.formSubmitted = false;
  }

  startEdit(project: Project): void {
    this.editingProjectId = project.id;
    this.editProject = {
      name: project.name,
      description: project.description,
    };
  }

  saveEdit(projectId: string): void {
    if (!this.editProject.name.trim()) return;

    this.projectService
      .updateProject(projectId, this.editProject)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.projects = this.projects.map((p) => (p.id === projectId ? response.data : p));
          this.cancelEdit();
          this.notificationService.success('Project updated');
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to update project';
        },
      });
  }

  cancelEdit(): void {
    this.editingProjectId = null;
    this.editProject = {
      name: '',
      description: '',
    };
  }

  deleteProject(project: Project): void {
    if (!confirm(`Delete "${project.name}"? This will also delete all its tasks`)) {
      return;
    }

    this.projectService
      .deleteProject(project.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.projects = this.projects.filter((p) => p.id !== project.id);
          this.notificationService.success('Project deleted');
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to delete project';
        },
      });
  }

  viewTasks(project: Project): void {
    this.router.navigate(['/tasks'], {
      queryParams: { projectId: project.id, projectName: project.name },
    });
  }

  trackByProjectId(index: number, project: Project): string {
    return project.id;
  }
}
