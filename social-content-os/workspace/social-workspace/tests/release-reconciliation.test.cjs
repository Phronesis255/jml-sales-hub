const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const C = require('../core.js');
const G = require('../governance.js');
const O = require('../operations.js');
const D = require('../release-domain.js');
const Demo = require('../demo-data.js');
const U = require('../workflow-ui.js');

const admin = {brand:'brand_northstar',personId:'person-local-admin',actor:'Workspace administrator',role:'agency'};
const publisher = {...admin,personId:'person-northstar-luca',actor:'Luca Vale'};

function fixture() {
  const state = C.seed([], '2026-11-26');
  G.migrate(state);
  Demo.load(state, admin, {full:true,day:'2026-11-26'});
  G.migrate(state);
  const placement = state.releaseLearning.placements.find(row => row.state === 'uncertain');
  return {state,placement};
}

function transaction(state, action) {
  const next = C.clone(state);
  action(next);
  G.migrate(next);
  G.authorizeMutation(state,next,publisher);
  G.captureMutation(state,next,publisher);
  C.validate(next);
  O.validate(next);
  D.validate(next);
  G.validate(next);
  return next;
}

test('Reconciliation can finish an older submitted demo and create the community handoff', () => {
  let {state,placement} = fixture();
  // Older saved demo releases have a real package snapshot but no calendar snapshot.
  const ops = O.account(state,admin.brand);
  ops.calendars = [];
  ops.decisions = ops.decisions.filter(row => row.kind !== 'calendar');
  G.migrate(state);
  assert.equal(D.currentPackage(state,placement),false);
  const snapshot = C.clone(placement.handoff);
  state = transaction(state,next => D.advance(next,admin.brand,placement.id,'reconcile',{},publisher.actor));
  assert.equal(state.releaseLearning.placements.find(row => row.id === placement.id).state,'scheduled');
  assert.equal(state.governance.assignments.some(row => row.placementId === placement.id && row.kind === 'community'),false);
  state = transaction(state,next => D.advance(next,admin.brand,placement.id,'verify',{checked:true},publisher.actor));
  placement = state.releaseLearning.placements.find(row => row.id === placement.id);
  assert.equal(placement.state,'verified');
  assert.deepEqual(placement.handoff,snapshot);
  assert.equal(placement.verification.versionId,snapshot.versionId);
  assert.equal(state.governance.assignments.filter(row => row.placementId === placement.id && row.kind === 'community' && G.assignmentActive(state,row)).length,1);
  assert.equal(state.governance.assignments.filter(row => row.placementId === placement.id && row.kind === 'publish' && G.assignmentActive(state,row)).length,0);
  assert.throws(() => D.advance(state,admin.brand,placement.id,'verify',{checked:true},publisher.actor),/scheduling|handoff/i);
});

test('Verification records the sent version after a new draft, without allowing another submission', () => {
  let {state,placement} = fixture();
  const post = state.posts.find(row => row.id === placement.contentId);
  C.addVersion(post,{caption:'A newer draft that has not passed QA',assets:C.clone(C.latest(post).assets),note:'Revision'},publisher.actor);
  G.migrate(state);
  assert.equal(D.currentPackage(state,placement),false);
  state = transaction(state,next => D.advance(next,admin.brand,placement.id,'reconcile',{},publisher.actor));
  assert.throws(() => D.createPlacement(state,admin.brand,{contentId:post.id},publisher.actor));
  state = transaction(state,next => D.advance(next,admin.brand,placement.id,'verify',{checked:true},publisher.actor));
  const verified = state.releaseLearning.placements.find(row => row.id === placement.id);
  assert.equal(verified.verification.versionId,placement.versionId);
  assert.notEqual(verified.verification.versionId,C.latest(state.posts.find(row => row.id === post.id)).id);
});

test('A recovered schedule remains in Luca’s Today before the scheduled date', () => {
  const {state,placement} = fixture();
  D.advance(state,admin.brand,placement.id,'reconcile',{},publisher.actor);
  const window = {JMLReleaseDomain:D,JMLGovernance:G,JMLWorkflowUI:U};
  const Clock = class extends Date { constructor(...args) { super(...(args.length?args:['2026-11-26T12:00:00Z'])); } static now() { return Date.parse('2026-11-26T12:00:00Z'); } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../attention.js'),'utf8'),{window,Intl,Date:Clock});
  const html = window.JMLAttention.view({state,ui:publisher,e:value=>String(value??'')});
  assert.ok(html.includes(placement.id));
  assert.match(html,/verify publication/i);
});

test('Verification rejects a changed sent snapshot or missing publisher receipt', () => {
  for (const corrupt of [p=>{p.handoff.caption='Not the submitted caption';},p=>{p.receipt=null;},p=>{p.handoff.decisionId='missing';}]) {
    const {state,placement} = fixture();
    D.advance(state,admin.brand,placement.id,'reconcile',{},publisher.actor);
    corrupt(placement);
    assert.equal(D.sentPackageValid(state,placement),false);
    assert.throws(() => D.advance(state,admin.brand,placement.id,'verify',{checked:true},publisher.actor),/package|receipt/i);
    assert.equal(placement.state,'scheduled');
  }
});

test('Manual verification still requires live evidence for the exact sent version', () => {
  const {state,placement} = fixture();
  state.posts.find(row => row.id === placement.contentId).example = false;
  placement.mode = 'manual';
  placement.state = 'handed-off';
  assert.throws(() => D.advance(state,admin.brand,placement.id,'verify',{checked:true},publisher.actor),/HTTPS|actual publication/i);
  D.advance(state,admin.brand,placement.id,'verify',{checked:true,url:'https://example.com/posts/confirmed',actualAt:new Date(Date.now()-60000).toISOString(),note:'Checked the exact sent caption and destination'},publisher.actor);
  assert.equal(placement.state,'verified');
  assert.equal(placement.verification.versionId,placement.versionId);
});
