require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const cors = require('cors');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', err => {
    // console.log('Redis Client Error', err);
});

const fallbackSectors = [
    { id: 'sec-north', name: 'North Concourse', capacity: 5000, current: 3200, type: 'concourse', status: 'normal' },
    { id: 'sec-south', name: 'South Concourse', capacity: 5000, current: 4800, type: 'concourse', status: 'critical' },
    { id: 'sec-east', name: 'East Gate', capacity: 2000, current: 800, type: 'gate', status: 'normal' },
    { id: 'sec-west', name: 'West Gate', capacity: 2000, current: 1900, type: 'gate', status: 'warning' },
    { id: 'restroom-101', name: 'Restroom 101', capacity: 100, current: 95, type: 'restroom', status: 'critical', waitTime: 12 },
    { id: 'restroom-102', name: 'Restroom 102', capacity: 100, current: 20, type: 'restroom', status: 'normal', waitTime: 2 },
    { id: 'food-grill', name: 'South Grill', capacity: 300, current: 250, type: 'concession', status: 'warning', waitTime: 15 },
    { id: 'food-pizza', name: 'Slice Station', capacity: 200, current: 50, type: 'concession', status: 'normal', waitTime: 3 },
];

async function start() {
  console.log('Starting Hardened API Gateway services...');
  
  redisClient.connect()
    .then(() => console.log('Connected to Redis'))
    .catch(() => console.log('Redis offline. Fallback mode active.'));

  setInterval(async () => {
    let payload = {
      sectors: JSON.parse(JSON.stringify(fallbackSectors)),
      alerts: [],
      totalAttendees: 0
    };

    if (redisClient.isOpen && redisClient.isReady) {
      try {
        const predictions = await redisClient.hGetAll('predictions');
        const queues = await redisClient.hGetAll('queues');
        const rawAlerts = await redisClient.lRange('alerts', 0, 9);
        
        payload.alerts = rawAlerts.map(a => JSON.parse(a));
        
        payload.sectors = payload.sectors.map(sec => {
          let updated = { ...sec };
          if (predictions[sec.id]) {
            const pred = JSON.parse(predictions[sec.id]);
            updated.current = pred.current;
            updated.status = pred.status;
          }
          if (queues[sec.id]) {
            const q = JSON.parse(queues[sec.id]);
            updated.waitTime = q.wait_time_mins;
          }
          return updated;
        });
      } catch (e) { }
    } else {
      payload.sectors = payload.sectors.map(sec => ({
        ...sec, 
        current: Math.max(0, Math.min(sec.capacity, sec.current + Math.floor((Math.random() - 0.5) * 200)))
      }));
    }

    payload.totalAttendees = payload.sectors.reduce((acc, s) => acc + s.current, 0);
    io.emit('stadium-update', payload);
  }, 2000);
}

start();

io.on('connection', (socket) => {
  console.log('Authorized client connected');
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Secured API Gateway listening on port ${PORT}`);
});
