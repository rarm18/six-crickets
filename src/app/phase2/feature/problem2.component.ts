import { Component, ComponentFactoryResolver } from "@angular/core";

type Range = {
  min: number;
  max: number;
};

type Rectangle = {
  distanceRange: Range;
  lightRange: Range;
};

@Component({
  selector: "app-problem2",
  template: `
    <h3>Hardware Cameras:</h3>
    <ul>
      @for (camera of hardwareCameras; track $index) {
        <li>
          <p>
            distance: {{ camera.distanceRange.min }} -
            {{ camera.distanceRange.max }}
          </p>
          <p>
            light: {{ camera.lightRange.min }} - {{ camera.lightRange.max }}
          </p>
        </li>
      }
    </ul>
    <h3>Software Cameras:</h3>
    <ul>
      <li>
        <p>
          distance: {{ softwareCamera.distanceRange.min }} -
          {{ softwareCamera.distanceRange.max }}
        </p>
        <p>
          light: {{ softwareCamera.lightRange.min }} -
          {{ softwareCamera.lightRange.max }}
        </p>
      </li>
    </ul>
    <h3>
      Can the hardware cameras cover the desired range?
      {{
        canCamerasMeetRequirements(softwareCamera, hardwareCameras)
          ? "Yes"
          : "No"
      }}
    </h3>
  `,
})
export class Problem2Component {
  public readonly hardwareCameras: Rectangle[] = [
    {
      distanceRange: { min: 0.1, max: 0.5 },
      lightRange: { min: 0.1, max: 0.5 },
    },
    {
      distanceRange: { min: 0.1, max: 0.5 },
      lightRange: { min: 0.1, max: 0.5 },
    },
    {
      distanceRange: { min: 0.1, max: 0.5 },
      lightRange: { min: 0.1, max: 0.5 },
    },
  ];

  public readonly softwareCamera: Rectangle = {
    distanceRange: { min: 1, max: 5 },
    lightRange: { min: 4, max: 6 },
  };

  // Helper to check if two float are equal
  private isEqual(a: number, b: number): boolean {
    return Math.abs(a - b) < Number.EPSILON;
  }

  // Helper to check if a is less than or equal to b
  private isLessOrEqual(a: number, b: number): boolean {
    return a < b || this.isEqual(a, b);
  }

  // Find the intersection of two ranges
  private intersectRanges(range1: Range, range2: Range): Range | null {
    const min = Math.max(range1.min, range2.min);
    const max = Math.min(range1.max, range2.max);
    return this.isLessOrEqual(min, max) ? { min, max } : null;
  }

  // Find the intersection of two rectangles
  private intersectRectangles(
    rect1: Rectangle,
    rect2: Rectangle,
  ): Rectangle | null {
    const distanceRange = this.intersectRanges(
      rect1.distanceRange,
      rect2.distanceRange,
    );
    const lightRange = this.intersectRanges(rect1.lightRange, rect2.lightRange);

    if (!distanceRange || !lightRange) {
      return null;
    }

    return { distanceRange, lightRange };
  }

  // Subtract one rectangle from another, returning the remaining rectangles
  private subtractRectangles(
    base: Rectangle,
    subtract: Rectangle,
  ): Rectangle[] {
    const intersection = this.intersectRectangles(base, subtract);
    if (!intersection) return [base];

    const result: Rectangle[] = [];

    // Left rectangle
    if (
      base.distanceRange.min <
      intersection.distanceRange.min - Number.EPSILON
    ) {
      result.push({
        distanceRange: {
          min: base.distanceRange.min,
          max: intersection.distanceRange.min,
        },
        lightRange: base.lightRange,
      });
    }

    // Right rectangle
    if (
      intersection.distanceRange.max <
      base.distanceRange.max - Number.EPSILON
    ) {
      result.push({
        distanceRange: {
          min: intersection.distanceRange.max,
          max: base.distanceRange.max,
        },
        lightRange: base.lightRange,
      });
    }

    // Bottom rectangle
    if (base.lightRange.min < intersection.lightRange.min - Number.EPSILON) {
      result.push({
        distanceRange: intersection.distanceRange,
        lightRange: {
          min: base.lightRange.min,
          max: intersection.lightRange.min,
        },
      });
    }

    // Top rectangle
    if (intersection.lightRange.max < base.lightRange.max - Number.EPSILON) {
      result.push({
        distanceRange: intersection.distanceRange,
        lightRange: {
          min: intersection.lightRange.max,
          max: base.lightRange.max,
        },
      });
    }

    return result;
  }

  // Main function to check if cameras meet requirements
  public canCamerasMeetRequirements(
    softwareSpec: Rectangle,
    hardwareCameras: Rectangle[],
  ): boolean {
    if (hardwareCameras.length === 0) {
      return false;
    }

    // Start with the entire required area as uncovered
    let uncoveredAreas: Rectangle[] = [softwareSpec];

    // Subtract each camera's coverage from the uncovered areas
    for (const camera of hardwareCameras) {
      const cameraCoverage: Rectangle = {
        distanceRange: camera.distanceRange,
        lightRange: camera.lightRange,
      };

      const newUncoveredAreas: Rectangle[] = [];

      for (const uncoveredArea of uncoveredAreas) {
        const remainingAreas = this.subtractRectangles(
          uncoveredArea,
          cameraCoverage,
        );
        newUncoveredAreas.push(...remainingAreas);
      }

      uncoveredAreas = newUncoveredAreas;

      // Early exit if we've achieved full coverage
      if (uncoveredAreas.length === 0) {
        return true;
      }
    }

    return uncoveredAreas.length === 0;
  }
}
