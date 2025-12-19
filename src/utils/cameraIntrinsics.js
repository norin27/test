export class CameraIntrinsics {
  constructor() {
    this.focalLength = 24;
    this.sensorWidth = 36;
    this.sensorHeight = 24;
    this.principalPoint = { x: 0.5, y: 0.5 };
    this.imageWidth = 1920;
    this.imageHeight = 1080;
  }

  async calculateFromStream(stream) {
    try {
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();

      if (settings.width && settings.height) {
        this.imageWidth = settings.width;
        this.imageHeight = settings.height;
      }

      if (settings.focalLength) {
        this.focalLength = settings.focalLength;
      } else {
        this.focalLength = this.estimateFocalLength(settings);
      }

      this.calculateSensorSize(settings);

      return this.getIntrinsics();
    } catch (error) {
      console.error('Error calculating camera intrinsics:', error);
      return this.getIntrinsics();
    }
  }

  estimateFocalLength(settings) {
    const diagonalFOV = 70;
    const aspectRatio = this.imageWidth / this.imageHeight;
    const diagonalPixels = Math.sqrt(
      this.imageWidth * this.imageWidth +
      this.imageHeight * this.imageHeight
    );

    const focalLengthPixels = diagonalPixels / (2 * Math.tan((diagonalFOV * Math.PI / 180) / 2));

    const sensorDiagonal = Math.sqrt(
      this.sensorWidth * this.sensorWidth +
      this.sensorHeight * this.sensorHeight
    );

    return (focalLengthPixels / diagonalPixels) * sensorDiagonal;
  }

  calculateSensorSize(settings) {
    const aspectRatio = this.imageWidth / this.imageHeight;

    if (aspectRatio >= 1) {
      this.sensorWidth = 36;
      this.sensorHeight = 36 / aspectRatio;
    } else {
      this.sensorHeight = 24;
      this.sensorWidth = 24 * aspectRatio;
    }
  }

  getIntrinsics() {
    return {
      focalLength: this.focalLength,
      sensorWidth: this.sensorWidth,
      sensorHeight: this.sensorHeight,
      principalPoint: { ...this.principalPoint },
      imageWidth: this.imageWidth,
      imageHeight: this.imageHeight,
      focalLengthPixelsX: (this.focalLength * this.imageWidth) / this.sensorWidth,
      focalLengthPixelsY: (this.focalLength * this.imageHeight) / this.sensorHeight
    };
  }

  updateResolution(width, height) {
    this.imageWidth = width;
    this.imageHeight = height;
    this.calculateSensorSize({});
  }
}
