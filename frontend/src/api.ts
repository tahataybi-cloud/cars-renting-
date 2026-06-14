import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smartrent_token');
  if (token && token !== 'undefined' && token !== 'null') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type DashboardSummary = {
  revenueToday: number;
  revenueThisMonth: number;
  bookedRevenueThisMonth: number;
  activeRentals: number;
  availableCars: number;
  carsInMaintenance: number;
  expiringInsurance: number;
  pendingDeposits: number;
  customerGrowth: number;
};

export type DashboardOverview = {
  summary: DashboardSummary;
  revenueTrend: Array<{ label: string; paidRevenue: number; bookedRevenue: number }>;
  fleetUtilization: Array<{ status: string; count: number }>;
  monthlyReservations: Array<{ label: string; reservations: number }>;
  alerts: Array<{
    id: string;
    type: 'INSURANCE' | 'INSPECTION' | 'MAINTENANCE' | 'DEPOSIT' | 'BOOKING';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    title: string;
    description: string;
    actionLabel: string;
    targetPath: string;
  }>;
  recentBookings: Array<{
    id: string;
    customerName: string;
    vehicleLabel: string;
    plateNumber: string;
    pickupAt: string;
    returnAt: string;
    status: string;
    totalAmount: number;
  }>;
};

export type Me = {
  userId: string;
  agencyId: string | null;
  fullName: string;
  email: string;
  roles: string[];
};

export type Car = {
  id: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: 'DIESEL' | 'PETROL' | 'HYBRID' | 'ELECTRIC';
  transmission: 'MANUAL' | 'AUTOMATIC';
  plateNumber: string;
  status: 'AVAILABLE' | 'RESERVED' | 'RENTED' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  dailyRate: number;
  primaryImageUrl?: string | null;
  insuranceExpiry?: string | null;
  inspectionDueDate?: string | null;
  openMaintenanceCount?: number;
  bookingActivityCount?: number;
};

export type CarStatus = Car['status'];
export type FuelType = Car['fuelType'];
export type Transmission = Car['transmission'];

export type CarDetail = {
  car: Car;
  insurance: Array<{ id: string; company: string; contractNumber: string; startDate: string; endDate: string; documentUrl?: string | null }>;
  inspections: Array<{ id: string; inspectionDate: string; nextDueDate: string; result: string; documentUrl?: string | null }>;
  maintenance: Array<{ id: string; type: string; description?: string | null; mileageAtService?: number | null; dueAt?: string | null; completedAt?: string | null; cost: number }>;
  bookings: Array<{ id: string; customerName: string; status: string; pickupAt: string; returnAt: string; totalAmount: number }>;
  images: Array<{ id: string; url: string; primary: boolean }>;
  damageSummary: { totalReports: number; estimatedCost: number };
};
