import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function usePayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch ALL payments (Dashboard/Analytics ke liye) ──────────
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/api/payments');
      setPayments(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // ── Fetch payments for ONE student (StudentDetailPage) ────────
  const fetchStudentPayments = useCallback(async (studentId) => {
    try {
      const { data } = await api.get(`/api/payments?studentId=${studentId}`);
      return data.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to load payments');
    }
  }, []);

  // ── Add payment ───────────────────────────────────────────────
  const createPayment = async (formData) => {
    const { data } = await api.post('/api/payments', formData);
    setPayments((prev) => [data.data, ...prev]);
    return data.data;
  };

  // ── Update payment ────────────────────────────────────────────
  const updatePayment = async (id, formData) => {
    const { data } = await api.put(`/api/payments/${id}`, formData);
    setPayments((prev) =>
      prev.map((p) => (p._id === id ? data.data : p))
    );
    return data.data;
  };

  // ── Delete payment ────────────────────────────────────────────
  const deletePayment = async (id) => {
    await api.delete(`/api/payments/${id}`);
    setPayments((prev) => prev.filter((p) => p._id !== id));
  };

  // ── Sync: jab student add ho aur uski initial payment
  //    createStudent se already create ho gayi ho,
  //    toh payments list mein manually add karo ──────────────────
  const appendPayment = (payment) => {
    if (payment) setPayments((prev) => [payment, ...prev]);
  };

  return {
    payments,
    loading,
    error,
    refetch: fetchPayments,
    fetchStudentPayments,
    createPayment,
    updatePayment,
    deletePayment,
    appendPayment,
  };
}