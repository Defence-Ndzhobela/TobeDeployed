import { supabase } from './supabase';

export interface StudentData {
  id: string;
  first_name: string;
  surname: string;
  date_of_birth: string;
  grade_applied_for: string;
  monthly_fee: number;
  email?: string;
  phone?: string;
  id_number: string;
}

export interface PaymentData {
  id: string;
  amount_paid: number;
  payment_date: string;
  payment_status: string;
  plan_type?: string;
  reference_number?: string;
}

export interface FeeResponsibilityData {
  id: string;
  fee_person: string;
  selected_plan?: string;
  parent_first_name: string;
  parent_surname: string;
  parent_email: string;
  bank_name?: string;
  account_number?: string;
}

export interface ApplicationData {
  id: string;
  status: string;
  created_at: string;
  submitted_at?: string;
}

export interface AddressData {
  id: string;
  application_id: string;
  street_address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FeeResponsibilityData {
  id?: string;
  application_id: string;
  fee_person: string;
  relationship: string;
  fee_terms_accepted: boolean;
  selected_plan?: string;
  parent_id_number?: string;
  parent_first_name?: string;
  parent_surname?: string;
  parent_email?: string;
  parent_mobile?: string;
  bank_name?: string;
  branch_code?: string;
  account_number?: string;
  account_type?: string;
  created_at?: string;
  updated_at?: string;
}

class StudentDataService {
  /**
   * Fetch all students for a given user (parent)
   */
  async getStudentsForUser(userId: string): Promise<StudentData[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('application_id', (
          await supabase
            .from('applications')
            .select('id')
            .eq('user_id', userId)
            .single()
        ).data?.id);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  /**
   * Fetch students by application ID
   */
  async getStudentsByApplicationId(applicationId: string): Promise<StudentData[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('application_id', applicationId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching students by application:', error);
      return [];
    }
  }

  /**
   * Fetch all applications for a user
   */
  async getApplicationsForUser(userId: string): Promise<ApplicationData[]> {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching applications:', error);
      return [];
    }
  }

  /**
   * Fetch payment history for a student
   */
  async getPaymentsForStudent(studentId: string): Promise<PaymentData[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  }

  /**
   * Fetch fee responsibility for an application
   */
  async getFeeResponsibility(applicationId: string): Promise<FeeResponsibilityData | null> {
    try {
      const { data, error } = await supabase
        .from('fee_responsibility')
        .select('*')
        .eq('application_id', applicationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
      return data || null;
    } catch (error) {
      console.error('Error fetching fee responsibility:', error);
      return null;
    }
  }

  /**
   * Fetch financing selection for an application
   */
  async getFinancingSelection(applicationId: string) {
    try {
      const { data, error } = await supabase
        .from('financing_selections')
        .select('*')
        .eq('application_id', applicationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching financing selection:', error);
      return null;
    }
  }

  /**
   * Calculate total fees for a student
   */
  async calculateTotalFees(studentId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('monthly_fee')
        .eq('id', studentId)
        .single();

      if (error) throw error;
      return data?.monthly_fee || 0;
    } catch (error) {
      console.error('Error calculating fees:', error);
      return 0;
    }
  }

  /**
   * Calculate paid amount for a student
   */
  async calculatePaidAmount(studentId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount_paid')
        .eq('student_id', studentId)
        .eq('payment_status', 'Paid');

      if (error) throw error;
      
      const total = data?.reduce((sum, payment) => sum + (payment.amount_paid || 0), 0) || 0;
      return total;
    } catch (error) {
      console.error('Error calculating paid amount:', error);
      return 0;
    }
  }

  /**
   * Get outstanding balance
   */
  async getOutstandingBalance(studentId: string): Promise<number> {
    try {
      const totalFees = await this.calculateTotalFees(studentId);
      const paidAmount = await this.calculatePaidAmount(studentId);
      return Math.max(0, totalFees - paidAmount);
    } catch (error) {
      console.error('Error getting outstanding balance:', error);
      return 0;
    }
  }

  /**
   * Get next payment due date (mock for now, can be enhanced)
   */
  async getNextPaymentDueDate(studentId: string): Promise<Date> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('payment_date')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0 && data[0]?.payment_date) {
        const lastPaymentDate = new Date(data[0].payment_date);
        const nextDueDate = new Date(lastPaymentDate);
        nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        return nextDueDate;
      }

      // Default to end of current month if no payment history
      const today = new Date();
      return new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } catch (error) {
      console.error('Error getting next payment due date:', error);
      return new Date();
    }
  }

  /**
   * Fetch address data by application ID
   */
  async getAddressByApplicationId(applicationId: string): Promise<AddressData | null> {
    try {
      const { data, error } = await supabase
        .from('address')
        .select('*')
        .eq('application_id', applicationId)
        .limit(1);

      if (error) throw error;
      return (data && data.length > 0 ? data[0] : null) || null;
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  }

  /**
   * Save or update address data
   */
  async saveAddress(addressData: Partial<AddressData>): Promise<AddressData | null> {
    try {
      // Check if address exists for this application
      const existing = await this.getAddressByApplicationId(addressData.application_id || '');

      if (existing) {
        // Update existing address
        const { data, error } = await supabase
          .from('address')
          .update({
            street_address: addressData.street_address,
            city: addressData.city,
            state: addressData.state,
            postcode: addressData.postcode,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new address
        const { data, error } = await supabase
          .from('address')
          .insert([addressData])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving address:', error);
      return null;
    }
  }

  /**
   * Fetch fee responsibility data by application ID
   */
  async getFeeResponsibilityByApplicationId(applicationId: string): Promise<FeeResponsibilityData | null> {
    try {
      const { data, error } = await supabase
        .from('fee_responsibility')
        .select('*')
        .eq('application_id', applicationId)
        .limit(1);

      if (error) throw error;
      return (data && data.length > 0 ? data[0] : null) || null;
    } catch (error) {
      console.error('Error fetching fee responsibility:', error);
      return null;
    }
  }

  /**
   * Save or update fee responsibility data (bank account details)
   */
  async saveFeeResponsibility(feeData: Partial<FeeResponsibilityData>): Promise<FeeResponsibilityData | null> {
    try {
      // Check if fee responsibility exists for this application
      const existing = await this.getFeeResponsibilityByApplicationId(feeData.application_id || '');

      if (existing) {
        // Update existing fee responsibility
        const { data, error } = await supabase
          .from('fee_responsibility')
          .update({
            bank_name: feeData.bank_name,
            branch_code: feeData.branch_code,
            account_number: feeData.account_number,
            account_type: feeData.account_type,
            selected_plan: feeData.selected_plan,
            parent_first_name: feeData.parent_first_name,
            parent_surname: feeData.parent_surname,
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new fee responsibility
        const { data, error } = await supabase
          .from('fee_responsibility')
          .insert([feeData])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Error saving fee responsibility:', error);
      return null;
    }
  }
}

export const studentDataService = new StudentDataService();
