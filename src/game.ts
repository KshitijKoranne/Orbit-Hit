import { Howl } from "howler";
import { db, ref, set, onValue } from "./firebase";
import { DataSnapshot } from "firebase/database";

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
  type: "instructions" | "playing" | "gameover" | "nameEntry";
  score: number;
  ballAngle: number;
  dir: 1 | -1;
  targetAngle: number;
  particles: Particle[];
  userId?: string;
  showLeaderboard: boolean;
  name?: string;
  confetti: boolean;
  rank?: number;
};

export const initialState: GameState = {
  type: "instructions",
  score: 0,
  ballAngle: 0,
  dir: -1,
  targetAngle: Math.random() * 2 * Math.PI,
  particles: [],
  showLeaderboard: false,
  confetti: false,
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
  } else if (state.type === "playing") {
    if (isOnTarget(state)) {
      hitmarkerSound.play();
      state.score++;
      state.dir = -state.dir as 1 | -1;
      state.targetAngle = Math.random() * 2 * Math.PI;
    } else {
      missSound.play();
      checkLeaderboard(state);
      state.type = state.score > 10 ? "nameEntry" : "gameover";
    }
  }
}

export function restart(state: GameState) {
  state.type = "playing";
  state.score = 0;
  state.ballAngle = 0;
  state.dir = -1;
  state.targetAngle = Math.random() * 2 * Math.PI;
  state.particles = [];
  state.showLeaderboard = false;
  state.confetti = false;
  state.name = undefined;
  state.rank = undefined;
}

export function submitName(state: GameState, name: string) {
  console.log("submitName called with:", { name, userId: state.userId, type: state.type });
  if (state.userId && state.type === "nameEntry" && name.trim()) {
    const timestamp = Date.now();
    console.log("Submitting to Firebase:", { name: name.trim(), score: state.score });
    set(ref(db, `leaderboard/${timestamp}`), {
      name: name.trim(),
      score: state.score,
      timestamp: timestamp,
      userId: state.userId
    })
      .then(() => {
        console.log("Submitted successfully");
        state.type = "gameover";
      })
      .catch((error) => console.error("Submit failed:", error));
  } else {
    console.log("Submit skipped:", {
      userId: state.userId,
      type: state.type,
      name: name,
    });
  }
}

export function toggleLeaderboard(state: GameState) {
  state.showLeaderboard = !state.showLeaderboard;
}

function checkLeaderboard(state: GameState) {
  onValue(ref(db, "leaderboard"), (snapshot: DataSnapshot) => {
    const data = snapshot.val() || {};
    const allScores = Object.values(data)
      .map((entry: any) => ({
        name: entry.name,
        score: entry.score,
        userId: entry.userId
      }))
      .sort((a, b) => b.score - a.score);
    
    allScores.push({ name: state.name || "", score: state.score, userId: state.userId || "" });
    allScores.sort((a, b) => b.score - a.score);
    
    const playerRank = state.userId
      ? allScores.findIndex((s) => s.userId === state.userId && s.score === state.score) + 1 || allScores.length
      : allScores.length;
    state.rank = playerRank;
    state.confetti = state.score > 10 && (playerRank <= 10 || allScores.length < 10);
    console.log("Rank:", state.rank, "Confetti:", state.confetti, "Total Scores:", allScores.length);
  }, { onlyOnce: true });
}

const angleToPos = (angle: number) => ({
  x: 50 + RING_RADIUS * Math.cos(angle),
  y: 50 + RING_RADIUS * Math.sin(angle),
});