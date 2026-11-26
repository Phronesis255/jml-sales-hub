const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const B = require('../brand-book.js');
const C = require('../core.js');
const O = require('../operations.js');
const P = require('../prompt-jobs.js');
const sample = require('../examples/brand-book.example.json');

test('sample and extensible brand book round-trip through workspace backups', () => {
  const state = C.seed([], '2026-11-26'), brand = state.brands[0];
  const book = {...sample, extraGuidance:{preferredWords:['fresh','welcoming']}};
  B.apply(brand, book, 'brand.json', O.account(state,brand.id,true).foundation);
  const restored = JSON.parse(JSON.stringify(state));
  C.validate(restored); O.validate(restored);
  assert.deepEqual(restored.brands[0].brandBook, book);
  assert.equal(restored.brands[0].primary, sample.colors.primary);
  assert.equal(restored.brands[0].accent, sample.colors.secondary);
  assert.equal(B.voice(restored.brands[0]),sample.brandVoice.description);
  assert.equal(restored.brands[0].operations.foundationVersions.length,0);
});

test('reject malformed JSON, missing voice, invalid colors and unsupported versions', () => {
  assert.throws(()=>B.parse('{oops'), /valid JSON/);
  for (const patch of [{schemaVersion:2},{colors:{primary:'red',secondary:'#112233'}},{brandVoice:{}},{logo:'logo.svg'},{typography:{body:123}}]) {
    assert.throws(()=>B.validate({...sample,...patch}));
  }
  assert.deepEqual(B.parse('\ufeff'+JSON.stringify(sample)), sample);
});

test('file validation reports empty and oversized uploads before reading', async () => {
  await assert.rejects(B.read(null),/Choose a brand book/);
  await assert.rejects(B.read({size:1024*1024+1,text:()=>{throw Error('should not read');}}),/smaller than 1 MB/);
  assert.deepEqual(await B.read({size:100,text:async()=>JSON.stringify(sample)}),sample);
});

test('foundation voice edits override imported voice in subsequent prompt jobs', () => {
  const state = C.seed([], '2026-11-26'), brand = state.brands[0];
  B.apply(brand,sample,'brand.json',O.account(state,brand.id,true).foundation);
  brand.operations.foundation.brandVoice = 'Calm and concise.';
  const post = C.makePost({brandId:brand.id,title:'Brand voice test',platform:'LinkedIn',format:'Text post',timezone:'UTC'});
  state.posts.push(post);
  state.resources=[{id:'template',brandId:brand.id,versions:[{name:'Draft',type:'Prompt template',notes:'Write the post.'}]}];
  const input={resourceId:'template',version:1,postId:post.id,revision:post.briefRevision,notes:''};
  P.prepare(state,C,brand.id,'Tester',input);
  assert.match(state.promptJobs[0].prompt,/Brand voice — Calm and concise\./);
  brand.operations.foundation.brandVoice='Playful.';
  assert.match(state.promptJobs[0].prompt,/Calm and concise/);
  assert.equal(B.voice(brand),'Playful.');
});

test('account form creates the client and foundation together without persisting File objects', async () => {
  const sandbox={window:{},JMLBrandBook:B,JMLOps:O,Intl};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../agency.js'),'utf8'),sandbox);
  const state=C.seed([], '2026-11-26');
  const file={name:'brand.json',size:100,text:async()=>JSON.stringify(sample)};
  const form={id:'account-form',elements:{brandBookFile:{files:[file]}}};
  const ctx={C,ui:{},commit:async mutate=>mutate(state),setBrand:()=>{},navigate:()=>{}};
  await sandbox.window.JMLAgency.submit(ctx,form,{name:'Test account',description:'Coffee',timezone:'UTC',clientSupervisionLevel:'1',brandBookFile:file});
  const brand=state.brands.at(-1);
  assert.equal(brand.clientSupervisionLevel,1);
  assert.equal(brand.brandBookFile,'brand.json');
  assert.equal(B.voice(brand),sample.brandVoice.description);
  C.validate(state); O.validate(state);
  file.text=async()=>'{invalid';
  const count=state.brands.length;
  await assert.rejects(sandbox.window.JMLAgency.submit(ctx,form,{name:'Bad account',timezone:'UTC',clientSupervisionLevel:'1'}),/valid JSON/);
  assert.equal(state.brands.length,count);
});
