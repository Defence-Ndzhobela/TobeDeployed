// src/api/studentApi.ts
import axios from "axios";
import { API_BASE_URL } from "@/config/apiConfig";

const STUDENTS_URL = `${API_BASE_URL}/students`;

// ✅ Register student
export const registerStudent = async (student: any) => {
  const response = await axios.post(`${STUDENTS_URL}/register`, student);
  return response.data;
};

// ✅ Get all students for a specific parent
export const fetchStudentsByParent = async (parentId: string) => {
  const response = await axios.get(`${STUDENTS_URL}/parent/${parentId}`);
  return response.data.students;
};

// ✅ Update student by ID number
export const updateStudentById = async (idNumber: string, updates: any) => {
  const response = await axios.put(`${STUDENTS_URL}/${idNumber}`, updates);
  return response.data.data;
};

// ✅ Get selected plan for a parent by their ID number
export const fetchSelectedPlanByParent = async (parentIdNumber: string) => {
  const response = await axios.get(`${STUDENTS_URL}/plan-selection/${parentIdNumber}`);
  return response.data.plan_selection; // assuming your API returns { plan_selection: {...} }
};
