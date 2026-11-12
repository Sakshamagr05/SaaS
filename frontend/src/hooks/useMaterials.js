
import { useCallback, useEffect, useState } from "react";
import { materialApi } from "../api/materialApi";

export function useMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all materials
  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await materialApi.getAll();
      setMaterials(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to fetch materials"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Add material
  const addMaterial = async (materialData) => {
    const newMaterial = await materialApi.create(materialData);

    setMaterials((prev) => [...prev, newMaterial]);

    return newMaterial;
  };

  // Update material
  const editMaterial = async (materialId, materialData) => {
    const updatedMaterial = await materialApi.update(
      materialId,
      materialData
    );

    setMaterials((prev) =>
      prev.map((material) =>
        material.id === materialId ? updatedMaterial : material
      )
    );

    return updatedMaterial;
  };

  // Delete material
  const removeMaterial = async (materialId) => {
    await materialApi.delete(materialId);

    setMaterials((prev) =>
      prev.filter((material) => material.id !== materialId)
    );
  };

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  return {
    materials,
    loading,
    error,
    fetchMaterials,
    addMaterial,
    editMaterial,
    removeMaterial,
  };
}
