// frontend/src/api/parentApi.ts
import axios from "axios";
import { API_BASE_URL } from "@/config/apiConfig";

export interface ParentLoginResponse {
  id_number: string;
  full_name: string;
  email: string;
  phone_number: string;
}

export interface ApiResponse<T> {
  [key: string]: T;
}

const API_URL = API_BASE_URL;

export const registerParent = async (parentData: any): Promise<any> => {
  const response = await axios.post<any>(`${API_URL}/parents/register`, parentData);
  return response.data;
};

export const loginParent = async (id_number: string): Promise<any> => {
  const response = await axios.post<any>(`${API_URL}/login/parent`, { id_number });
  return response.data;
};

export const fetchParentStudents = async (parentIdNumber: string): Promise<any[]> => {
  const response = await axios.get<{ students: any[] }>(`${API_URL}/parents/${parentIdNumber}/students`);
  return response.data.students;
};

export const updateStudentDetails = async (applicationId: string, updates: any): Promise<any> => {
  const response = await axios.put<{ student: any }>(`${API_URL}/parents/students/${applicationId}`, updates);
  return response.data.student;
};

export const fetchParentChildren = async (parentId: string): Promise<any[]> => {
  const response = await axios.get<{ children: any[] }>(`${API_URL}/parents/${parentId}/children`);
  return response.data.children;
};

export const saveSelectedPlan = async (parentId: string, planData: any): Promise<any> => {
  const response = await axios.post<any>(`${API_URL}/parents/${parentId}/selected-plan`, planData);
  return response.data;
};

export const fetchSelectedPlan = async (parentId: string): Promise<any> => {
  const response = await axios.get<{ plan: any }>(`${API_URL}/parents/${parentId}/selected-plan`);
  return response.data.plan;
};

export const sendRegistrationEmail = async (parentId: string, emailData: any): Promise<any> => {
  const response = await axios.post<any>(`${API_URL}/parents/${parentId}/send-registration-email`, emailData);
  return response.data;
};