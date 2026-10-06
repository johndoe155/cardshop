'use client';

/**
 * Device orientation -> foil tilt.
 *
 * Phones never fire pointermove unless a finger is down, so every card used to
 * sit at a frozen uPointer of 0.5/0.5 on mobile — the holo looked painted on.
 * We read DeviceOrientation into the very same uTilt uniform the pointer feeds,
 * so tilting the phone sweeps the foil hue exactly like a mouse does.
 *
 * Values are a plain mutable object (not React state) so a 60Hz sensor never
 * triggers a re-render; components sample it inside useFrame.
 */
export const deviceTilt = { x: 0, y: 0, active: false };

let listening = false;
const baseline = { beta: 0, gamma: 0 };
let hasBaseline = false;

const clamp1 = (n: number) => Math.max(-1, Math.min(1, n));

function onOrientation(e: DeviceOrientationEvent) {
  const beta = e.beta;
  const gamma = e.gamma;
  if (beta == null || gamma == null) return;

  // First sample sets the neutral pose, so nothing jumps the moment the sensor
  // wakes up. It then drifts very slowly toward the current pose, so a new
  // holding angle settles back to "flat" after a few seconds.
  if (!hasBaseline) {
    baseline.beta = beta;
    baseline.gamma = gamma;
    hasBaseline = true;
  } else {
    baseline.beta += (beta - baseline.beta) * 0.005;
    baseline.gamma += (gamma - baseline.gamma) * 0.005;
  }

  deviceTilt.x = clamp1((gamma - baseline.gamma) / 32); // left / right
  deviceTilt.y = clamp1((beta - baseline.beta) / 32); // front / back
  deviceTilt.active = true;
}

/** Safe to call repeatedly — attaches the sensor listener once. */
export function initDeviceTilt() {
  if (listening || typeof window === 'undefined') return;
  window.addEventListener('deviceorientation', onOrientation, { passive: true });
  listening = true;
}

/**
 * iOS 13+ gates the gyro behind an explicit grant that only resolves from a
 * user gesture. Call this from the site's first click/keydown handler; on
 * Android and desktop it just attaches the listener.
 */
export async function enableGyro(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const DOE = (
    window as unknown as {
      DeviceOrientationEvent?: { requestPermission?: () => Promise<PermissionState | 'prompt'> };
    }
  ).DeviceOrientationEvent;
  if (!DOE) return false;
  if (typeof DOE.requestPermission === 'function') {
    try {
      const res = await DOE.requestPermission();
      if (res !== 'granted') return false;
    } catch {
      return false;
    }
  }
  initDeviceTilt();
  return true;
}

/** Pointer position on the card blended with the gyro, in -1..1-ish tilt units. */
export function tiltTarget(
  out: { x: number; y: number },
  pointerX: number,
  pointerY: number,
  gain = 1.3
) {
  out.x = (pointerX - 0.5) * gain + deviceTilt.x;
  out.y = (pointerY - 0.5) * gain + deviceTilt.y;
  return out;
}
