import { setupCanvas } from "./setup";
import { GameState, initialState, tick, press, restart } from "./game";
import { draw } from "./render";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
let ctx = setupCanvas(canvas);
const state: GameState = { ...initialState };
let buttonPressed = false;

window.onresize = () => (ctx = setupCanvas(canvas));
window.onkeydown = (e) => (e.key === " " ? press(state) : 0);

function handleInput(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const scale = rect.width / 100; // Square, so width = height
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
  // Map full-screen coordinates to canvas space
  const x = (clientX - rect.left) / scale;
  const y = (clientY - rect.top) / scale;

  if (state.type === "gameover") {
    if (x >= 40 && x <= 60 && y >= 55 && y <= 65) {
      buttonPressed = true;
      setTimeout(() => {
        buttonPressed = false;
        restart(state);
      }, 100);
    }
  } else {
    press(state); // Works anywhere on screen
  }
}

document.addEventListener("click", handleInput);
document.addEventListener("touchstart", handleInput, { passive: false });

let lastTime = performance.now();
function loop() {
  const now = performance.now();
  const dt = now - lastTime;
  lastTime = now;
  tick(dt, state);

  if (state.type === "gameover" && buttonPressed) {
    ctx.fillStyle = "#388E3C";
    drawRoundedRect(ctx, 40, 55, 20, 10, 2);
    ctx.fillStyle = "white";
    ctx.font = "bold 5px sans-serif";
    ctx.fillText("Restart", 50, 60);
  }

  draw(ctx, state);
  requestAnimationFrame(loop);
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

requestAnimationFrame(loop);