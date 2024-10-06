import { Component, ComponentFactoryResolver } from '@angular/core';

type Range = [number, number];
type Camera = [Range, Range]; // [distance range, light range]

@Component({
  selector: 'app-problem2',
  template: `
  <h3>Hardware Cameras:</h3>
  <ul>
    @for(camera of hardwareCameras; track $index) {
      <li>
        <p>distance: {{ camera[0][0] }} - {{ camera[0][1] }}</p>
        <p>light: {{ camera[1][0] }} - {{ camera[1][1] }}</p>
      </li>
    }
  </ul>
  <h3>Software Cameras:</h3>
  <ul>
  <li>
        <p>distance: {{ softwareCamera[0][0] }} - {{ softwareCamera[0][1] }}</p>
        <p>light: {{ softwareCamera[1][0] }} - {{ softwareCamera[1][1] }}</p>
  </li>
  </ul>
  <h3>Can the hardware cameras cover the desired range? {{ canCoverCharacteristics(softwareCamera, hardwareCameras) ? 'Yes' : 'No' }}</h3>
  `,
})
export class Problem2Component {
  public readonly hardwareCameras: Camera[] = [
    [[0.1, 1], [0.01, 20]],    
    [[0.5, 10], [1, 100]],     
    [[5, 1000], [10, 1000]]    
  ]

  public readonly softwareCamera: Camera = [[1, 50], [10, 30]]

  public canCoverCharacteristics(
    softwareCamera: Camera,
    hardwareCameras: Camera[]
  ): boolean {
    if (!hardwareCameras.length) {
      return false;
    }

    // filter out hardware cameras if they don't cover the software camera's light range.
    const availabelCameras = hardwareCameras.filter(
      (camera) =>
        camera[1][0] <= softwareCamera[1][0] &&
        camera[1][1] >= softwareCamera[1][1]
    );
    if (!availabelCameras.length) {
      return false;
    }    

    // Sort the hardware cameras by distance range
    const sortedCameras = availabelCameras.sort((a, b) => a[0][0] - b[0][0]);
    
    let currentDistance = softwareCamera[0][0];
    
    for (const camera of sortedCameras) {
        const [distanceRange, lightRange] = camera;
        
        // Check if there's a gap in distance coverage
        if (distanceRange[0] > currentDistance) {
            return false;
        }
        
        // Update the current distance if this camera extends the coverage
        if (distanceRange[1] > currentDistance) {
            currentDistance = distanceRange[1];
        }
        
        // Check if we've covered the entire range
        if (currentDistance >= softwareCamera[0][1]) {
            return true;
        }
    }
    return false
  }
}
