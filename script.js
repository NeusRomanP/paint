const $ = selector => document.querySelector(selector);

const TOOLS = {
  DRAW: 'draw',
  ERASE: 'erase',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  PICKER: 'picker'
};

const canvas = $('canvas');
const ctx = canvas.getContext('2d')

const drawButton = $('#draw');

let isDrawing = false;
let tool = TOOLS.DRAW;
let startX, startY;
let lastX = 0;
let lastY = 0;

let lastOffsetWidth = null;
let lastOffsetHeight = null;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

drawButton.addEventListener('click', setTool(TOOLS.DRAW));

function setTool (newTool) {
  tool = newTool;
}

function startDrawing (e) {
  console.log('start')
  isDrawing = true;

  const { offsetX, offsetY } = e;

  [startX, startY] = [offsetX, offsetY];
  [lastX, lastY] = [offsetX, offsetY];

  if (lastOffsetWidth !== canvas.offsetWidth
      || lastOffsetHeight !== canvas.offsetHeight) {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  lastOffsetWidth = canvas.offsetWidth
  lastOffsetHeight = canvas.offsetHeight;

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

    console.log(startX, startY, lastX, lastY);

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