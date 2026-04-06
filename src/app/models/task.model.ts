export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  projecctId: string;
  assignId: string;
  assigneeName: string;
  dueDate: string;
  createdAt?: string;
  updateAt?: string;
}
