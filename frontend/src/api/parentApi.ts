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

// Helper to get auth headers with token
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
};

export const registerParent = async (parentData: any): Promise<any> => {
  const response = await axios.post<any>(`${API_URL}/parents/register`, parentData);
  return response.data;
};

export const loginParent = async (id_number: string): Promise<any> => {
  const response = await axios.post<any>(`${API_URL}/login/parent`, { id_number });
  return response.data;
};

export const fetchParentStudents = async (parentIdNumber: string): Promise<any[]> => {
  const response = await axios.get<{ students: any[] }>(
    `${API_URL}/parents/${parentIdNumber}/students`,
    { headers: getAuthHeaders() }
  );
  return response.data.students;
};

export const updateStudentDetails = async (applicationId: string, updates: any): Promise<any> => {
  const response = await axios.put<{ student: any }>(
    `${API_URL}/parents/students/${applicationId}`,
    updates,
    { headers: getAuthHeaders() }
  );
  return response.data.student;
};

export const fetchParentChildren = async (parentId: string): Promise<any[]> => {
  const response = await axios.get<{ children: any[] }>(
    `${API_URL}/parents/${parentId}/children`,
    { headers: getAuthHeaders() }
  );
  return response.data.children;
};

export const saveSelectedPlan = async (applicationId: string, planData: any): Promise<any> => {
  const response = await axios.post<any>(
    `${API_URL}/parents/${applicationId}/selected-plan`,
    { selected_plan: planData.selected_plan },
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const fetchSelectedPlan = async (parentId: string): Promise<any> => {
  const response = await axios.get<{ plan: any }>(
    `${API_URL}/parents/${parentId}/selected-plan`,
    { headers: getAuthHeaders() }
  );
  return response.data.plan;
};

export const sendRegistrationEmail = async (parentId: string, emailData: any): Promise<any> => {
  const response = await axios.post<any>(
    `${API_URL}/parents/${parentId}/send-registration-email`,
    emailData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const fetchParentBankAccount = async (parentId: string): Promise<any> => {
  const response = await axios.get<any>(
    `${API_URL}/parents/${parentId}/bank-account`,
    { headers: getAuthHeaders() }
  );
  return response.data;
};

export const saveBankAccount = async (parentId: string, bankData: any): Promise<any> => {
  const response = await axios.post<any>(
    `${API_URL}/parents/${parentId}/bank-account`,
    bankData,
    { headers: getAuthHeaders() }
  );
  return response.data;
};