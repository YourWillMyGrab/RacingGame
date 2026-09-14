/** Metres, seconds, kilograms, radians. All handling values live here. */
export const DEFAULT_TUNING = {
  mass: 1200, engine: 18000, brakes: 26000, reverse: 6500,
  maxSpeed: 65, reverseSpeed: 10, drag: .0026, rollingDrag: .11,
  grip: 13, driftGrip: 1.6, steer: 1.05, highSpeedSteer: .53,
  steerResponse: 10, yawResponse: 10, driftRotation: 1.38,
  springLength: .85, spring: 32000, damper: 4200, downforce: 1.5,
  maxLateralAccel: 15,
  boostForce: 12000, boostMaxSpeed: 82, flowDrain: 18, driftFlow: 23,
  minDriftSpeed: 6, minSlip: .08, maxSlip: 1.05,
  cornerFlow: 4, speedFlow: 3, speedFlowThreshold: 23, cleanExitFlow: 8,
  impactThreshold: 5, damageScale: 2.3, recoveryPenalty: 3,
};
export const tuning = { ...DEFAULT_TUNING };
export const STEP = 1/60;
