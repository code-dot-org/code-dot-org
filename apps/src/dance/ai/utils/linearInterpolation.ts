// Linear interpolation.
export const lerp = (step: number, steps: number, min: number, max: number) => {
  return (step / steps) * (max - min) + min;
};
