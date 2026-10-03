import { useEffect, useState } from 'react';
import { useAppTheme } from '@/hooks/ui/useAppTheme';

/**
 * useGlareMode: Manages sunlight glare mode.
 * Integrates optional ambient LightSensor (threshold > 10,000 lux for outdoor Pakistani noon)
 * with manual override switch in Profile.
 */
export function useGlareMode() {
  const { isGlare, mode, setThemeMode, autoGlareEnabled, setAutoGlareEnabled, toggleGlareMode } =
    useAppTheme();
  const [currentLux, setCurrentLux] = useState<number | null>(null);
  const [sensorAvailable, setSensorAvailable] = useState<boolean>(false);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;
    let isMounted = true;

    async function initSensor() {
      if (!autoGlareEnabled) {
        if (subscription) subscription.remove();
        return;
      }

      try {
        // Dynamic import to prevent crash if expo-sensors is not yet installed in package.json
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Sensors = require('expo-sensors');
        if (Sensors?.LightSensor) {
          const isAvail = await Sensors.LightSensor.isAvailableAsync();
          if (!isMounted) return;
          setSensorAvailable(isAvail);

          if (isAvail) {
            Sensors.LightSensor.setUpdateInterval(1000);
            subscription = Sensors.LightSensor.addListener(
              (data: { illuminance: number }) => {
                if (!isMounted) return;
                const lux = data.illuminance;
                setCurrentLux(lux);

                // In bright Pakistani direct sunlight (lux > 10,000)
                if (lux > 10000) {
                  if (mode !== 'glare') {
                    setThemeMode('glare');
                  }
                } else if (lux < 7000 && mode === 'glare') {
                  setThemeMode(null);
                }
              }
            );
          }
        }
      } catch {
        // Fallback gracefully to manual switch if sensor package isn't present
        if (isMounted) setSensorAvailable(false);
      }
    }

    initSensor();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, [autoGlareEnabled, mode, setThemeMode]);

  return {
    isGlare,
    mode,
    currentLux,
    sensorAvailable,
    autoGlareEnabled,
    setAutoGlareEnabled,
    toggleGlareMode,
  };
}
