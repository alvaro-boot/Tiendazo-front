"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { debtService, clientService, Client, DebtPayment, ClientDebtInfo } from "@/lib/services";
import { useAuthContext } from "@/lib/auth-context";
import { handleApiError } from "@/lib/services";

export const useDebts = () => {
  const { user } = useAuthContext();
  const [payments, setPayments] = useState<DebtPayment[]>([]);
  const [clientsWithDebt, setClientsWithDebt] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalDebt, setTotalDebt] = useState<number>(0);

  // Cargar clientes con deuda
  const fetchClientsWithDebt = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("💰 Obteniendo clientes con deuda...");
      const clients = await debtService.getClientsWithDebt();
      console.log("✅ Clientes con deuda obtenidos:", clients.length);
      setClientsWithDebt(clients);
    } catch (err: any) {
      console.error("❌ Error obteniendo clientes con deuda:", err);
      const errorMessage = handleApiError(err);
      setError(errorMessage.message);
      setClientsWithDebt([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar total de deuda
  const fetchTotalDebt = useCallback(async () => {
    try {
      const result = await debtService.getTotalDebt();
      setTotalDebt(Number(result.total || 0));
    } catch (err: any) {
      console.error("❌ Error obteniendo total de deuda:", err);
      setTotalDebt(0);
    }
  }, []);

  // Cargar pagos
  const fetchPayments = useCallback(async (filters?: {
    startDate?: string;
    endDate?: string;
    clientId?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      console.log("💰 Obteniendo pagos de deuda con filtros:", filters);
      const data = await debtService.getPayments(filters);
      console.log("✅ Pagos obtenidos:", data.length);
      setPayments(data);
    } catch (err: any) {
      console.error("❌ Error obteniendo pagos:", err);
      const errorMessage = handleApiError(err);
      setError(errorMessage.message);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar pago
  const registerPayment = useCallback(async (paymentData: {
    clientId: number;
    amount: number;
    paymentType: "CASH" | "TRANSFER" | "CARD" | "OTHER";
    reference?: string;
    notes?: string;
  }): Promise<DebtPayment> => {
    try {
      setError(null);
      console.log("💰 Registrando pago:", paymentData);
      const payment = await debtService.registerPayment(paymentData);
      console.log("✅ Pago registrado:", payment);
      
      // Actualizar listas
      await Promise.all([
        fetchClientsWithDebt(),
        fetchTotalDebt(),
        fetchPayments(),
      ]);
      
      return payment;
    } catch (err: any) {
      console.error("❌ Error registrando pago:", err);
      const errorMessage = handleApiError(err);
      setError(errorMessage.message);
      throw errorMessage;
    }
  }, [fetchClientsWithDebt, fetchTotalDebt, fetchPayments]);

  // Obtener historial de pagos de un cliente
  const getClientPaymentHistory = useCallback(async (clientId: number): Promise<DebtPayment[]> => {
    try {
      const history = await debtService.getClientPaymentHistory(clientId);
      return history;
    } catch (err: any) {
      console.error("❌ Error obteniendo historial de pagos:", err);
      throw handleApiError(err);
    }
  }, []);

  // Obtener reporte de deudas
  const getDebtsReport = useCallback(async (filters?: {
    startDate?: string;
    endDate?: string;
    clientId?: number;
  }): Promise<any> => {
    try {
      const report = await debtService.getDebtsReport(filters);
      return report;
    } catch (err: any) {
      console.error("❌ Error obteniendo reporte de deudas:", err);
      throw handleApiError(err);
    }
  }, []);

  // Información de deudas por cliente (para la UI)
  const clientsDebtInfo = useMemo<ClientDebtInfo[]>(() => {
    return clientsWithDebt.map((client) => {
      const clientPayments = payments.filter((p) => p.clientId === client.id);
      const lastPayment = clientPayments.length > 0 
        ? clientPayments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        : undefined;

      return {
        client,
        totalDebt: Number(client.debt || 0),
        lastPayment,
        paymentCount: clientPayments.length,
      };
    });
  }, [clientsWithDebt, payments]);

  // Cargar datos iniciales - solo una vez al montar
  useEffect(() => {
    console.log("🔄 useDebts: Cargando datos iniciales de deudas");
    fetchClientsWithDebt();
    fetchTotalDebt();
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  return {
    payments,
    clientsWithDebt,
    clientsDebtInfo,
    totalDebt,
    loading,
    error,
    fetchClientsWithDebt,
    fetchPayments,
    fetchTotalDebt,
    registerPayment,
    getClientPaymentHistory,
    getDebtsReport,
  };
};

