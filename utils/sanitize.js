// Input validation for every write endpoint. Each resource sanitizer returns
// { value } with only allowed fields, or { error } with a user-facing message.

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPERIENCE_TYPES = ['experience', 'education'];

const clean = (value, max = 500) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

// Empty is allowed. Absolute http(s) URLs and same-site paths such as /images/x.jpg are allowed.
// javascript:, data:, and protocol-relative URLs are rejected.
const optionalUrl = (value, max = 500) => {
  const v = clean(value, max);
  if (!v) return { ok: true, value: '' };
  if (v.startsWith('/') && !v.startsWith('//')) return { ok: true, value: v };
  return isHttpUrl(v) ? { ok: true, value: v } : { ok: false };
};

const toBool = (value) => value === true || value === 'true';

const toStringArray = (value, max = 30, itemMax = 40) =>
  Array.isArray(value) ? value.map((v) => clean(v, itemMax)).filter(Boolean).slice(0, max) : [];

const toNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
};

function projectSanitizer(body = {}) {
  const title = clean(body.title, 120);
  if (!title) return { error: 'Title is required' };

  const imageUrl = optionalUrl(body.imageUrl);
  const githubUrl = optionalUrl(body.githubUrl);
  const liveUrl = optionalUrl(body.liveUrl);
  if (!imageUrl.ok) return { error: 'Image URL must start with http(s):// or be a /path' };
  if (!githubUrl.ok) return { error: 'GitHub URL must start with http:// or https://' };
  if (!liveUrl.ok) return { error: 'Live demo URL must start with http:// or https://' };

  const order = toNumber(body.order);
  return {
    value: {
      title,
      description: clean(body.description, 2000),
      technologies: toStringArray(body.technologies),
      imageUrl: imageUrl.value,
      githubUrl: githubUrl.value,
      liveUrl: liveUrl.value,
      featured: toBool(body.featured),
      published: body.published === undefined ? true : toBool(body.published),
      order: Number.isFinite(order) ? order : 0,
    },
  };
}

function skillSanitizer(body = {}) {
  const name = clean(body.name, 60);
  if (!name) return { error: 'Skill name is required' };

  const level = toNumber(body.level);
  if (Number.isNaN(level) || (level !== null && (level < 0 || level > 100))) {
    return { error: 'Proficiency must be a number from 0 to 100, or left empty' };
  }
  return {
    value: {
      name,
      category: clean(body.category, 60) || 'General',
      level,
      published: body.published === undefined ? true : toBool(body.published),
    },
  };
}

function experienceSanitizer(body = {}) {
  const type = clean(body.type, 20) || 'experience';
  if (!EXPERIENCE_TYPES.includes(type)) return { error: 'Type must be "experience" or "education"' };

  const organization = clean(body.organization, 120);
  const role = clean(body.role, 120);
  if (!organization) return { error: 'Organization is required' };
  if (!role) return { error: 'Role or qualification is required' };

  return {
    value: {
      type,
      organization,
      role,
      startDate: clean(body.startDate, 40),
      endDate: clean(body.endDate, 40),
      current: toBool(body.current),
      description: clean(body.description, 2000),
      published: body.published === undefined ? true : toBool(body.published),
    },
  };
}

function profileSanitizer(body = {}) {
  const email = clean(body.email, 254);
  if (email && !EMAIL.test(email)) return { error: 'Email address is not valid' };

  const photoUrl = optionalUrl(body.photoUrl);
  const resumeUrl = optionalUrl(body.resumeUrl);
  if (!photoUrl.ok) return { error: 'Photo URL must start with http(s):// or be a /path' };
  if (!resumeUrl.ok) return { error: 'Resume URL must start with http:// or https://' };

  const socials = {};
  for (const key of ['github', 'linkedin', 'twitter', 'website']) {
    const link = optionalUrl(body.socials?.[key]);
    if (!link.ok) return { error: `The ${key} link must start with http:// or https://` };
    socials[key] = link.value;
  }

  return {
    value: {
      fullName: clean(body.fullName, 120),
      title: clean(body.title, 120),
      bio: clean(body.bio, 3000),
      introduction: clean(body.introduction, 500),
      email,
      photoUrl: photoUrl.value || '/images/profile.jpg',
      resumeUrl: resumeUrl.value,
      socials,
    },
  };
}

module.exports = {
  clean,
  optionalUrl,
  projectSanitizer,
  skillSanitizer,
  experienceSanitizer,
  profileSanitizer,
};
