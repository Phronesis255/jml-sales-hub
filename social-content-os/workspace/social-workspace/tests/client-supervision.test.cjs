const assert = require('node:assert/strict');
const test = require('node:test');
const C = require('../core.js');
const G = require('../governance.js');
const O = require('../operations.js');
const D = require('../release-domain.js');
const Demo = require('../demo-data.js');
const P = require('../personas.js');
const Scenarios = require('../scenarios.js');

const admin = {brand:'brand_northstar',personId:'person-local-admin',actor:'Workspace administrator',role:'agency'};
const qa = {...admin,personId:'person-northstar-asha',actor:'Asha Raman'};
const client = {...admin,personId:'person-northstar-sam',actor:'Sam Rivera',role:'client'};
const publisher = {...admin,personId:'person-northstar-luca',actor:'Luca Vale'};
const checks = Object.fromEntries(C.qcKeys.map(key => [key,true]));
const baseline = C.seed([], '2026-11-26');
G.migrate(baseline);
Demo.load(baseline, admin, {full:true,day:'2026-11-26'});
G.migrate(baseline);

function validate(state) {
  C.validate(state);
  O.validate(state);
  D.validate(state);
  G.validate(state);
}

function fixture(level) {
  const state = C.clone(baseline);
  state.brands.find(brand => brand.id === admin.brand).clientSupervisionLevel = level;
  G.migrate(state);
  return state;
}

function post(state) {
  return state.posts.find(item => item.demo?.key === 'qa-draft');
}

function transaction(state, ui, action) {
  const next = C.clone(state);
  action(next);
  G.migrate(next);
  G.authorizeMutation(state, next, ui);
  G.captureMutation(state, next, ui);
  validate(next);
  return next;
}

function placementFields(item, level) {
  return {
    contentId:item.id,account:'Test destination '+level,platform:item.platform,mode:'simulation',
    scheduledLocal:item.date+'T09:00',timezone:item.timezone,
    owner:publisher.actor,ownerPersonId:publisher.personId,
    communityOwner:qa.actor,communityOwnerPersonId:qa.personId
  };
}

for (const level of [0,1,2]) {
  test('Level '+level+': required reviews, publisher handoff and persistence', () => {
    let state = fixture(level);
    assert.equal(C.isApproved(post(state)), false);
    state = transaction(state, qa, next => C.submit(post(next), qa.actor, checks));
    let item = post(state);
    assert.equal(C.isApproved(item), level < 2);
    assert.equal(C.latest(item).decisions.length, 0, 'QA must not invent client approval');
    const shared = P.shared(state, client);
    assert.equal(shared.creatives.some(row => row.parent === item.id), level === 2);
    assert.equal(shared.plans.some(row => row.kind === 'strategy'), false);
    assert.equal(shared.plans.length > 0, level > 0);
    assert.equal(state.governance.assignments.some(row => row.contentId === item.id && row.kind === 'publish' && G.assignmentActive(state, row)), level < 2);

    if (level === 2) {
      // A cached post field cannot bypass the account's actual policy.
      item.clientSupervisionLevel = 0;
      item.calendarCovered = true;
      assert.throws(() => D.createPlacement(state, item.brandId, placementFields(item, level), publisher.actor));
      G.migrate(state);
      state = transaction(state, client, next => C.decide(post(next), 'approved', '', client.actor));
      item = post(state);
      assert.ok(C.isApproved(item));
    }

    assert.ok(G.can(state, publisher, 'publish', item), 'Luca can publish without an Asha approval');
    const handoffs = state.governance.assignments.filter(row => row.contentId === item.id && row.kind === 'publish' && G.assignmentActive(state, row));
    assert.equal(handoffs.length, 1, 'The final required review automatically creates the publishing handoff');
    assert.equal(handoffs[0].personId, publisher.personId);
    assert.equal(handoffs[0].versionId, C.latest(item).id);
    assert.ok(state.governance.notifications.some(row => row.assignmentId === handoffs[0].id && row.recipientId === publisher.personId));
    let placement;
    state = transaction(state, publisher, next => {
      placement = D.createPlacement(next, item.brandId, placementFields(item, level), publisher.actor);
    });
    assert.equal(placement.handoff.approvalKind, level === 2 ? 'client-approval' : 'internal-qa');
    state = transaction(state, publisher, next => {
      D.receiveHandoff(next, item.brandId, placement.id, publisher.actor, publisher.personId);
      D.advance(next, item.brandId, placement.id, 'schedule', {checked:true,scenario:'accept'}, publisher.actor);
      D.advance(next, item.brandId, placement.id, 'verify', {checked:true}, publisher.actor);
    });
    assert.equal(state.releaseLearning.placements.find(row => row.id === placement.id).state, 'verified');
    const restored = JSON.parse(JSON.stringify(state));
    G.migrate(restored);
    validate(restored);
    assert.equal(C.supervisionLevel(restored.brands.find(brand => brand.id === item.brandId)), level);
  });
}

test('A changed calendar scope blocks Levels 1 and 2, but not Level 0', () => {
  for (const level of [0,1,2]) {
    const state = fixture(level);
    const item = post(state);
    item.date = '2027-01-01';
    G.migrate(state);
    assert.equal(!!O.calendarCoverage(state,item), level === 0);
    if (level) assert.throws(() => C.submit(item, qa.actor, checks), /calendar/i);
    else C.submit(item, qa.actor, checks);
  }
});

test('Level 0 needs no named client approver, but internal QA is still required', () => {
  const state = fixture(0);
  O.saveFoundation(state, admin.brand, {business:'Test',audience:'Test',scope:'Test',priorities:'Test'}, qa.actor);
  assert.throws(() => D.createPlacement(state, admin.brand, placementFields(post(state), 0), publisher.actor));
});

test('Existing accounts migrate to Level 1 without rewriting approval history', () => {
  const state = C.clone(baseline);
  const histories = state.posts.map(item => ({id:item.id,history:C.clone(item.history),versions:C.clone(item.versions)}));
  for (const brand of state.brands) delete brand.clientSupervisionLevel;
  for (const stage of state.governance.stageAssignments) if (stage.stage === 9) stage.decisionPersonId = qa.personId;
  G.migrate(state);
  assert.ok(state.brands.every(brand => brand.clientSupervisionLevel === 1));
  assert.deepEqual(state.posts.map(item => ({id:item.id,history:item.history,versions:item.versions})), histories);
  assert.ok(state.governance.stageAssignments.filter(stage => stage.stage === 9).every(stage => stage.decisionPersonId === stage.deliveryPersonId));
  const migrated = C.clone(state);
  assert.equal(G.migrate(state), false);
  assert.deepEqual(state, migrated);
  validate(state);
});

test('Fresh demo loading and practice scenarios retain valid release evidence', () => {
  validate(baseline);
  const state = C.seed([]);
  G.migrate(state);
  Scenarios.prepare(state);
  G.migrate(state);
  validate(state);
});

test('Account export and restore preserve each supervision level', () => {
  for (const level of [0,1,2]) {
    const source = fixture(level);
    const pack = JSON.parse(JSON.stringify(G.scopedExport(source, admin)));
    const restored = fixture(1);
    const before = C.clone(restored);
    G.applyScopedRestore(restored, admin, pack);
    G.assertScopedRestore(before, restored, admin, admin.brand);
    G.migrate(restored);
    validate(restored);
    assert.equal(C.supervisionLevel(restored.brands.find(brand => brand.id === admin.brand)), level);
  }
});

test('The sample handoff has calendar context and follows the account level', () => {
  for (const level of [0,1,2]) {
    let state = fixture(level);
    let sampleId;
    state = transaction(state, admin, next => { sampleId = G.sampleHandoff(next, admin).id; });
    state = transaction(state, publisher, next => {
      const item = next.posts.find(item => item.id === sampleId);
      C.addVersion(item, {caption:item.brief.caption,assets:[],note:'Practice draft'}, publisher.actor);
    });
    state = transaction(state, qa, next => C.submit(next.posts.find(item => item.id === sampleId), qa.actor, checks));
    assert.equal(C.isApproved(state.posts.find(item => item.id === sampleId)), level < 2);
  }
});

test('Intermediate production checks stay with internal QA at every level', () => {
  for (const level of [0,1,2]) {
    const state = fixture(level);
    const item = post(state);
    const task = {id:'test-style-frames',label:'Approve style frames',owner:client.actor,gate:true,done:false};
    item.production.tasks.push(task);
    G.migrate(state);
    assert.equal(task.owner, qa.actor);
  }
});

test('Existing ready posts are available to the publisher without coordinator reassignment', () => {
  const state = fixture(1);
  const item = post(state);
  C.submit(item, qa.actor, checks);
  item.brief.owner = 'Another producer';
  item.production.producer = 'Another producer';
  state.governance.assignments = state.governance.assignments.filter(row => row.contentId !== item.id);
  state.governance.assignments.push({id:'older-release',brandId:item.brandId,contentId:item.id,kind:'publish',personId:qa.personId,placementId:'historical-placement',versionId:'older-version',briefRevision:item.briefRevision-1,state:'completed'});
  assert.equal(G.publisherFor(state,item).id, publisher.personId);
  assert.ok(G.can(state,publisher,'read',item));
  assert.ok(G.can(state,publisher,'publish',item));
  assert.equal(G.can(state,client,'publish',item), false);
  assert.equal(G.can(state,qa,'publish',item), false);
});

test('Publishing handoffs are not duplicated and expire when the version changes', () => {
  let state = transaction(fixture(1),qa,next => C.submit(post(next),qa.actor,checks));
  const handoffs = value => value.governance.assignments.filter(row => row.contentId === post(value).id && row.kind === 'publish' && G.assignmentActive(value,row));
  const id = handoffs(state)[0].id;
  const again = C.clone(state);
  G.captureMutation(state,again,qa);
  assert.equal(handoffs(again).length,1);
  assert.equal(handoffs(again)[0].id,id);
  state = transaction(state,publisher,next => C.addVersion(post(next),{caption:'Updated draft',assets:C.clone(C.latest(post(next)).assets),note:'New version'},publisher.actor));
  assert.equal(handoffs(state).length,0);
});
