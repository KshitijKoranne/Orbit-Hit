import { GameState, Particle } from "./game";

export function draw(ctx: CanvasRenderingContext2D, state: GameState) {
  ctx.clearRect(0, 0, 100, 100);

  if (state.type === "instructions") {
    ctx.fillStyle = "black";
    ctx.font = "bold 5px sans-serif";
    ctx.fillText("spacebar or click", 50, 50);
    return;
  }

  const fgColor = state.type === "gameover" ? "white" : "black";
  const bgColor = state.type === "gameover" ? "black" : "white";
  ctx.fillStyle = state.type === "gameover" ? "#00000040" : "#ffffff40";
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

  // Score at the center
  ctx.fillStyle = fgColor;
  ctx.font = "bold 10px sans-serif";
  ctx.fillText(state.score.toString(), 50, 45);

  // Modern restart button on game over
  if (state.type === "gameover") {
    // Button background with rounded corners
    ctx.fillStyle = "#4CAF50"; // Green base color
    drawRoundedRect(ctx, 40, 55, 20, 10, 2); // x, y, width, height, radius

    // Subtle shadow for depth
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    drawRoundedRect(ctx, 40, 56, 20, 10, 2); // Slight offset for shadow
    ctx.fillStyle = "#4CAF50"; // Restore green for top layer
    drawRoundedRect(ctx, 40, 55, 20, 10, 2);

    // Button text
    ctx.fillStyle = "white";
    ctx.font = "bold 5px sans-serif";
    ctx.fillText("Restart", 50, 60);
  }
}

function drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r, 0, 0, 2 * Math.PI);
  ctx.fill();
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}

const angleToPos = (angle: number) => ({
  x: 50 + 40 * Math.cos(angle),
  y: 50 + 40 * Math.sin(angle),
});