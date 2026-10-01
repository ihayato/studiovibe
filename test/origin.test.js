import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { allowedRequestOrigin } from '../api/_allowed-origin.js';
import contact from '../api/contact.js';
const allowed=['https://vibe.co.jp','http://localhost:5173','http://localhost:3000'];
const source=readFileSync(new URL('../worker.prod-20260918.js',import.meta.url),'utf8');
// Only execute the origin helper and handler under test, never the production router.
function bundled(name){
 const start=source.indexOf(`async function ${name}(`);
 const end=source.indexOf(`\n__name(${name},`,start);
 assert.ok(start>=0&&end>start);
 const context=vm.createContext({URL,Response,Headers,ALLOWED_ORIGINS:allowed,allowedRequestOrigin, __name2:f=>f,
  fetch:async()=>{throw new Error('external requests forbidden in test');}});
 const headersStart=source.indexOf('function buildReqHeaders(');
 const headersEnd=source.indexOf('\n__name(buildReqHeaders,',headersStart);
 assert.ok(headersStart>=0&&headersEnd>headersStart);
 vm.runInContext(source.slice(headersStart,headersEnd),context);
 vm.runInContext(source.slice(start,end),context);return context[name];
}
function res(){return {code:200,status(n){this.code=n;return this;},json(value){this.value=value;return this;}};}
const invalid=[
 'https://vibe.co.jp.attacker.invalid','https://vibe.co.jp@attacker.invalid',
 'http://vibe.co.jp','https://vibe.co.jp:444','null','https://vibe.co.jp/path','',
];
for(const origin of invalid)test(`reject spoofed origin ${JSON.stringify(origin)}`,async()=>{
 assert.equal(allowedRequestOrigin({origin,referer:'https://vibe.co.jp/contact'},allowed),false);
 const handlers=['contactHandler','lusterClaimHandler','rondoApplyHandler','rondoReserveHandler','rondoReportHandler'];
 for(const name of handlers){const out=res();await bundled(name)({method:'POST',headers:{origin},body:{}},out,{});assert.equal(out.code,403,name);}
 const mint=await bundled('mintRoute')(new Request('https://vibe.co.jp/api/mint',{method:'POST',headers:{origin}}),{});assert.equal(mint.status,403);
 const out=res();await contact({method:'POST',headers:{origin},body:{}},out);assert.equal(out.code,403);
});
test('exact legitimate origins and parsed referers work; supplied bad origins never fall back',()=>{
 for(const origin of allowed)assert.equal(allowedRequestOrigin({origin},allowed),true);
 assert.equal(allowedRequestOrigin({referer:'https://vibe.co.jp/contact?from=home'},allowed),true);
 assert.equal(allowedRequestOrigin({referer:'https://vibe.co.jp.attacker.invalid/contact'},allowed),false);
 assert.equal(allowedRequestOrigin({referer:'https://user@vibe.co.jp/contact'},allowed),false);
 assert.equal(allowedRequestOrigin({},allowed),false);
 assert.equal(allowedRequestOrigin({origin:'null',referer:'https://vibe.co.jp/'},allowed),false);
});
test('allowed contact origin passes origin gate and still requires fields',async()=>{
 for(const handler of [contact,bundled('contactHandler')]){
  const out=res();await handler({method:'POST',headers:{origin:allowed[0]},body:{}},out,{});assert.equal(out.code,400);
 }
});
test('bundled helper and module helper stay behaviorally identical',()=>{
 const end=source.indexOf('\n}\n')+3;const context=vm.createContext({URL});vm.runInContext(source.slice(0,end),context);
 for(const origin of [...allowed,...invalid])assert.equal(context.allowedRequestOrigin({origin},allowed),allowedRequestOrigin({origin},allowed));
});

// Exercise the deployed Request -> Vercel-shaped adapter, not just the helper.
// Missing Origin must remain distinct from a supplied empty/invalid Origin.
for(const name of ['contactHandler','lusterClaimHandler','rondoApplyHandler','rondoReserveHandler','rondoReportHandler'])
test(`${name}: production adapter preserves legitimate Referer fallback`,async()=>{
 const run=bundled('runVercelHandler'),handler=bundled(name),url=new URL('https://vibe.co.jp/api/test');
 const cases=[
  [{referer:'https://vibe.co.jp/rondo.html'},400],
  [{origin:'https://vibe.co.jp'},400],
  [{origin:'',referer:'https://vibe.co.jp/rondo.html'},403],
  [{origin:'https://vibe.co.jp.attacker.invalid',referer:'https://vibe.co.jp/'},403],
  [{referer:'https://vibe.co.jp@attacker.invalid/'},403],
  [{},403],
 ];
 for(const [headers,status] of cases){
  const response=await run(handler,new Request(url,{method:'POST',headers,body:'{}'}),{},url);
  assert.equal(response.status,status,JSON.stringify(headers));
 }
});
