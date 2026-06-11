import { useState, useCallback } from 'react';
import api from '../api/axios';

export function useNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Fetch notes for a specific student ───────────────────────
  // StudentDetailPage ke Notes tab mein call hoga
  const fetchNotes = useCallback(async (studentId) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/api/notes?studentId=${studentId}`);
      setNotes(data.data);
      return data.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notes');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Add note ──────────────────────────────────────────────────
  const createNote = async ({ studentId, text }) => {
    const { data } = await api.post('/api/notes', { studentId, text });
    setNotes((prev) => [data.data, ...prev]);
    return data.data;
  };

  const deleteNote = async (id) => {
    await api.delete(`/api/notes/${id}`);
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  const clearNotes = () => setNotes([]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    deleteNote,
    clearNotes,
  };
}