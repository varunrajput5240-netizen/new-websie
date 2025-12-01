// Simple in-browser data + interaction layer for FixFleet demo

const API_BASE = 'http://localhost:4000/api';

const demoWorkers = [
  {
    id: 1,
    name: 'Ravi Sharma',
    skill: 'electrician',
    bio: 'Specialist in wiring, MCB panels and emergency power issues.',
    phone: '+91 98765 11001',
    rating: 4.9,
    jobs: 182,
    experienceYears: 7,
    distanceKm: 1.2,
    availability: 'Available now',
    coordinates: { x: 55, y: 42 },
  },
  {
    id: 2,
    name: 'Anita Verma',
    skill: 'plumber',
    bio: 'Fast response for leaks, blockages and bathroom fittings.',
    phone: '+91 98765 11002',
    rating: 4.8,
    jobs: 143,
    experienceYears: 5,
    distanceKm: 2.1,
    availability: 'Wrapping a job nearby',
    coordinates: { x: 30, y: 60 },
  },
  {
    id: 3,
    name: 'Imran Khan',
    skill: 'carpenter',
    bio: 'Door fixes, modular kitchen tweaks and custom shelving.',
    phone: '+91 98765 11003',
    rating: 4.7,
    jobs: 121,
    experienceYears: 6,
    distanceKm: 0.9,
    availability: 'Available now',
    coordinates: { x: 65, y: 65 },
  },
  {
    id: 4,
    name: 'Priya Nair',
    skill: 'cleaning',
    bio: 'Deep cleaning specialist for move-in & festival makeovers.',
    phone: '+91 98765 11004',
    rating: 4.9,
    jobs: 210,
    experienceYears: 4,
    distanceKm: 3.4,
    availability: 'Available today',
    coordinates: { x: 40, y: 30 },
  },
  {
    id: 5,
    name: 'Sanjay Patel',
    skill: 'appliance',
    bio: 'Certified technician for ACs, fridges and washing machines.',
    phone: '+91 98765 11005',
    rating: 4.6,
    jobs: 98,
    experienceYears: 5,
    distanceKm: 1.8,
    availability: 'Available now',
    coordinates: { x: 75, y: 36 },
  },
];

let userLocation = null;
let workerLocation = null;
let activeRole = 'user';
let currentResults = [...demoWorkers];
let selectedWorkerId = null;

function $(selector) {
  return document.querySelector(selector);
}

function createEl(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

function showToast(message) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2600);
}

function setupSmoothScroll() {
  document.querySelectorAll('.nav-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-scroll');
      const el = target && document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

async function apiGetWorkers(params) {
  const query = new URLSearchParams(params).toString();
  const url = `${API_BASE}/workers?${query}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load workers');
  return res.json();
}

async function apiRegisterWorker(payload) {
  const res = await fetch(`${API_BASE}/workers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to register worker');
  return res.json();
}

async function apiCreateBooking(payload) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
}

function setupRoleToggle() {
  const tabs = document.querySelectorAll('.role-tab');
  const panelUser = $('#panel-user');
  const panelWorker = $('#panel-worker');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const role = tab.getAttribute('data-role');
      activeRole = role;
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      if (role === 'user') {
        panelUser.classList.remove('hidden');
        panelWorker.classList.add('hidden');
      } else {
        panelWorker.classList.remove('hidden');
        panelUser.classList.add('hidden');
      }
    });
  });

  $('#switch-to-worker')?.addEventListener('click', () => {
    tabs.forEach((t) => {
      const role = t.getAttribute('data-role');
      if (role === 'worker') t.click();
    });
    document.querySelector('#for-workers')?.scrollIntoView({ behavior: 'smooth' });
  });

  $('#switch-to-user')?.addEventListener('click', () => {
    tabs.forEach((t) => {
      const role = t.getAttribute('data-role');
      if (role === 'user') t.click();
    });
    document.querySelector('.hero')?.scrollIntoView({ behavior: 'smooth' });
  });

  $('#cta-become-worker')?.addEventListener('click', () => {
    tabs.forEach((t) => {
      const role = t.getAttribute('data-role');
      if (role === 'worker') t.click();
    });
    document.querySelector('.hero')?.scrollIntoView({ behavior: 'smooth' });
  });
}

function setupUrgencyPills() {
  const pills = document.querySelectorAll('.pill');
  const urgencyInput = $('#urgency');
  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');
      const value = pill.getAttribute('data-urgency');
      if (urgencyInput && value) urgencyInput.value = value;
    });
  });
}

function fakeGeolocation(target) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const loc = {
        lat: 28.6139 + (Math.random() - 0.5) * 0.02,
        lng: 77.209 + (Math.random() - 0.5) * 0.02,
      };
      if (target === 'user') userLocation = loc;
      if (target === 'worker') workerLocation = loc;
      resolve(loc);
    }, 650);
  });
}

function setupLocationButtons() {
  const userBtn = $('#detect-location');
  const workerBtn = $('#worker-detect-location');
  const userStatus = $('#location-status');
  const workerStatus = $('#worker-location-status');

  if (userBtn && userStatus) {
    userBtn.addEventListener('click', async () => {
      userBtn.disabled = true;
      userStatus.textContent = 'Detecting your location…';
      const loc = await fakeGeolocation('user');
      userStatus.textContent = `Location set near (${loc.lat.toFixed(3)}, ${loc.lng.toFixed(
        3
      )})`;
      showToast('Your location has been updated for better matching.');
      userBtn.disabled = false;
    });
  }

  if (workerBtn && workerStatus) {
    workerBtn.addEventListener('click', async () => {
      workerBtn.disabled = true;
      workerStatus.textContent = 'Detecting your location…';
      const loc = await fakeGeolocation('worker');
      workerStatus.textContent = `You’ll appear near (${loc.lat.toFixed(3)}, ${loc.lng.toFixed(
        3
      )})`;
      showToast('Your worker location has been saved for local jobs.');
      workerBtn.disabled = false;
    });
  }
}

function renderMap(workers) {
  const map = $('#fake-map');
  const count = $('#map-count');
  if (!map || !count) return;

  map.querySelectorAll('.map-worker-pin').forEach((el) => el.remove());

  (workers || []).forEach((w) => {
    const pin = createEl('div', 'map-worker-pin');
    pin.dataset.skill = w.skill;
    const pos = w.coordinates || { x: 40 + Math.random() * 40, y: 30 + Math.random() * 40 };
    pin.style.left = `${pos.x}%`;
    pin.style.top = `${pos.y}%`;
    pin.title = `${w.name} • ${w.rating.toFixed(1)}★`;
    pin.addEventListener('click', () => {
      selectWorker(w.id);
      const cardEl = document.querySelector(`.worker-card[data-id="${w.id}"]`);
      if (cardEl) cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    map.appendChild(pin);
  });

  count.textContent = `${workers.length} online`;
}

function serviceLabel(skill) {
  switch (skill) {
    case 'electrician':
      return 'Electrician';
    case 'plumber':
      return 'Plumber';
    case 'carpenter':
      return 'Carpenter';
    case 'cleaning':
      return 'Home Cleaning';
    case 'appliance':
      return 'Appliance Repair';
    case 'painting':
      return 'Painting';
    default:
      return 'Home Services';
  }
}

function renderWorkersList(workers) {
  const list = $('#workers-list');
  const subtitle = $('#results-subtitle');
  if (!list || !subtitle) return;

  list.innerHTML = '';

  if (!workers.length) {
    subtitle.textContent = 'No workers match this filter yet – try another service type.';
    const empty = createEl('div');
    empty.textContent = 'No professionals found for this combination just yet.';
    empty.style.fontSize = '0.85rem';
    empty.style.color = '#9ca3af';
    list.appendChild(empty);
    return;
  }

  const selectedSkill =
    document.querySelector('#service-type') && document.querySelector('#service-type').value;
  const skillText = selectedSkill ? serviceLabel(selectedSkill) : 'all services';

  subtitle.textContent = `Showing ${workers.length} professionals around you for ${skillText}.`;

  workers.forEach((w) => {
    const card = createEl('article', 'worker-card');
    card.dataset.id = String(w.id);

    const avatar = createEl('div', 'avatar');
    avatar.textContent = w.name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    const main = createEl('div', 'worker-main');
    const nameEl = createEl('h3', 'worker-name');
    nameEl.textContent = w.name;
    const skillEl = createEl('p', 'worker-skill');
    skillEl.textContent = serviceLabel(w.skill);

    const meta = createEl('div', 'worker-meta');
    const ratingChip = createEl('span', 'chip rating');
    ratingChip.textContent = `${w.rating.toFixed(1)}★ · ${w.jobs} jobs`;
    const distanceChip = createEl('span', 'chip distance');
    distanceChip.textContent = `${w.distanceKm.toFixed(1)} km away`;
    const expChip = createEl('span', 'chip experience');
    expChip.textContent = `${w.experienceYears}+ yrs exp.`;
    meta.append(ratingChip, distanceChip, expChip);

    main.append(nameEl, skillEl, meta);

    const right = createEl('div', 'worker-cta');
    const availability = createEl('span', 'availability-pill');
    availability.textContent = w.availability;
    const callHint = createEl('span');
    callHint.textContent = 'Tap to view & book';
    right.append(availability, callHint);

    card.append(avatar, main, right);
    card.addEventListener('click', () => selectWorker(w.id));

    list.appendChild(card);
  });
}

function selectWorker(id) {
  selectedWorkerId = id;
  document.querySelectorAll('.worker-card').forEach((card) => {
    card.classList.toggle('selected', card.dataset.id === String(id));
  });
  const worker = currentResults.find((w) => w.id === id);
  if (!worker) return;

  const empty = document.querySelector('.booking-empty');
  const details = $('#booking-details');
  if (empty && details) {
    empty.classList.add('hidden');
    details.classList.remove('hidden');
  }

  const avatar = $('#booking-avatar');
  const name = $('#booking-name');
  const skill = $('#booking-skill');
  const rating = $('#booking-rating');
  const note = $('#booking-note');

  if (avatar) {
    avatar.className = 'avatar';
    avatar.textContent = worker.name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
  if (name) name.textContent = worker.name;
  if (skill) skill.textContent = `${serviceLabel(worker.skill)} · ${worker.experienceYears}+ years`;
  if (rating)
    rating.textContent = `${worker.rating.toFixed(1)}★ · ${worker.jobs} completed · ${worker.availability}`;
  if (note)
    note.textContent = `We’ll share your contact with ${worker.name.split(' ')[0]} only after you confirm the booking.`;
}

function sortWorkers(workers, mode) {
  const sorted = [...workers];
  if (mode === 'rating') {
    sorted.sort((a, b) => b.rating - a.rating);
  } else if (mode === 'experience') {
    sorted.sort((a, b) => b.experienceYears - a.experienceYears);
  } else {
    sorted.sort((a, b) => a.distanceKm - b.distanceKm);
  }
  return sorted;
}

function setupSorting() {
  const sortSelect = $('#sort-by');
  if (!sortSelect) return;
  sortSelect.addEventListener('change', () => {
    const mode = sortSelect.value;
    currentResults = sortWorkers(currentResults, mode);
    renderWorkersList(currentResults);
    renderMap(currentResults);
  });
}

function setupSearchForm() {
  const form = $('#user-search-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const typeSelect = $('#service-type');
    const urgency = $('#urgency')?.value || 'now';
    const selectedType = typeSelect?.value || '';

    const sortBy = document.querySelector('#sort-by')?.value || 'distance';

    try {
      const apiWorkers = await apiGetWorkers({
        skill: selectedType,
        urgency,
        sortBy,
      });
      currentResults = apiWorkers;
    } catch (_err) {
      // Fallback to in-browser demo data
      let filtered = [...demoWorkers];
      if (selectedType) {
        filtered = filtered.filter((w) => w.skill === selectedType);
      }
      if (urgency === 'now') {
        filtered = filtered.filter((w) => w.availability.toLowerCase().includes('now'));
      }
      currentResults = sortWorkers(filtered, sortBy);
    }

    selectedWorkerId = null;
    renderWorkersList(currentResults);
    renderMap(currentResults);
    showToast('Updated matches based on your need and urgency.');
    document.querySelector('#results-section')?.scrollIntoView({ behavior: 'smooth' });
  });
}

function setupWorkerRegistration() {
  const form = $('#worker-register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = $('#worker-name')?.value.trim();
    const skill = $('#worker-skill')?.value;
    const bio = $('#worker-bio')?.value.trim() || 'New FixFleet professional in your area.';
    const phone = $('#worker-phone')?.value.trim();

    if (!name || !skill || !phone) {
      showToast('Please fill in your name, main skill and contact number.');
      return;
    }

    let newWorker;
    try {
      newWorker = await apiRegisterWorker({ name, skill, bio, phone });
    } catch (_err) {
      // Fallback to local-only worker
      newWorker = {
        id: Date.now(),
        name,
        skill,
        bio,
        phone,
        rating: 5.0,
        jobs: 0,
        experienceYears: 1,
        distanceKm: (Math.random() * 3 + 0.5).toFixed(1) * 1,
        availability: 'Available now',
      };
      demoWorkers.push(newWorker);
    }

    if (!newWorker.coordinates) {
      newWorker.coordinates = {
        x: 40 + Math.random() * 30,
        y: 35 + Math.random() * 30,
      };
    }

    currentResults = sortWorkers([...currentResults, newWorker], 'distance');
    renderWorkersList(currentResults);
    renderMap(currentResults);

    form.reset();
    showToast('Welcome to FixFleet! You now appear in nearby searches.');
  });
}

function setupBookingForm() {
  const form = $('#booking-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!selectedWorkerId) {
      showToast('Please select a professional before booking.');
      return;
    }
    const issue = $('#booking-issue')?.value.trim();
    const time = $('#booking-time')?.value;
    const phone = $('#booking-phone')?.value.trim();
    if (!issue || !time || !phone) {
      showToast('Please share the issue, time and your contact number.');
      return;
    }
    const worker = currentResults.find((w) => w.id === selectedWorkerId);
    if (!worker) return;

    try {
      await apiCreateBooking({
        workerId: worker.id,
        issue,
        time,
        phone,
      });
      showToast(
        `Booking request sent to ${worker.name.split(' ')[0]} – they will confirm shortly.`
      );
    } catch (_err) {
      showToast(
        `Booking simulated for ${worker.name.split(' ')[0]} (backend not reachable, demo mode).`
      );
    }
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupSmoothScroll();
  setupRoleToggle();
  setupUrgencyPills();
  setupLocationButtons();
  setupSorting();
  setupSearchForm();
  setupWorkerRegistration();
  setupBookingForm();

  // Try to hydrate from backend, otherwise fall back to local demo data
  (async () => {
    try {
      const apiWorkers = await apiGetWorkers({ sortBy: 'distance' });
      currentResults = apiWorkers.map((w) => ({
        ...w,
        coordinates: {
          x: 40 + Math.random() * 30,
          y: 35 + Math.random() * 30,
        },
      }));
    } catch (_err) {
      currentResults = sortWorkers(demoWorkers, 'distance');
      currentResults = currentResults.map((w) => ({
        ...w,
        coordinates: w.coordinates || {
          x: 40 + Math.random() * 30,
          y: 35 + Math.random() * 30,
        },
      }));
    }
    renderWorkersList(currentResults);
    renderMap(currentResults);
  })();
});


