
import { useCallback, useEffect, useState } from "react";
import { shipmentApi } from "../api/shipmentApi";

export function useShipments() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await shipmentApi.getAll();
      setShipments(data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to fetch shipments."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const addShipment = async (data) => {
    const newShipment = await shipmentApi.create(data);

    setShipments((prev) => [newShipment, ...prev]);

    return newShipment;
  };

  const editShipment = async (shipmentId, data) => {
    const updatedShipment = await shipmentApi.update(
      shipmentId,
      data
    );

    setShipments((prev) =>
      prev.map((shipment) =>
        shipment.id === shipmentId ? updatedShipment : shipment
      )
    );

    return updatedShipment;
  };

  const removeShipment = async (shipmentId) => {
    await shipmentApi.delete(shipmentId);

    setShipments((prev) =>
      prev.filter((shipment) => shipment.id !== shipmentId)
    );
  };

  const receiveShipment = async (shipmentId, data) => {
    const receivedShipment = await shipmentApi.receive(
      shipmentId,
      data
    );

    setShipments((prev) =>
      prev.map((shipment) =>
        shipment.id === shipmentId ? receivedShipment : shipment
      )
    );

    return receivedShipment;
  };

  return {
    shipments,
    loading,
    error,
    fetchShipments,
    addShipment,
    editShipment,
    removeShipment,
    receiveShipment,
  };
}
