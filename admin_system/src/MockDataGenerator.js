// Simulates the Stadium's real-time data
class MockDataGenerator {
  constructor() {
    this.sectors = [
      { id: 'sec-north', name: 'North Concourse', capacity: 5000, current: 3200, type: 'concourse', status: 'normal' },
      { id: 'sec-south', name: 'South Concourse', capacity: 5000, current: 4800, type: 'concourse', status: 'critical' },
      { id: 'sec-east', name: 'East Gate', capacity: 2000, current: 800, type: 'gate', status: 'normal' },
      { id: 'sec-west', name: 'West Gate', capacity: 2000, current: 1900, type: 'gate', status: 'warning' },
      { id: 'restroom-101', name: 'Restroom 101', capacity: 100, current: 95, type: 'restroom', status: 'critical', waitTime: 12 },
      { id: 'restroom-102', name: 'Restroom 102', capacity: 100, current: 20, type: 'restroom', status: 'normal', waitTime: 2 },
      { id: 'food-grill', name: 'South Grill', capacity: 300, current: 250, type: 'concession', status: 'warning', waitTime: 15 },
      { id: 'food-pizza', name: 'Slice Station', capacity: 200, current: 50, type: 'concession', status: 'normal', waitTime: 3 },
    ];
    
    this.alerts = [
      { id: 1, type: 'critical', message: 'Surge detected at South Concourse', time: new Date(Date.now() - 60000).toISOString() },
      { id: 2, type: 'info', message: 'Routing Agent redirected 500 attendees to East Gate', time: new Date(Date.now() - 120000).toISOString() }
    ];
    
    this.listeners = [];
    this.intervalId = null;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb({
      sectors: [...this.sectors],
      alerts: [...this.alerts],
      totalAttendees: this.sectors.reduce((acc, s) => acc + s.current, 0),
      timestamp: new Date().toISOString()
    }));
  }

  start() {
    if (this.intervalId) return;
    
    // Simulate real-time data every 2 seconds
    this.intervalId = setInterval(() => {
      let triggerAlert = false;
      
      this.sectors = this.sectors.map(sector => {
        // Random fluctuation between -5% and +5% of capacity
        const change = Math.floor((Math.random() - 0.5) * 0.1 * sector.capacity);
        let newCurrent = Math.max(0, Math.min(sector.capacity, sector.current + change));
        
        let newStatus = 'normal';
        const ratio = newCurrent / sector.capacity;
        
        if (ratio >= 0.9) {
          newStatus = 'critical';
          if (sector.status !== 'critical') triggerAlert = sector;
        } else if (ratio >= 0.75) {
          newStatus = 'warning';
        }
        
        // Update wait times for restrooms and concessions
        let newWait = sector.waitTime;
        if (sector.type === 'restroom' || sector.type === 'concession') {
          newWait = Math.max(0, Math.floor(ratio * 20)); // Max wait time ~ 20 mins
        }
        
        return { ...sector, current: newCurrent, status: newStatus, waitTime: newWait };
      });
      
      if (triggerAlert) {
        this.alerts = [
          {
            id: Date.now(),
            type: 'critical',
            message: `Capacity alert at ${triggerAlert.name} (${Math.floor((triggerAlert.current/triggerAlert.capacity)*100)}%)`,
            time: new Date().toISOString()
          },
          ...this.alerts.slice(0, 4) // Keep last 5 alerts
        ];
      }
      
      this.notify();
    }, 2000);
    
    // Initial notify
    this.notify();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const mockData = new MockDataGenerator();

export const generateMockStadiumData = () => {
  const generator = new MockDataGenerator();
  return {
    sectors: generator.sectors,
    alerts: generator.alerts,
    agents: [
      { id: 'agt-01', name: 'Security Bot Alpha', status: 'patrolling', sector: 'sec-north', battery: 85 },
      { id: 'agt-02', name: 'Crowd Assist 7', status: 'assisting', sector: 'sec-south', battery: 42 },
      { id: 'agt-03', name: 'Medical Drone 1', status: 'standby', sector: 'sec-east', battery: 100 },
    ],
    securityLogs: [
      { id: 1, event: 'Face Match: Subject 421', location: 'Gate A', severity: 'low', time: '10:45:12' },
      { id: 2, event: 'Unattended Bag Detected', location: 'Concourse B', severity: 'high', time: '10:50:05' },
    ],
    totalAttendees: generator.sectors.reduce((acc, s) => acc + s.current, 0)
  };
};
