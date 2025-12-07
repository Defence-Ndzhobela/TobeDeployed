import { supabase } from './supabase'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api'

export interface SchoolFee {
  id: string
  grade: string
  annual_fee: number
  term_fee: number
  registration_fee: number
  re_registration_fee: number
  sport_fee: number
  created_at: string
  updated_at: string
}

/**
 * Fetch school fees for a specific grade from backend API
 */
export const getFeeByGrade = async (grade: string): Promise<SchoolFee | null> => {
  try {
    console.log(`Fetching fees for grade: ${grade} from ${API_BASE_URL}`)
    
    const response = await fetch(`${API_BASE_URL}/school-fees/${grade}`)
    
    if (!response.ok) {
      console.error(`Error fetching fees for grade ${grade}: ${response.status} ${response.statusText}`)
      return null
    }

    const data = await response.json()
    console.log(`Fees fetched successfully for grade ${grade}:`, data)
    return data as SchoolFee
  } catch (err) {
    console.error('Unexpected error fetching fees:', err)
    return null
  }
}

/**
 * Fetch all school fees from backend API
 */
export const getAllFees = async (): Promise<SchoolFee[]> => {
  try {
    console.log(`Fetching all fees from ${API_BASE_URL}`)
    
    const response = await fetch(`${API_BASE_URL}/school-fees`)
    
    if (!response.ok) {
      console.error(`Error fetching all fees: ${response.status} ${response.statusText}`)
      return []
    }

    const data = await response.json()
    return (data.fees as SchoolFee[]) || []
  } catch (err) {
    console.error('Unexpected error fetching all fees:', err)
    return []
  }
}
