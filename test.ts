// Types to represent ranges
interface Range {
  min: number;
  max: number;
}

interface HardwareCamera {
  id: string;
  distanceRange: Range;
  lightRange: Range;
}

interface SoftwareCamera {
  requiredDistanceRange: Range;
  requiredLightRange: Range;
}

// Represents a 2D range (rectangle in distance-light space)
interface Coverage {
  distanceRange: Range;
  lightRange: Range;
}

// Helper to check if a range is valid
function isValidRange(range: Range): boolean {
  return range.min <= range.max;
}

// Find the intersection of two ranges
function intersectRanges(range1: Range, range2: Range): Range | null {
  const min = Math.max(range1.min, range2.min);
  const max = Math.min(range1.max, range2.max);
  return min <= max ? { min, max } : null;
}

// Find the intersection of two coverage areas
function intersectCoverage(cov1: Coverage, cov2: Coverage): Coverage | null {
  const distanceRange = intersectRanges(cov1.distanceRange, cov2.distanceRange);
  const lightRange = intersectRanges(cov1.lightRange, cov2.lightRange);

  if (!distanceRange || !lightRange) {
    return null;
  }

  return { distanceRange, lightRange };
}

// Merge overlapping or adjacent ranges
function mergeRanges(ranges: Range[]): Range[] {
  if (ranges.length === 0) return [];

  // Sort ranges by min value
  const sortedRanges = [...ranges].sort((a, b) => a.min - b.min);
  const mergedRanges: Range[] = [sortedRanges[0]];

  for (let i = 1; i < sortedRanges.length; i++) {
    const current = sortedRanges[i];
    const last = mergedRanges[mergedRanges.length - 1];

    // If current range overlaps or is adjacent to last merged range
    if (current.min <= last.max + Number.EPSILON) {
      last.max = Math.max(last.max, current.max);
    } else {
      mergedRanges.push(current);
    }
  }

  return mergedRanges;
}

// Find gaps in coverage compared to required range
function findGaps(required: Range, covered: Range[]): Range[] {
  const mergedCovered = mergeRanges(covered);
  const gaps: Range[] = [];
  let currentPos = required.min;

  for (const range of mergedCovered) {
    // If there's a gap before this range
    if (range.min > currentPos + Number.EPSILON) {
      gaps.push({ min: currentPos, max: range.min });
    }
    currentPos = range.max;
  }

  // Check for gap after last range
  if (currentPos < required.max - Number.EPSILON) {
    gaps.push({ min: currentPos, max: required.max });
  }

  return gaps;
}

// Main function to check if cameras meet requirements
function canCamerasMeetRequirements(
  softwareSpec: SoftwareCamera,
  hardwareCameras: HardwareCamera[],
): {
  success: boolean;
  gaps?: {
    distanceGaps: Range[];
    lightGaps: Range[];
    uncoveredAreas: Coverage[];
  };
} {
  if (hardwareCameras.length === 0) {
    return {
      success: false,
      gaps: {
        distanceGaps: [softwareSpec.requiredDistanceRange],
        lightGaps: [softwareSpec.requiredLightRange],
        uncoveredAreas: [
          {
            distanceRange: softwareSpec.requiredDistanceRange,
            lightRange: softwareSpec.requiredLightRange,
          },
        ],
      },
    };
  }

  // Get all covered ranges for distance and light separately
  const coveredDistanceRanges = hardwareCameras.map((cam) => cam.distanceRange);
  const coveredLightRanges = hardwareCameras.map((cam) => cam.lightRange);

  // Find gaps in both dimensions
  const distanceGaps = findGaps(
    softwareSpec.requiredDistanceRange,
    coveredDistanceRanges,
  );
  const lightGaps = findGaps(
    softwareSpec.requiredLightRange,
    coveredLightRanges,
  );

  // If there are no gaps in either dimension, we need to check for uncovered areas
  // within the covered ranges (holes in the middle of the coverage)
  const uncoveredAreas: Coverage[] = [];

  // For each potential coverage area, check if it's actually covered by any camera
  for (let i = 0; i <= coveredDistanceRanges.length; i++) {
    for (let j = 0; j <= coveredLightRanges.length; j++) {
      const distRange = {
        min:
          i === 0
            ? softwareSpec.requiredDistanceRange.min
            : coveredDistanceRanges[i - 1].max,
        max:
          i === coveredDistanceRanges.length
            ? softwareSpec.requiredDistanceRange.max
            : coveredDistanceRanges[i].min,
      };

      const lightRange = {
        min:
          j === 0
            ? softwareSpec.requiredLightRange.min
            : coveredLightRanges[j - 1].max,
        max:
          j === coveredLightRanges.length
            ? softwareSpec.requiredLightRange.max
            : coveredLightRanges[j].min,
      };

      // Skip invalid ranges
      if (!isValidRange(distRange) || !isValidRange(lightRange)) continue;

      // Check if this area is covered by any camera
      const area: Coverage = {
        distanceRange: distRange,
        lightRange: lightRange,
      };
      let isAreaCovered = false;

      for (const camera of hardwareCameras) {
        const cameraCoverage: Coverage = {
          distanceRange: camera.distanceRange,
          lightRange: camera.lightRange,
        };

        if (intersectCoverage(area, cameraCoverage)) {
          isAreaCovered = true;
          break;
        }
      }

      if (!isAreaCovered) {
        uncoveredAreas.push(area);
      }
    }
  }

  const success =
    distanceGaps.length === 0 &&
    lightGaps.length === 0 &&
    uncoveredAreas.length === 0;

  return {
    success,
    gaps: success
      ? undefined
      : {
          distanceGaps,
          lightGaps,
          uncoveredAreas,
        },
  };
}

// Example usage
function demonstrateUsage() {
  const softwareSpec: SoftwareCamera = {
    requiredDistanceRange: { min: 0.1, max: 10 }, // meters
    requiredLightRange: { min: 1, max: 1000 }, // lux
  };

  const hardwareCameras: HardwareCamera[] = [
    {
      id: "macro-cam",
      distanceRange: { min: 0.1, max: 0.5 },
      lightRange: { min: 10, max: 1000 },
    },
    {
      id: "standard-cam",
      distanceRange: { min: 0.3, max: 5 },
      lightRange: { min: 1, max: 800 },
    },
    {
      id: "telephoto-cam",
      distanceRange: { min: 3, max: 10 },
      lightRange: { min: 5, max: 900 },
    },
  ];

  const result = canCamerasMeetRequirements(softwareSpec, hardwareCameras);
  console.log("Camera system test result:", result);
}

export {
  canCamerasMeetRequirements,
  type HardwareCamera,
  type SoftwareCamera,
  type Range,
  type Coverage,
};
