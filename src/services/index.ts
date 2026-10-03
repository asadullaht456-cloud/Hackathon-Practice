import * as mock from './mock';

export * from './types';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

// ----------------------
// TRANSIT
// ----------------------
export const getStops = async () => {
  if (USE_MOCK) return mock.getStops();
  // Real service fallback to mock until real transit.ts is hooked in Task 15
  return mock.getStops();
};

export const getRoutes = async () => {
  if (USE_MOCK) return mock.getRoutes();
  return mock.getRoutes();
};

export const getVehicles = async () => {
  if (USE_MOCK) return mock.getVehicles();
  return mock.getVehicles();
};

export const subscribeVehicles = (onChange: (v: mock.Vehicle) => void) => {
  if (USE_MOCK) return mock.subscribeVehicles(onChange);
  return mock.subscribeVehicles(onChange);
};

// ----------------------
// PLANNER
// ----------------------
export const findNearestStop = async (lat: number, lng: number) => {
  if (USE_MOCK) return mock.findNearestStop(lat, lng);
  return mock.findNearestStop(lat, lng);
};

export const planTrip = async (
  fromStopId: string,
  toStopId: string,
  mode: 'fastest' | 'cheapest'
) => {
  if (USE_MOCK) return mock.planTrip(fromStopId, toStopId, mode);
  return mock.planTrip(fromStopId, toStopId, mode);
};

// ----------------------
// WALLET
// ----------------------
export const getWallet = async () => {
  if (USE_MOCK) return mock.getWallet();
  return mock.getWallet();
};

export const topUp = async (amountPkr: number, method: 'jazzcash' | 'raast') => {
  if (USE_MOCK) return mock.topUp(amountPkr, method);
  return mock.topUp(amountPkr, method);
};

export const getTransactions = async (limit?: number) => {
  if (USE_MOCK) return mock.getTransactions(limit);
  return mock.getTransactions(limit);
};

// ----------------------
// QR
// ----------------------
export const getQrToken = async (deviceId: string) => {
  if (USE_MOCK) return mock.getQrToken(deviceId);
  return mock.getQrToken(deviceId);
};

export const validateQr = async (tokenId: string, routeId: string) => {
  if (USE_MOCK) return mock.validateQr(tokenId, routeId);
  return mock.validateQr(tokenId, routeId);
};

// ----------------------
// STUDENT & AI
// ----------------------
export const getDeviceId = async () => {
  if (USE_MOCK) return mock.getDeviceId();
  return mock.getDeviceId();
};

export const extractIdDetails = async (imageBase64: string) => {
  if (USE_MOCK) return mock.extractIdDetails(imageBase64);
  return mock.extractIdDetails(imageBase64);
};

export const submitStudentUpgrade = async (
  fullName: string,
  institution: string,
  deviceId: string,
  livenessPassed: boolean
) => {
  if (USE_MOCK) return mock.submitStudentUpgrade(fullName, institution, deviceId, livenessPassed);
  return mock.submitStudentUpgrade(fullName, institution, deviceId, livenessPassed);
};

// ----------------------
// PROFILE
// ----------------------
export const getProfile = async () => {
  if (USE_MOCK) return mock.getProfile();
  return mock.getProfile();
};
