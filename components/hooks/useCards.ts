import { useState, useCallback, useEffect } from "react";

export interface Card {
  id: number;
  title: string;
  description: string;
  department?: { name: string };
}

export const useCards = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const baseUrl: string = (import.meta as any).env?.VITE_API_URL ?? "";

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/cards`);
      if (!res.ok) throw new Error("Failed to fetch cards");
      setCards(await res.json());
    } catch (err) {
      setError("Error loading cards.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCard = useCallback(async (title: string, description: string, departmentId: number, headId: number | null) => {
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch(`${baseUrl}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description, departmentId, headId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCreateError(data.error || "Failed to create card");
        return false;
      }
      return true;
    } catch {
      setCreateError("Error creating card.");
      return false;
    } finally {
      setCreating(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  return { cards, loading, error, createCard, creating, createError, refetch: fetchCards };
};