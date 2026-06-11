import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch all students ────────────────────────────────────────
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/api/students');
      setStudents(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // ── Create student (+ optional initial payment) ───────────────
  // Backend createStudent handles initPayAmt, initPayMethod, etc. automatically
  const createStudent = async (formData) => {
    const { data } = await api.post('/api/students', formData);
    // Prepend naya student to list
    setStudents((prev) => [data.data, ...prev]);
    return data; // { success, data: student, initialPayment }
  };

  // ── Update student ─────────────────────────────────────────────
  const updateStudent = async (id, formData) => {
    const { data } = await api.put(`/api/students/${id}`, formData);
    setStudents((prev) =>
      prev.map((s) => (s._id === id ? data.data : s))
    );
    return data.data;
  };

  // ── Delete student (cascade handled by backend) ───────────────
  const deleteStudent = async (id) => {
    await api.delete(`/api/students/${id}`);
    setStudents((prev) => prev.filter((s) => s._id !== id));
  };

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}