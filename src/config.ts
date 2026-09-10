/** Metres, seconds, kilograms, radians. All handling values live here. */
export const DEFAULT_TUNING = {
  mass: 1200, engine: 14500, brakes: 26000, reverse: 6500,
  maxSpeed: 61, reverseSpeed: 10, drag: .0033, rollingDrag: .14,
  grip: 8.2, driftGrip: 1.6, steer: 1.05, highSpeedSteer: .53,
  steerResponse: 7, yawResponse: 7, driftRotation: 1.38,
  springLength: .85, spring: 32000, damper: 4200, downforce: 1.5,
  boostForce: 12000, boostMaxSpeed: 82, flowDrain: 24, driftFlow: 13,
  minDriftSpeed: 9, minSlip: .14, maxSlip: .95,
  impactThreshold: 5, damageScale: 2.3, recoveryPenalty: 3,
};
export const tuning = { ...DEFAULT_TUNING };
export const STEP = 1/60;
