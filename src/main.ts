import { setupCanvas } from "./setup";
import { GameState, initialState, tick, press, restart, submitName, toggleLeaderboard } from "./game";
import { draw } from "./render";
import { auth, signInAnonymously } from "./firebase";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
let ctx = setupCanvas(canvas);
const state: GameState = { ...initialState };
let buttonPressed = false;

// Authenticate on startup
signInAnonymously(auth)
  .then((userCredential) => {
    state.userId = userCredential.user.uid;
    console.log("Authenticated with UID:", userCredential.user.uid);
  })
  .catch((error) => console.error("Auth failed:", error));

window.onresize = () => (ctx = setupCanvas(canvas));
window.onkeydown = (e) => (e.key === " " ? press(state) : 0);

function handleInput(e: MouseEvent | TouchEvent) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const scale = rect.width / 100;
  const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
  const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
  const x = (clientX - rect.left) / scale;
  const y = (clientY - rect.top) / scale;

  console.log("Click at:", x, y);
  if (x >= 5 && x <= 15 && y >= 5 && y <= 15) {
    toggleLeaderboard(state);
  } else if (state.type === "gameover") {
    if (x >= 40 && x <= 60 && y >= 55 && y <= 65) {
      buttonPressed = true;
      setTimeout(() => {
        buttonPressed = false;
        restart(state);
      }, 100);
    }
  } else if (state.type === "nameEntry") {
    if (x >= 35 && x <= 65 && y >= 55 && y <= 61) {
      state.name = "";
    } else if (x >= 45 && x <= 55 && y >= 62 && y <= 68) {
      console.log("OK button clicked, submitting name:", state.name);
      submitName(state, state.name || "");
    }
  } else {
    press(state);
  }
}

document.addEventListener("click", handleInput);
document.addEventListener("touchstart", handleInput, { passive: false });

window.addEventListener("keydown", (e) => {
  if (state.type === "nameEntry") {
    if (e.key === "Backspace") {
      state.name = (state.name || "").slice(0, -1);
    } else if (e.key.length === 1 && (state.name || "").length < 10) {
      state.name = (state.name || "") + e.key;
    }
    console.log("Current name:", state.name);
  }
});

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

requestAnimationFrame(loop);