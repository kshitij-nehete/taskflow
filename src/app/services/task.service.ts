import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.prod';
import { debounceTime, distinctUntilChanged, Observable, Subject, switchMap } from 'rxjs';
import { ApiResponse, TaskStatus } from '../models';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}

  private apiUrl = `${environment.apiUrl}/tasks`;

  getTasks(projectId?: string): Observable<ApiResponse<Task[]>> {
    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId);
    }

    return this.http.get<ApiResponse<Task[]>>(this.apiUrl, { params });
  }

  getTask(id: string): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/${id}`);
  }

  createTask(task: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(this.apiUrl, task);
  }

  updateTask(id: string, task: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/${id}`, task);
  }

  updateTaskStatus(id: string, status: TaskStatus): Observable<ApiResponse<Task>> {
    const params = new HttpParams();
    params.set('status', status);
    return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/${id}`, null, { params });
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
  ): Observable<ApiResponse<Task[]>> {
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

        return this.http.get<ApiResponse<Task[]>>(this.apiUrl, { params });
      }),
    );
  }
}
