import type { Vehicle } from '../src/vehicle.ts';
import type { ModularRoute } from '../src/road/route.ts';
export function drive(route:ModularRoute,car:Vehicle,braking=true) {
  const p=car.body.translation(),target=car.route.pointAt(car.progress+6+car.speed*.32);
  let error=Math.atan2(-(target.x-p.x),-(target.z-p.z))-car.yaw;error=Math.atan2(Math.sin(error),Math.cos(error));
  const speed=route.speedAt(car.progress)*.96;
  return {throttle:braking&&car.speed>speed?0:.94,brake:braking&&car.speed>speed+.7?.65:0,steer:Math.max(-1,Math.min(1,error*3)),handbrake:false,boost:false};
}
