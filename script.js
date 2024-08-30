const $ = selector => document.querySelector(selector);

const TOOLS = {
  DRAW: 'draw',
  ERASE: 'erase',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  PICKER: 'picker'
};

const canvas = $('canvas');
const colorPicker = $('#color');
const ctx = canvas.getContext('2d')

const drawButton = $('#draw');
const eraseButton = $('#erase');
const trashButton = $('#trash');

let isDrawing = false;
let tool = TOOLS.DRAW;
let startX, startY;
let lastX = 0;
let lastY = 0;

let drawLW = 2;
let eraseLW = 20;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

colorPicker.addEventListener('change', changeColor);

drawButton.addEventListener('click', () => setTool(TOOLS.DRAW));
eraseButton.addEventListener('click', () => setTool(TOOLS.ERASE));
trashButton.addEventListener('click', () => clearCanvas);


function initializeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  canvas.style.cursor = 'crosshair';
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineWidth = drawLW;
  ctx.strokeStyle = '#000';
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

initializeCanvas();

function setTool (newTool) {
  tool = newTool;
  $('button.active')?.classList.remove('active');

  console.log(tool, newTool, 'hola')

  if (tool === TOOLS.DRAW) {
    drawButton.classList.add('active');
    canvas.style.cursor = 'crosshair';
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = drawLW;
    return
  }

  if (tool === TOOLS.ERASE) {
    eraseButton.classList.add('active');
    canvas.style.cursor = 'url("./cursors/erase.png") 0 24, auto';
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = eraseLW;
    return
  }
}

function changeColor () {
  const { value } = colorPicker;
  console.log(value)
  ctx.strokeStyle = value;
}

function startDrawing (e) {
  isDrawing = true;

  const { offsetX, offsetY } = e;

  [startX, startY] = [offsetX, offsetY];
  [lastX, lastY] = [offsetX, offsetY];

  imageData = ctx.getImageData(
    0, 0, canvas.width, canvas.height
  );
}

function draw (e) {
  if (!isDrawing) return;

  const { offsetX, offsetY } = e;

  if (tool === TOOLS.DRAW || tool === TOOLS.ERASE) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    [lastX, lastY] = [offsetX, offsetY];

    return
  }
  
}

function stopDrawing () {
  if (isDrawing) {
    console.log('stop')
    isDrawing = false;
  }
}

window.addEventListener('resize', () => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  initializeCanvas();

  ctx.putImageData(imageData, 0, 0);
});

ctx.lineJoin = 'round';
ctx.lineCap = 'round';