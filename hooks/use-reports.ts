import { useState } from "react";
import { reportService, ReportFilters } from "@/lib/services";

export function useReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (reportData: {
    type: "SALES" | "INVENTORY" | "DEBTS" | "PROFITS" | "CLIENTS" | "PRODUCTS";
    startDate?: string;
    endDate?: string;
    storeId?: number;
    format?: "json" | "excel";
  }): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.generateReport(reportData);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al generar reporte");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSalesReport = async (filters: ReportFilters): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getSalesReport(filters);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener reporte de ventas");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getInventoryReport = async (filters: ReportFilters): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getInventoryReport(filters);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener reporte de inventario");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDebtsReport = async (filters: ReportFilters): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getDebtsReport(filters);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener reporte de deudas");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProfitsReport = async (filters: ReportFilters): Promise<any> => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportService.getProfitsReport(filters);
      return data;
    } catch (err: any) {
      setError(err.message || "Error al obtener reporte de ganancias");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateReport,
    getSalesReport,
    getInventoryReport,
    getDebtsReport,
    getProfitsReport,
  };
}
