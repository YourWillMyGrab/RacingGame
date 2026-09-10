import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ModularRoute } from '../src/road/route.ts';
import { MODULES, validateConnection, validateModule } from '../src/road/modules.ts';
import { randomStream } from '../src/road/seed.ts';

test('same seed reproduces all geometry; separate random streams do not disturb roads',()=>{
  const a=new ModularRoute('7F2C-A91D');
  const cosmetic=randomStream('7F2C-A91D','cosmetics');for(let i=0;i<100;i++)cosmetic();
  assert.deepEqual(new ModularRoute('7f2c-a91d'),a);
  assert.notDeepEqual(new ModularRoute('another-seed').points,a.points);
});
test('authored modules are valid and incompatible sockets/grades/widths are rejected',()=>{
  for(const m of MODULES)assert.deepEqual(validateModule(m),[]);
  const socket=MODULES[0].entry;
  assert.equal(validateConnection(socket,{...socket,x:1}),false);
  assert.equal(validateConnection(socket,{...socket,yaw:.1}),false);
  assert.equal(validateConnection(socket,{...socket,grade:.1}),false);
  assert.equal(validateConnection(socket,{...socket,width:10}),false);
  assert.equal(validateConnection(socket,{...socket,x:NaN}),false);
  assert.ok(validateModule({...MODULES[0],rise:40}).length);
  assert.ok(validateModule({...MODULES[0],width:2}).length);
  assert.ok(validateModule({...MODULES[0],recoveryAnchors:[]}).length);
});
test('generation is bounded and finish and recovery samples remain reachable',()=>{
  assert.throws(()=>new ModularRoute('seed',Infinity));
  assert.throws(()=>new ModularRoute('seed',129));
  for(let seed=0;seed<100;seed++) {
    const r=new ModularRoute(`TEST-${seed}`,24);assert.deepEqual(r.validate(),[]);assert.equal(r.chunks.length,24);
    for(const c of r.chunks)for(const s of c.definition.recoveryAnchors){const p=r.pointAt(c.start+s);assert.ok(r.nearest(p.x,p.z).distance<=1.01);}
    assert.equal(r.pointAt(r.length+10).s,r.length);
  }
});
