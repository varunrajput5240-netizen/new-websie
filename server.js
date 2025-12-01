const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let workers = [
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
    availability: 'Available now'
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
    availability: 'Wrapping a job nearby'
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
    availability: 'Available now'
  }
];

let bookings = [];

app.get('/api/workers', (req, res) => {
  const { skill, urgency, sortBy } = req.query;

  let results = [...workers];

  if (skill) {
    results = results.filter((w) => w.skill === skill);
  }

  if (urgency === 'now') {
    results = results.filter((w) => w.availability.toLowerCase().includes('now'));
  }

  if (sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'experience') {
    results.sort((a, b) => b.experienceYears - a.experienceYears);
  } else {
    results.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  res.json(results);
});

app.post('/api/workers', (req, res) => {
  const { name, skill, bio, phone } = req.body;
  if (!name || !skill || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const newWorker = {
    id: Date.now(),
    name,
    skill,
    bio: bio || 'New FixFleet professional in your area.',
    phone,
    rating: 5.0,
    jobs: 0,
    experienceYears: 1,
    distanceKm: Number((Math.random() * 3 + 0.5).toFixed(1)),
    availability: 'Available now'
  };

  workers.push(newWorker);
  res.status(201).json(newWorker);
});

app.post('/api/bookings', (req, res) => {
  const { workerId, issue, time, phone } = req.body;
  if (!workerId || !issue || !time || !phone) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const worker = workers.find((w) => w.id === workerId);
  if (!worker) {
    return res.status(404).json({ error: 'Worker not found' });
  }

  const booking = {
    id: Date.now(),
    workerId,
    issue,
    time,
    phone,
    status: 'pending'
  };

  bookings.push(booking);
  res.status(201).json(booking);
});

app.get('/api/bookings', (req, res) => {
  res.json(bookings);
});

app.listen(PORT, () => {
  console.log(`FixFleet demo API running on http://localhost:${PORT}`);
});


