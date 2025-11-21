// frontend/src/api/parentApi.ts
import axios from "axios";

export interface ParentLoginResponse {
  id_number: string;
  full_name: string;
  email: string;
  phone_number: string;
}



const API_URL = import.meta.env.VITE_API_BASE_URL;

export const registerParent = async (parentData: any) => {
  const response = await axios.post(`${API_URL}/parents/register`, parentData);
  return response.data;
};

export const loginParent = async (id_number: string) => {
  const response = await axios.post(`${API_URL}/login/parent`, { id_number });
  return response.data;
};

export const fetchParentStudents = async (parentIdNumber: string) => {
  const response = await axios.get(`${API_URL}/parents/${parentIdNumber}/students`);
  return response.data.students;
};

export const updateStudentDetails = async (applicationId: string, updates: any) => {
  const response = await axios.put(`${API_URL}/parents/students/${applicationId}`, updates);
  return response.data.student;
};

export const fetchParentChildren = async (parentId: string) => {
  const response = await axios.get(`${API_URL}/parents/${parentId}/children`);
  return response.data.children;
};

export const saveSelectedPlan = async (parentId: string, planData: any) => {
  const response = await axios.post(`${API_URL}/parents/${parentId}/selected-plan`, planData);
  return response.data;
};

export const fetchSelectedPlan = async (parentId: string) => {
  const response = await axios.get(`${API_URL}/parents/${parentId}/selected-plan`);
  return response.data.plan;
};

export const sendRegistrationEmail = async (parentId: string, emailData: any) => {
  const response = await axios.post(`${API_URL}/parents/${parentId}/send-registration-email`, emailData);
  return response.data;
};