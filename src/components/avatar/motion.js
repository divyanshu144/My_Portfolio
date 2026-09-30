export const WALK_SPEED = 45;      // px per second
export const RIDE_SPEED = 110;
export const COAST_SPEED = 160;
export const MAN_W = 60;
export const BIKE_W = 100;
export const MARGIN = 16;
export const SEAT_DX = 10;         // man left edge = bike left edge + this, bike facing right
export const SEAT_DX_FLIPPED = 32; // same, bike facing left (the pair mirrors about the bike centre)
export const INTRO_GAP = 190;      // how far behind the seat he starts
export const COAST_DISTANCE = 80;

export const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

export const stepToward = (x, target, speed, dt) => {
  const dist = target - x;
  const step = speed * dt;
  return Math.abs(dist) <= step ? target : x + Math.sign(dist) * step;
};

export const riderBounds = (viewportWidth) => ({
  min: MARGIN,
  max: Math.max(MARGIN, viewportWidth - BIKE_W - MARGIN),
});

export const seatX = (bikeX, facing) => bikeX + (facing === -1 ? SEAT_DX_FLIPPED : SEAT_DX);

export const introPositions = (viewportWidth) => {
  const { min, max } = riderBounds(viewportWidth);
  const bike = clamp(Math.round(viewportWidth * 0.55), Math.min(min + INTRO_GAP, max), max);
  const man = Math.max(MARGIN, seatX(bike, 1) - INTRO_GAP);
  return { bike, man };
};

export const pickRideTarget = ({ current, min, max, rng = Math.random, minDistance = 140 }) => {
  if (max <= min) return min;
  const span = max - min;
  let target = min + rng() * span;
  if (Math.abs(target - current) < minDistance) {
    target = current - min > max - current ? min + rng() * span * 0.3 : max - rng() * span * 0.3;
  }
  return clamp(target, min, max);
};

export const coastBikeX = (bikeX, facing, min, max) => {
  const ahead = bikeX + facing * COAST_DISTANCE;
  if (ahead >= min && ahead <= max) return ahead;
  const behind = bikeX - facing * COAST_DISTANCE;
  return clamp(behind >= min && behind <= max ? behind : ahead, min, max);
};

// Horizontal shift (px) that keeps a bubble of `width` centred on `centerX` inside the viewport.
export const bubbleShift = (centerX, width, viewportWidth, pad = 8) => {
  const left = centerX - width / 2;
  const right = centerX + width / 2;
  if (left < pad) return pad - left;
  if (right > viewportWidth - pad) return viewportWidth - pad - right;
  return 0;
};
