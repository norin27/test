export class SensorTracker {
  constructor() {
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.isTracking = false;
    this.trackingData = [];
    this.startTime = 0;
    this.lastTimestamp = 0;
  }

  async requestPermissions() {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        const orientationPermission = await DeviceOrientationEvent.requestPermission();
        if (orientationPermission !== 'granted') {
          throw new Error('Device orientation permission denied');
        }
      }

      if (typeof DeviceMotionEvent !== 'undefined' &&
          typeof DeviceMotionEvent.requestPermission === 'function') {
        const motionPermission = await DeviceMotionEvent.requestPermission();
        if (motionPermission !== 'granted') {
          throw new Error('Device motion permission denied');
        }
      }

      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  startTracking() {
    this.isTracking = true;
    this.trackingData = [];
    this.startTime = performance.now();
    this.lastTimestamp = this.startTime;

    window.addEventListener('deviceorientation', this.handleOrientation);
    window.addEventListener('devicemotion', this.handleMotion);
  }

  stopTracking() {
    this.isTracking = false;
    window.removeEventListener('deviceorientation', this.handleOrientation);
    window.removeEventListener('devicemotion', this.handleMotion);
  }

  handleOrientation = (event) => {
    if (!this.isTracking) return;

    this.rotation = {
      x: event.beta || 0,
      y: event.gamma || 0,
      z: event.alpha || 0
    };

    this.recordFrame();
  }

  handleMotion = (event) => {
    if (!this.isTracking) return;

    const acceleration = event.accelerationIncludingGravity;
    if (!acceleration) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTimestamp) / 1000;

    this.velocity.x += (acceleration.x || 0) * deltaTime;
    this.velocity.y += (acceleration.y || 0) * deltaTime;
    this.velocity.z += (acceleration.z || 0) * deltaTime;

    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.position.z += this.velocity.z * deltaTime;

    this.lastTimestamp = currentTime;
  }

  recordFrame() {
    const timestamp = (performance.now() - this.startTime) / 1000;

    this.trackingData.push({
      timestamp,
      position: { ...this.position },
      rotation: { ...this.rotation }
    });
  }

  getTrackingData() {
    return this.trackingData;
  }

  getCurrentState() {
    return {
      position: { ...this.position },
      rotation: { ...this.rotation }
    };
  }

  reset() {
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.trackingData = [];
  }
}
