import { GameState, Particle } from "./game";
import { db, ref, onValue } from "./firebase";
import confetti from "canvas-confetti";

let lastConfettiTime = 0;
let leaderboardCache: { name: string; score: number }[] = [];

function updateLeaderboardCache() {
  onValue(ref(db, "leaderboard"), (snapshot) => {
    const data = snapshot.val() || {};
    leaderboardCache = Object.values(data)
      .map((entry: any) => ({
        name: entry.name,
        score: entry.score
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    console.log("Leaderboard updated:", leaderboardCache);
  }, { onlyOnce: true });
}

// Initial fetch
updateLeaderboardCache();

export function draw(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.clearRect(0, 0, 100, 100);

  if (state.type === "instructions") {
    ctx.fillStyle = "black";
    ctx.font = "bold 5px sans-serif";
    ctx.fillText("spacebar or click", 50, 50);
    return;
  }

  const fgColor = state.type === "gameover" || state.type === "nameEntry" ? "white" : "black";
  const bgColor = state.type === "gameover" || state.type === "nameEntry" ? "black" : "white";
  ctx.fillStyle = state.type === "gameover" || state.type === "nameEntry" ? "#00000040" : "#ffffff40";
  ctx.fillRect(0, 0, 100, 100);
  document.body.style.backgroundColor = bgColor;

  const MIN_RADIUS = 1;
  state.particles.forEach((p: Particle) => {
    const radius = 5 * (1 - p.age / 0.1);
    const pos = angleToPos(p.angle);
    if (radius > MIN_RADIUS) drawCircle(ctx, pos.x, pos.y, radius, fgColor);
  });

  const pos1 = angleToPos(state.targetAngle);
  drawCircle(ctx, pos1.x, pos1.y, 5, fgColor);
  const pos2 = angleToPos(state.ballAngle);
  drawCircle(ctx, pos2.x, pos2.y, 5, fgColor);

  ctx.fillStyle = fgColor;
  ctx.font = "bold 10px sans-serif";
  ctx.fillText(state.score.toString(), 50, 45);

  // Leaderboard button (top left)
  const crownImg = new Image();
  crownImg.src = "https://img.icons8.com/lollipop/48/crown.png";
  ctx.drawImage(crownImg, 5, 5, 5, 5);
  if (state.showLeaderboard) drawLeaderboard(ctx, state);

  // Confetti for top 10
  const now = performance.now();
  if (state.confetti && now - lastConfettiTime >= 1000) {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      disableForReducedMotion: true,
    });
    lastConfettiTime = now;
  }

  if (state.type === "gameover") {
    ctx.fillStyle = "#4CAF50";
    drawRoundedRect(ctx, 40, 55, 20, 10, 2);
    ctx.fillStyle = "white";
    ctx.font = "bold 5px sans-serif";
    ctx.fillText("Restart", 50, 60);
  } else if (state.type === "nameEntry") {
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 5px sans-serif";
    ctx.fillText("Top 10 Score!", 50, 52);
    ctx.fillStyle = "#FFFFFF";
    drawRoundedRect(ctx, 35, 55, 30, 6, 1);
    ctx.fillStyle = "#333333";
    ctx.font = "bold 4px sans-serif";
    ctx.fillText(state.name || "Type name", 50, 58);
    ctx.fillStyle = "#4CAF50";
    drawRoundedRect(ctx, 45, 62, 10, 6, 1);
    ctx.fillStyle = "white";
    ctx.font = "bold 3px sans-serif";
    ctx.fillText("OK", 50, 65);
  }
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI);
  ctx.fill();
}

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}

function drawLeaderboard(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.fillStyle = "#008080";
  drawRoundedRect(ctx, 5, 15, 40, 45, 2); // y: 15-60, height reduced to 45
  ctx.font = "bold 2px sans-serif";
  ctx.textAlign = "left";
  if (leaderboardCache.length === 0) {
    ctx.fillStyle = "white";
    ctx.fillText("No scores yet", 18, 18);
  } else {
    leaderboardCache.forEach((entry, i) => {
      ctx.fillStyle = i < 3 ? "#FFD700" : "white";
      ctx.fillText(`${i + 1}. ${entry.name}: ${entry.score}`, 18, 18 + i * 3); // Reduced spacing to 3px
    });
  }
  ctx.fillStyle = "white";
  ctx.fillText(`Your Rank: ${state.rank || "N/A"}`, 18, 53); // Adjusted for new height
  ctx.textAlign = "start";
}

const angleToPos = (angle: number) => ({
  x: 50 + 40 * Math.cos(angle),
  y: 50 + 40 * Math.sin(angle),
});