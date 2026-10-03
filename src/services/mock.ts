import {
  Stop,
  Route,
  RouteStop,
  Transfer,
  Vehicle,
  Wallet,
  Transaction,
  Profile,
  Itinerary,
  Leg,
  ValidationResult,
} from './types';

// Mock Stops data per ARCHITECTURE.md lines 252-262
export const MOCK_STOPS: Stop[] = [
  { id: 'gajju_matta', name: 'Gajju Matta', network: 'metrobus', lat: 31.404, lng: 74.235 },
  { id: 'kalma_chowk', name: 'Kalma Chowk', network: 'metrobus', lat: 31.504, lng: 74.33 },
  { id: 'chauburji_mb', name: 'Chauburji (Metrobus)', network: 'metrobus', lat: 31.556, lng: 74.305 },
  { id: 'shahdara', name: 'Shahdara', network: 'metrobus', lat: 31.619, lng: 74.295 },
  { id: 'ali_town', name: 'Ali Town', network: 'orange', lat: 31.443, lng: 74.249 },
  { id: 'wahdat_road', name: 'Wahdat Road', network: 'orange', lat: 31.51, lng: 74.29 },
  { id: 'chauburji_ol', name: 'Chauburji (Orange)', network: 'orange', lat: 31.5565, lng: 74.3035 },
  { id: 'sp_kalma', name: 'Kalma Chowk (Speedo)', network: 'speedo', lat: 31.5042, lng: 74.3302 },
  { id: 'sp_liberty', name: 'Liberty Market', network: 'speedo', lat: 31.511, lng: 74.344 },
  { id: 'sp_gulberg', name: 'Gulberg Main', network: 'speedo', lat: 31.52, lng: 74.35 },
];

export const MOCK_ROUTES: Route[] = [
  { id: 'MB', name: 'Metrobus', network: 'metrobus', fare_pkr: 30 },
  { id: 'OL', name: 'Orange Line', network: 'orange', fare_pkr: 40 },
  { id: 'SP1', name: 'Speedo S1', network: 'speedo', fare_pkr: 20 },
];

export const MOCK_ROUTE_STOPS: RouteStop[] = [
  { route_id: 'MB', seq: 1, stop_id: 'gajju_matta', minutes_from_prev: 0 },
  { route_id: 'MB', seq: 2, stop_id: 'kalma_chowk', minutes_from_prev: 14 },
  { route_id: 'MB', seq: 3, stop_id: 'chauburji_mb', minutes_from_prev: 10 },
  { route_id: 'MB', seq: 4, stop_id: 'shahdara', minutes_from_prev: 8 },
  { route_id: 'OL', seq: 1, stop_id: 'ali_town', minutes_from_prev: 0 },
  { route_id: 'OL', seq: 2, stop_id: 'wahdat_road', minutes_from_prev: 9 },
  { route_id: 'OL', seq: 3, stop_id: 'chauburji_ol', minutes_from_prev: 8 },
  { route_id: 'SP1', seq: 1, stop_id: 'sp_kalma', minutes_from_prev: 0 },
  { route_id: 'SP1', seq: 2, stop_id: 'sp_liberty', minutes_from_prev: 6 },
  { route_id: 'SP1', seq: 3, stop_id: 'sp_gulberg', minutes_from_prev: 5 },
];

export const MOCK_TRANSFERS: Transfer[] = [
  { from_stop_id: 'kalma_chowk', to_stop_id: 'sp_kalma', walk_minutes: 2 },
  { from_stop_id: 'sp_kalma', to_stop_id: 'kalma_chowk', walk_minutes: 2 },
  { from_stop_id: 'chauburji_mb', to_stop_id: 'chauburji_ol', walk_minutes: 3 },
  { from_stop_id: 'chauburji_ol', to_stop_id: 'chauburji_mb', walk_minutes: 3 },
];

// In-memory vehicles state
let vehiclesState: Vehicle[] = [
  {
    id: 'MB-1',
    route_id: 'MB',
    dir: 1,
    seq: 1,
    progress: 0.2,
    lat: 31.43,
    lng: 74.26,
    heading: 45,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'MB-2',
    route_id: 'MB',
    dir: -1,
    seq: 3,
    progress: 0.6,
    lat: 31.54,
    lng: 74.31,
    heading: 215,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'OL-1',
    route_id: 'OL',
    dir: 1,
    seq: 1,
    progress: 0.4,
    lat: 31.47,
    lng: 74.27,
    heading: 30,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'OL-2',
    route_id: 'OL',
    dir: -1,
    seq: 2,
    progress: 0.8,
    lat: 31.53,
    lng: 74.29,
    heading: 190,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'SP1-1',
    route_id: 'SP1',
    dir: 1,
    seq: 1,
    progress: 0.5,
    lat: 31.508,
    lng: 74.337,
    heading: 75,
    updated_at: new Date().toISOString(),
  },
];

// In-memory profile & wallet state per ARCHITECTURE.md line 299-310
let profileState: Profile = {
  id: 'u1',
  full_name: 'Ayesha Khan',
  role: 'citizen',
  institution: null,
  bound_device_id: null,
  student_verified_at: null,
};

let walletState: Wallet = {
  user_id: 'u1',
  balance_pkr: 250,
  updated_at: new Date().toISOString(),
};

let transactionsState: Transaction[] = [
  {
    id: 't1',
    user_id: 'u1',
    type: 'topup',
    amount_pkr: 200,
    method: 'jazzcash',
    route_id: null,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 't0',
    user_id: 'u1',
    type: 'topup',
    amount_pkr: 50,
    method: 'raast',
    route_id: null,
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

// Active QR Tokens store (maps token_id -> { tokenId, kind, expiresAt, used: boolean })
const issuedTokens = new Map<
  string,
  { tokenId: string; kind: 'paygo' | 'student'; expiresAt: string; used: boolean }
>();

// Vehicle subscribers for Realtime simulator
type VehicleSubscriber = (v: Vehicle) => void;
const vehicleSubscribers = new Set<VehicleSubscriber>();

// Helper to look up stop coords
function getStopCoords(stopId: string): { lat: number; lng: number } {
  const s = MOCK_STOPS.find((x) => x.id === stopId);
  return s ? { lat: s.lat, lng: s.lng } : { lat: 31.5, lng: 74.3 };
}

// Tick simulator: moves mock vehicles every second
let simulatorInterval: NodeJS.Timeout | null = null;

function stepVehicles() {
  vehiclesState = vehiclesState.map((v) => {
    const routeStops = MOCK_ROUTE_STOPS.filter((rs) => rs.route_id === v.route_id).sort(
      (a, b) => a.seq - b.seq
    );
    const maxSeq = routeStops.length;
    let s = v.seq;
    let d = v.dir;
    let p = v.progress + 0.05; // smooth increment

    if (p >= 1) {
      s += d;
      p = 0;
      if (s + d < 1 || s + d > maxSeq) {
        d = (d * -1) as 1 | -1;
      }
    }

    const currentRS = routeStops.find((rs) => rs.seq === s) || routeStops[0];
    const nextSeq = Math.min(Math.max(s + d, 1), maxSeq);
    const nextRS = routeStops.find((rs) => rs.seq === nextSeq) || currentRS;

    const a = getStopCoords(currentRS.stop_id);
    const b = getStopCoords(nextRS.stop_id);

    const lat = a.lat + (b.lat - a.lat) * p;
    const lng = a.lng + (b.lng - a.lng) * p;
    const heading = Math.round((Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180) / Math.PI);

    const updatedVehicle: Vehicle = {
      ...v,
      seq: s,
      dir: d,
      progress: Math.round(p * 100) / 100,
      lat: Math.round(lat * 1000000) / 1000000,
      lng: Math.round(lng * 1000000) / 1000000,
      heading: (heading + 360) % 360,
      updated_at: new Date().toISOString(),
    };

    vehicleSubscribers.forEach((sub) => {
      try {
        sub(updatedVehicle);
      } catch (err) {
        console.error('Error notifying subscriber', err);
      }
    });

    return updatedVehicle;
  });
}

function ensureSimulatorRunning() {
  if (!simulatorInterval) {
    simulatorInterval = setInterval(stepVehicles, 1000);
  }
}

// ----------------------
// 1. TRANSIT SERVICES
// ----------------------
export async function getStops(): Promise<Stop[]> {
  return [...MOCK_STOPS];
}

export async function getRoutes(): Promise<Route[]> {
  return [...MOCK_ROUTES];
}

export async function getVehicles(): Promise<Vehicle[]> {
  ensureSimulatorRunning();
  return [...vehiclesState];
}

export function subscribeVehicles(onChange: (v: Vehicle) => void): () => void {
  ensureSimulatorRunning();
  vehicleSubscribers.add(onChange);
  return () => {
    vehicleSubscribers.delete(onChange);
  };
}

// ----------------------
// 2. PLANNER SERVICES
// ----------------------
export async function findNearestStop(lat: number, lng: number): Promise<Stop> {
  if (MOCK_STOPS.length === 0) {
    throw new Error('No stops available');
  }

  let nearest = MOCK_STOPS[0];
  let minDistance = Number.MAX_VALUE;

  for (const s of MOCK_STOPS) {
    const dLat = s.lat - lat;
    const dLng = s.lng - lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistance) {
      minDistance = distSq;
      nearest = s;
    }
  }

  return nearest;
}

export async function planTrip(
  fromStopId: string,
  toStopId: string,
  mode: 'fastest' | 'cheapest'
): Promise<Itinerary> {
  const fromStop = MOCK_STOPS.find((s) => s.id === fromStopId);
  const toStop = MOCK_STOPS.find((s) => s.id === toStopId);

  if (!fromStop || !toStop) {
    throw new Error('Invalid origin or destination stop');
  }

  if (fromStopId === toStopId) {
    return {
      mode,
      total_minutes: 0,
      total_fare_pkr: 0,
      transfers: 0,
      legs: [],
    };
  }

  // Check direct route first
  const commonRoutes = MOCK_ROUTES.filter((r) => {
    const rStops = MOCK_ROUTE_STOPS.filter((rs) => rs.route_id === r.id);
    return (
      rStops.some((rs) => rs.stop_id === fromStopId) &&
      rStops.some((rs) => rs.stop_id === toStopId)
    );
  });

  if (commonRoutes.length > 0) {
    const r = commonRoutes[0];
    const rStops = MOCK_ROUTE_STOPS.filter((rs) => rs.route_id === r.id).sort(
      (a, b) => a.seq - b.seq
    );
    const i1 = rStops.findIndex((rs) => rs.stop_id === fromStopId);
    const i2 = rStops.findIndex((rs) => rs.stop_id === toStopId);
    const [startIdx, endIdx] = i1 < i2 ? [i1, i2] : [i2, i1];

    let minutes = 0;
    for (let i = startIdx + 1; i <= endIdx; i++) {
      minutes += rStops[i].minutes_from_prev || 8;
    }

    const leg: Leg = {
      route_id: r.id,
      route_name: r.name,
      network: r.network,
      from: fromStopId,
      from_name: fromStop.name,
      to: toStopId,
      to_name: toStop.name,
      minutes,
      fare_pkr: r.fare_pkr,
      stops: rStops.slice(startIdx, endIdx + 1).map((rs) => rs.stop_id),
    };

    return {
      mode,
      total_minutes: minutes,
      total_fare_pkr: r.fare_pkr,
      transfers: 0,
      legs: [leg],
    };
  }

  // Multi-leg trip with transfer
  // Sample connection: Metrobus -> Speedo via Kalma Chowk
  if (
    (fromStop.network === 'metrobus' && toStop.network === 'speedo') ||
    (fromStop.network === 'speedo' && toStop.network === 'metrobus')
  ) {
    const mbTransferStop = 'kalma_chowk';
    const spTransferStop = 'sp_kalma';

    const leg1: Leg = {
      route_id: 'MB',
      route_name: 'Metrobus',
      network: 'metrobus',
      from: fromStopId,
      from_name: fromStop.name,
      to: mbTransferStop,
      to_name: 'Kalma Chowk',
      minutes: 14,
      fare_pkr: 30,
    };

    const leg2: Leg = {
      route_id: 'SP1',
      route_name: 'Speedo S1',
      network: 'speedo',
      from: spTransferStop,
      from_name: 'Kalma Chowk (Speedo)',
      to: toStopId,
      to_name: toStop.name,
      minutes: 8,
      fare_pkr: 20,
    };

    const transferWalk = 2; // min walk

    return {
      mode,
      total_minutes: leg1.minutes + leg2.minutes + transferWalk,
      total_fare_pkr: leg1.fare_pkr + leg2.fare_pkr,
      transfers: 1,
      legs: [leg1, leg2],
    };
  }

  // Multi-leg connection: Metrobus <-> Orange Line via Chauburji
  const leg1: Leg = {
    route_id: 'MB',
    route_name: 'Metrobus',
    network: 'metrobus',
    from: fromStopId,
    from_name: fromStop.name,
    to: 'chauburji_mb',
    to_name: 'Chauburji (Metrobus)',
    minutes: 10,
    fare_pkr: 30,
  };

  const leg2: Leg = {
    route_id: 'OL',
    route_name: 'Orange Line',
    network: 'orange',
    from: 'chauburji_ol',
    to_name: toStop.name,
    to: toStopId,
    minutes: 12,
    fare_pkr: 40,
  };

  return {
    mode,
    total_minutes: mode === 'fastest' ? 25 : 32,
    total_fare_pkr: 70,
    transfers: 1,
    legs: [leg1, leg2],
  };
}

// ----------------------
// 3. WALLET SERVICES
// ----------------------
export async function getWallet(): Promise<{ balancePkr: number }> {
  return { balancePkr: walletState.balance_pkr };
}

export async function topUp(
  amountPkr: number,
  method: 'jazzcash' | 'raast'
): Promise<{ balancePkr: number }> {
  if (amountPkr <= 0 || amountPkr > 10000) {
    throw new Error('Invalid top-up amount: must be between 1 and 10,000 PKR');
  }

  if (method !== 'jazzcash' && method !== 'raast') {
    throw new Error('Invalid payment method: choose jazzcash or raast');
  }

  walletState.balance_pkr += amountPkr;
  walletState.updated_at = new Date().toISOString();

  const newTx: Transaction = {
    id: `t_${Date.now()}`,
    user_id: walletState.user_id,
    type: 'topup',
    amount_pkr: amountPkr,
    method,
    route_id: null,
    created_at: new Date().toISOString(),
  };

  transactionsState.unshift(newTx);
  return { balancePkr: walletState.balance_pkr };
}

export async function getTransactions(limit: number = 20): Promise<Transaction[]> {
  return transactionsState.slice(0, limit);
}

// ----------------------
// 4. QR SERVICES
// ----------------------
export async function getQrToken(
  deviceId: string
): Promise<{ tokenId: string; kind: 'paygo' | 'student'; expiresAt: string }> {
  const isStudent = profileState.role === 'student';

  if (isStudent && profileState.bound_device_id && profileState.bound_device_id !== deviceId) {
    throw new Error('Device not bound for student zero-fare pass');
  }

  const tokenId = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const kind = isStudent ? 'student' : 'paygo';
  const expiresAt = new Date(Date.now() + 30000).toISOString(); // 30 seconds TTL

  issuedTokens.set(tokenId, {
    tokenId,
    kind,
    expiresAt,
    used: false,
  });

  return {
    tokenId,
    kind,
    expiresAt,
  };
}

export async function validateQr(
  tokenId: string,
  routeId: string
): Promise<ValidationResult> {
  const token = issuedTokens.get(tokenId);

  if (!token) {
    return { ok: false, reason: 'invalid' };
  }

  if (token.used) {
    return { ok: false, reason: 'already_used' };
  }

  if (new Date(token.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: 'expired' };
  }

  const route = MOCK_ROUTES.find((r) => r.id === routeId);
  if (!route) {
    return { ok: false, reason: 'unknown_route' };
  }

  const fare = token.kind === 'student' ? 0 : route.fare_pkr;

  if (fare > 0) {
    if (walletState.balance_pkr < fare) {
      return { ok: false, reason: 'insufficient_balance' };
    }
    walletState.balance_pkr -= fare;
    walletState.updated_at = new Date().toISOString();
  }

  token.used = true;

  const fareTx: Transaction = {
    id: `tx_fare_${Date.now()}`,
    user_id: walletState.user_id,
    type: 'fare',
    amount_pkr: fare,
    method: null,
    route_id: routeId,
    created_at: new Date().toISOString(),
  };

  transactionsState.unshift(fareTx);

  return {
    ok: true,
    fare,
    balance: walletState.balance_pkr,
  };
}

// ----------------------
// 5. STUDENT & AI SERVICES
// ----------------------
export async function getDeviceId(): Promise<string> {
  return 'device_simulator_demo_01';
}

export async function extractIdDetails(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _imageBase64: string
): Promise<{ fullName: string; institution: string }> {
  // Mock extraction fallback
  return {
    fullName: 'Ayesha Khan',
    institution: 'Punjab University (New Campus)',
  };
}

export async function submitStudentUpgrade(
  fullName: string,
  institution: string,
  deviceId: string,
  livenessPassed: boolean
): Promise<void> {
  if (!livenessPassed) {
    throw new Error('Liveness check failed. Please look at the camera and blink.');
  }

  profileState = {
    ...profileState,
    full_name: fullName,
    role: 'student',
    institution,
    bound_device_id: deviceId,
    student_verified_at: new Date().toISOString(),
  };
}

// ----------------------
// 6. PROFILE SERVICE
// ----------------------
export async function getProfile(): Promise<Profile> {
  return { ...profileState };
}
