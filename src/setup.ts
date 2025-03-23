export function setupCanvas(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    const size = Math.min(window.innerWidth, window.innerHeight) * 0.9; // 90% of smallest dimension
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    ctx.resetTransform();
    const scale = (size / 100) * window.devicePixelRatio; // GAME_SIZE = 100
    ctx.scale(scale, scale);
    ctx.lineCap = "round";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 10px sans-serif";
    return ctx;
  }