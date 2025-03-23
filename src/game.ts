import { Howl } from "howler";

const START_SPEED = 0.004;
const MAX_SPEED = 0.012;
const RING_RADIUS = 40;
const BALL_RADIUS = 5;
const PARTICLE_MAX_AGE = 0.1;

const hitmarkerSound = new Howl({ src: ["/hitmarker.mp3"] });
const missSound = new Howl({ src: ["/miss.wav"] });

export type Particle = {
  age: number;
  angle: number;
};

export type GameState = {
  type: "instructions" | "playing" | "gameover";
  score: number;
  ballAngle: number;
  dir: 1 | -1;
  targetAngle: number;
  particles: Particle[];
};

export const initialState: GameState = {
  type: "instructions",
  score: 0,
  ballAngle: 0,
  dir: -1,
  targetAngle: Math.random() * 2 * Math.PI,
  particles: [],
};

export function isOnTarget(state: GameState) {
  const playerPos = angleToPos(state.ballAngle);
  const targetPos = angleToPos(state.targetAngle);
  const dist = Math.hypot(playerPos.x - targetPos.x, playerPos.y - targetPos.y);
  return dist < BALL_RADIUS * 2;
}

export function tick(dt: number, state: GameState) {
  if (state.type === "playing") {
    const speed = MAX_SPEED - (MAX_SPEED - START_SPEED) / (1 + state.score * 0.01);
    state.ballAngle += dt * speed * state.dir;
    state.particles.push({ age: 0, angle: state.ballAngle });
  }
  state.particles.forEach((p) => (p.age += dt / 1000));
  state.particles = state.particles.filter((p) => p.age <= PARTICLE_MAX_AGE);
}

export function press(state: GameState) {
  if (state.type === "instructions") {
    state.type = "playing";
  } else if (state.type === "playing") { // Changed from "gameover" check
    if (isOnTarget(state)) {
      hitmarkerSound.play();
      state.score++;
      state.dir = -state.dir as 1 | -1;
      state.targetAngle = Math.random() * 2 * Math.PI;
    } else {
      missSound.play();
      state.type = "gameover";
    }
  }
}

export function restart(state: GameState) { // New function for restart
  state.type = "playing";
  state.score = 0;
  state.ballAngle = 0;
  state.dir = -1;
  state.targetAngle = Math.random() * 2 * Math.PI;
  state.particles = [];
}

const angleToPos = (angle: number) => ({
  x: 50 + RING_RADIUS * Math.cos(angle),
  y: 50 + RING_RADIUS * Math.sin(angle),
});