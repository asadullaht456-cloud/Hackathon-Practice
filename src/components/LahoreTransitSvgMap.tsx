import React from 'react';
import { StyleSheet, View, Dimensions, Pressable } from 'react-native';
import Svg, {
  Path,
  Rect,
  Circle,
  Text as SvgText,
  G,
  Line,
} from 'react-native-svg';
import { Text } from 'react-native-paper';
import { useAppTheme } from '@/hooks/ui/useAppTheme';
import { Vehicle, Stop } from '@/services';
import { VehicleMarker } from '@/components/VehicleMarker';

interface LahoreTransitSvgMapProps {
  vehicles: Vehicle[];
  stops: Stop[];
  selectedVehicle: Vehicle | null;
  onSelectVehicle: (vehicle: Vehicle) => void;
}

const VIEWBOX_WIDTH = 400;
const VIEWBOX_HEIGHT = 580;

/**
 * LahoreTransitSvgMap: High-fidelity vector transit map of Lahore.
 * Derived from the Stitch design suite (River Ravi, Canal Road, Metrobus, Orange Line, Speedo).
 */
export const LahoreTransitSvgMap: React.FC<LahoreTransitSvgMapProps> = ({
  vehicles,
  stops,
  selectedVehicle,
  onSelectVehicle,
}) => {
  const { colors, isGlare } = useAppTheme();

  // Project geographic coordinates (lat, lng) to the stylized SVG map canvas (400 x 580)
  const projectCoords = (lat: number, lng: number) => {
    const latMin = 31.39;
    const latMax = 31.63;
    const lngMin = 74.22;
    const lngMax = 74.38;

    const y = 80 + ((latMax - lat) / (latMax - latMin)) * (520 - 80);
    const x = 35 + ((lng - lngMin) / (lngMax - lngMin)) * (350 - 35);

    return {
      x: Math.max(20, Math.min(380, x)),
      y: Math.max(40, Math.min(550, y)),
    };
  };

  const bgColor = isGlare ? '#ffffff' : '#eff4ff';
  const gridColor = isGlare ? '#e5e7eb' : '#d3e4fe';
  const riverColor = isGlare ? '#bfdbfe' : '#a5c8ff';
  const canalRoadColor = isGlare ? '#15803d' : '#266c20';
  const canalWaterColor = isGlare ? '#86efac' : '#8ed97e';
  const roadColor = isGlare ? '#d1d5db' : '#cbdbf5';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Background Grid Lines */}
        <Rect x="0" y="0" width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill={bgColor} />
        {[80, 160, 240, 320, 400, 480].map((y) => (
          <Line
            key={`h-${y}`}
            x1="0"
            y1={y}
            x2={VIEWBOX_WIDTH}
            y2={y}
            stroke={gridColor}
            strokeWidth="0.75"
            opacity={0.6}
          />
        ))}
        {[80, 160, 240, 320].map((x) => (
          <Line
            key={`v-${x}`}
            x1={x}
            y1="0"
            x2={x}
            y2={VIEWBOX_HEIGHT}
            stroke={gridColor}
            strokeWidth="0.75"
            opacity={0.6}
          />
        ))}

        {/* River Ravi Artery */}
        <Path
          d="M -20 70 Q 120 40 220 90 T 420 60"
          fill="none"
          stroke={riverColor}
          strokeWidth="14"
          strokeLinecap="round"
          opacity={isGlare ? 0.6 : 0.45}
        />
        <SvgText
          x="65"
          y="62"
          fill={isGlare ? '#000000' : '#005faf'}
          fontSize="10"
          fontWeight="bold"
          letterSpacing="0.5"
          opacity={0.7}
        >
          RIVER RAVI
        </SvgText>

        {/* Lahore Ring Road Arc */}
        <Path
          d="M 20 50 Q 320 80 370 280 T 180 560"
          fill="none"
          stroke={isGlare ? '#9ca3af' : '#dce9ff'}
          strokeWidth="5"
          strokeDasharray="6,4"
        />

        {/* Main Road Arteries */}
        <Path d="M 30 520 L 195 240" stroke={roadColor} strokeWidth="5" strokeLinecap="round" />
        <Path d="M 60 170 L 330 250" stroke={roadColor} strokeWidth="4.5" strokeLinecap="round" />
        <Path d="M 230 240 L 290 390" stroke={roadColor} strokeWidth="5" strokeLinecap="round" />

        {/* Lahore Canal Road */}
        <Path
          d="M 400 130 Q 250 250 160 380 T 10 540"
          fill="none"
          stroke={canalWaterColor}
          strokeWidth="8"
          strokeLinecap="round"
          opacity={0.4}
        />
        <Path
          d="M 400 130 Q 250 250 160 380 T 10 540"
          fill="none"
          stroke={canalRoadColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity={0.7}
        />
        <SvgText
          x="200"
          y="280"
          fill={canalRoadColor}
          fontSize="9"
          fontWeight="bold"
          letterSpacing="1"
          opacity={0.8}
        >
          CANAL ROAD
        </SvgText>

        {/* SPEEDO FEEDER NETWORK (Blue Line) */}
        <Path
          d="M 260 180 Q 220 220 240 280 T 285 365"
          fill="none"
          stroke={colors.network.speedo}
          strokeWidth="4"
          strokeDasharray="5,3"
        />

        {/* ORANGE LINE METRO TRAIN (Orange Line: Ali Town to Dera Gujran) */}
        <Path
          d="M 40 500 L 110 400 L 185 270 L 205 180 L 340 120"
          fill="none"
          stroke={colors.network.orange}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* METROBUS BRT CORRIDOR (Red Line: Gajju Matta to Shahdara) */}
        <Path
          d="M 205 90 L 205 210 L 235 320 L 235 530"
          fill="none"
          stroke={colors.network.metrobus}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* STOPS NODES & LABELS */}
        {stops.map((stop) => {
          const { x, y } = projectCoords(stop.lat, stop.lng);
          const stopColor = colors.network[stop.network];

          return (
            <G key={stop.id}>
              <Circle
                cx={x}
                cy={y}
                r={isGlare ? 5 : 4.5}
                fill="#ffffff"
                stroke={isGlare ? '#000000' : stopColor}
                strokeWidth={isGlare ? 2.5 : 2}
              />
              <SvgText
                x={x + 7}
                y={y + 3}
                fill={isGlare ? '#000000' : colors.text}
                fontSize="9"
                fontWeight={isGlare ? '800' : '600'}
              >
                {stop.name}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {/* Real-time Dynamic Vehicle Markers Placed on Top */}
      {vehicles.map((v) => {
        const { x, y } = projectCoords(v.lat, v.lng);
        // Normalize coordinates to percentage of container
        const leftPct = `${(x / VIEWBOX_WIDTH) * 100}%`;
        const topPct = `${(y / VIEWBOX_HEIGHT) * 100}%`;

        return (
          <View
            key={v.id}
            style={[
              styles.vehicleAnchor,
              {
                left: leftPct,
                top: topPct,
              },
            ]}
          >
            <Pressable onPress={() => onSelectVehicle(v)} hitSlop={12}>
              <VehicleMarker
                id={v.id}
                routeId={v.route_id}
                heading={v.heading}
                selected={selectedVehicle?.id === v.id}
              />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  vehicleAnchor: {
    position: 'absolute',
    transform: [{ translateX: -24 }, { translateY: -28 }],
    zIndex: 10,
  },
});
