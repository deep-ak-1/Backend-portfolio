const test = require('node:test');
const assert = require('node:assert/strict');
const { projectSanitizer, skillSanitizer, experienceSanitizer, profileSanitizer } = require('../utils/sanitize');

test('project requires a title', () => {
  assert.ok(projectSanitizer({}).error);
});

test('project accepts a valid payload and trims values', () => {
  const r = projectSanitizer({ title: '  Portfolio  ', technologies: ['React', '', 'Node'] });
  assert.equal(r.value.title, 'Portfolio');
  assert.deepEqual(r.value.technologies, ['React', 'Node']);
  assert.equal(r.value.published, true);
});

test('project rejects javascript: and protocol-relative URLs', () => {
  assert.ok(projectSanitizer({ title: 'x', githubUrl: 'javascript:alert(1)' }).error);
  assert.ok(projectSanitizer({ title: 'x', liveUrl: '//evil.example' }).error);
});

test('project accepts same-site image paths', () => {
  const r = projectSanitizer({ title: 'x', imageUrl: '/images/shot.png' });
  assert.equal(r.value.imageUrl, '/images/shot.png');
});

test('skill level must be within 0 to 100', () => {
  assert.ok(skillSanitizer({ name: 'JS', level: 150 }).error);
  assert.equal(skillSanitizer({ name: 'JS' }).value.level, null);
  assert.equal(skillSanitizer({ name: 'JS', level: '80' }).value.level, 80);
});

test('experience type is restricted', () => {
  assert.ok(experienceSanitizer({ type: 'hobby', organization: 'a', role: 'b' }).error);
  assert.equal(experienceSanitizer({ organization: 'a', role: 'b' }).value.type, 'experience');
});

test('profile rejects an invalid email and defaults the photo path', () => {
  assert.ok(profileSanitizer({ email: 'not-an-email' }).error);
  assert.equal(profileSanitizer({}).value.photoUrl, '/images/profile.jpg');
});
