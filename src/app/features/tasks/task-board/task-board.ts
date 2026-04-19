import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TaskCard } from '../task-card/task-card/task-card';
import { StatusLabelPipe } from '../../../shared/pipes/status-label-pipe';
import { TaskItem, Project, TaskPriority, TaskStatus } from '../../../models';
import { Subject, takeUntil } from 'rxjs';
import { TaskService } from '../../../services/task.service';
import { ProjectService } from '../../../services/project.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-task-board',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TaskCard],
  templateUrl: './task-board.html',
  styleUrl: './task-board.css',
})
export class TaskBoard implements OnInit, OnDestroy{
  allTasks: TaskItem[] = [];
  filteredTasks: TaskItem[] = [];
  projects: Project[] = [];

  isLoading = false;
  isSaving = false;
  errorMessage = '';
  showTaskForm = false;
  editingTaskId: string | null = null;

  selectedProjectId = '';
  selectedStatus = '';
  selectedPriority = '';
  searchTerm = '';
  projectIdFromRoute: string | null = null;
  projectName = '';

  statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
  columns = [
    { status: TaskStatus.TODO, label: 'To Do', color: '#94a3b8' },
    { status: TaskStatus.IN_PROGRESS, label: 'In Progress', color: '#f59e0b' },
    { status: TaskStatus.DONE, label: 'Done', color: '#10b981' },
  ];

  taskForm: FormGroup;

  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private projectService: ProjectService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      priority: [TaskPriority.MEDIUM],
      status: [TaskStatus.TODO],
      projectId: [''],
      dueDate: [''],
    });
  }

  ngOnInit(): void {
    console.log("Coloumns: ", this.columns);
    
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params['projectId']) {
        this.projectIdFromRoute = params['projectId'];
        this.selectedProjectId = params['projectId'];
        this.projectName = params['projectName'] || 'Project Tasks';
      }

      this.loadTasks();
    });

    this.loadProjects();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const projectId = this.selectedProjectId || undefined;

    this.taskService
      .getTasks(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.allTasks = response.data || [];
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to load tasks';
          this.isLoading = false;
        },
      });
  }

  loadProjects(): void {
    this.projectService
      .getProjects()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.projects = response.data || [];
        },
      });
  }

  applyFilters(): void {
    let tasks = [...this.allTasks];

    if (this.selectedStatus) {
      tasks = tasks.filter((t) => t.status === this.selectedStatus);
    }

    if (this.selectedPriority) {
      tasks = tasks.filter((t) => t.priority === this.selectedPriority);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      tasks = tasks.filter((t) => {
        t.title.toLowerCase().includes(term) ||
          (t.description && t.description.toLowerCase().includes(term));
      });
    }

    this.filteredTasks = tasks;
  }

  getTasksByStatus(status: TaskStatus): TaskItem[] {
    return this.filteredTasks.filter((t) => t.status === status);
  }

  changeTaskStatus(event: { task: TaskItem; newStatus: TaskStatus }): void {
    this.taskService
      .updateTaskStatus(event.task.id, event.newStatus)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.allTasks = this.allTasks.map((t) =>
            t.id === event.task.id ? { ...t, status: event.newStatus } : t,
          );

          this.applyFilters();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to update status';
        },
      });
  }

  onSubmitTask(): void {
    this.taskForm.markAllAsTouched();

    if (this.taskForm.invalid) return;

    console.log('Form value being submitted: ', this.taskForm.value);
    

    this.isSaving = true;
    const formValue = this.taskForm.value;

    if (this.editingTaskId) {
      this.taskService
        .updateTask(this.editingTaskId, formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.allTasks = this.allTasks.map((t) =>
              t.id === this.editingTaskId ? response.data : t,
            );
            this.applyFilters();
            this.cancelTaskForm();
          },
          error: (err) => {
            this.errorMessage = err.message || 'Failed to update task';
            this.isSaving = false;
          },
        });
    } else {
      this.taskService
        .createTask(formValue)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            console.log('Task created: ', response.data);
            
            this.allTasks = [response.data, ...this.allTasks];
            this.applyFilters();
            this.cancelTaskForm();
          },
          error: (err) => {
            this.errorMessage = err.message || 'Failed to create task';
            this.isSaving = false;
          },
        });
    }
  }

  startEditTask(task: TaskItem): void {
    this.editingTaskId = task.id;
    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      projectId: task.projecctId,
      dueDate: task.dueDate ? new Date(task.dueDate).toString().split('T')[0] : '',
    });

    this.showTaskForm = true;
  }

  deleteTask(task: TaskItem): void {
    if (!confirm(`Delete "${task.title}"?`)) return;

    this.taskService
      .deleteTask(task.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.allTasks = this.allTasks.filter((t) => t.id !== task.id);
          this.applyFilters();
        },
        error: (err) => {
          this.errorMessage = err.message || 'Failed to delete task';
        },
      });
  }

  cancelTaskForm(): void {
    this.showTaskForm = false;
    this.editingTaskId = null;
    this.isSaving = false;
    this.taskForm.reset({
      priority: TaskPriority.MEDIUM,
      stats: TaskStatus.TODO,
      projectId: this.selectedProjectId || '',
      dueDate: '',
    });
  }

  trackByTaskId(index: number, task: TaskItem): string {
    return task.id;
  }
}
