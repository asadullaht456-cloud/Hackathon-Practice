export type NetworkType = 'metrobus' | 'orange' | 'speedo';

export interface Profile {
  id: string;
  full_name: string | null;
  role: 'citizen' | 'student';
  institution: string | null;
  bound_device_id: string | null;
  student_verified_at: string | null;
  created_at?: string;
}

export interface Wallet {
  user_id: string;
  balance_pkr: number;
  updated_at?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'topup' | 'fare';
  amount_pkr: number;
  method: string | null;
  route_id: string | null;
  created_at: string;
}

export interface Stop {
  id: string;
  name: string;
  network: NetworkType;
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  name: string;
  network: NetworkType;
  fare_pkr: number;
}

export interface RouteStop {
  route_id: string;
  seq: number;
  stop_id: string;
  minutes_from_prev: number;
}

export interface Transfer {
  from_stop_id: string;
  to_stop_id: string;
  walk_minutes: number;
}

export interface Vehicle {
  id: string;
  route_id: string;
  dir: 1 | -1;
  seq: number;
  progress: number;
  lat: number;
  lng: number;
  heading: number;
  updated_at: string;
}

export interface QrToken {
  token_id: string;
  kind: 'paygo' | 'student';
  expires_at: string;
}

export interface StudentVerification {
  id: string;
  user_id: string;
  extracted_name: string | null;
  institution: string | null;
  liveness_passed: boolean;
  created_at: string;
}

export interface Leg {
  route_id: string;
  route_name?: string;
  network?: NetworkType;
  from: string;
  from_name?: string;
  to: string;
  to_name?: string;
  minutes: number;
  fare_pkr: number;
  stops?: string[];
}

export interface Itinerary {
  mode: 'fastest' | 'cheapest';
  total_minutes: number;
  total_fare_pkr: number;
  transfers: number;
  legs: Leg[];
}

export interface ValidationResult {
  ok: boolean;
  reason?: 'invalid' | 'already_used' | 'expired' | 'unknown_route' | 'insufficient_balance' | string;
  fare?: number;
  balance?: number;
}
