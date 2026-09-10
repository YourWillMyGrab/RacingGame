import { ModularRoute } from '../src/road/route.ts';
const count=Number(process.argv[2]??1000);
if(!Number.isInteger(count)||count<1||count>100000)throw new Error('Supply a seed count between 1 and 100000');
let modules=0, points=0;
const categories=new Set<string>();
for(let i=0;i<count;i++) {
  const route=new ModularRoute(`STRESS-${i}`,32);
  const errors=route.validate();if(errors.length)throw new Error(`STRESS-${i}: ${errors.join(',')}`);
  modules+=route.chunks.length;points+=route.points.length;
  for(const c of route.chunks)categories.add(c.definition.category);
}
console.log(JSON.stringify({seeds:count,modules,points,invalidConnections:0,invalidGrades:0,missingFinish:0,excessiveRepetition:0,categories:[...categories],branches:'Not authored yet; only a connected linear route is validated.'},null,2));
