// frontend/src/api/parentApi.ts
import axios from "axios";

export interface ParentLoginResponse {
  id_number: string;
  full_name: string;
  email: string;
  phone_number: string;
}

export const loginParent = async (id_number: string) => {
  const response = await axios.post("http://localhost:8000/api/login/parent", { id_number });
  return response.data;
};

// ✅ NEW: Fetch students for logged-in parent
export const fetchParentStudents = async (parentIdNumber: string) => {
  const response = await axios.get(`http://localhost:8000/api/dashboard/students/${parentIdNumber}`);
  return response.data.students;
};

export const fetchParentChildren = async (parentId: string) => {
  const response = await axios.get(`http://localhost:8000/api/parents/${parentId}/children`);
  return response.data.children;
};

// ✅ Update student information
export const updateStudentDetails = async (applicationId: string, updates: any) => {
  const response = await axios.put(`http://localhost:8000/api/parents/students/${applicationId}`, updates);
  return response.data.student;
};
