import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { debounceTime, distinctUntilChanged, Observable, Subject, switchMap } from 'rxjs';
import { ApiResponse, TaskItem, TaskStatus } from '../models';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}

  private apiUrl = `${environment.apiUrl}/tasks`;

  getTasks(projectId?: string): Observable<ApiResponse<TaskItem[]>> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }

    return this.http.get<ApiResponse<TaskItem[]>>(this.apiUrl, { params });
  }

  getTask(id: string): Observable<ApiResponse<TaskItem>> {
    return this.http.get<ApiResponse<TaskItem>>(`${this.apiUrl}/${id}`);
  }

  createTask(task: Partial<TaskItem>): Observable<ApiResponse<TaskItem>> {
    return this.http.post<ApiResponse<TaskItem>>(this.apiUrl, task);
  }

  updateTask(id: string, task: Partial<TaskItem>): Observable<ApiResponse<TaskItem>> {
    return this.http.put<ApiResponse<TaskItem>>(`${this.apiUrl}/${id}`, task);
  }

  updateTaskStatus(id: string, status: TaskStatus): Observable<ApiResponse<TaskItem>> {
    const params = new HttpParams().set('status', status)
    return this.http.patch<ApiResponse<TaskItem>>(`${this.apiUrl}/${id}/status`, null, { params });
  }

  deleteTask(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  getStats(projectId?: string): Observable<ApiResponse<Record<string, number>>> {
    let params = new HttpParams();

    if (projectId) {
      params = params.set('projectId', projectId);
    }

    return this.http.get<ApiResponse<Record<string, number>>>(`${this.apiUrl}/stats`, { params });
  }

  createSearchPipeline(
    searchTerm$: Subject<string>,
    projectId?: string,
  ): Observable<ApiResponse<TaskItem[]>> {
    return searchTerm$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) => {
        let params = new HttpParams();
        if (projectId) {
          params = params.set('projectId', projectId);
        }

        if (term.trim()) {
          params = params.set('search', term.trim());
        }

        return this.http.get<ApiResponse<TaskItem[]>>(this.apiUrl, { params });
      }),
    );
  }
}
