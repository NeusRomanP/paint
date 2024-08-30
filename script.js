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
const trashButton = $('#trash');

let isDrawing = false;
let tool = TOOLS.DRAW;
let startX, startY;
let lastX = 0;
let lastY = 0;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

colorPicker.addEventListener('change', changeColor);

drawButton.addEventListener('click', setTool(TOOLS.DRAW));
trashButton.addEventListener('click', clearCanvas);

function initializeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

initializeCanvas();

function setTool (newTool) {
  tool = newTool;
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

  if (tool === TOOLS.DRAW) {
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