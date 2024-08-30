const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const TOOLS = {
  DRAW: 'draw',
  ERASE: 'erase',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  PICKER: 'picker'
};

const colors = [];

const canvas = $('canvas');
const colorPicker = $('#color');
const ctx = canvas.getContext('2d')

const drawButton = $('#draw');
const eraseButton = $('#erase');
const rectangleButton = $('#rectangle');
const ellipseButton = $('#ellipse');
const pickerButton = $('#picker');
const trashButton = $('#trash');

const customColorsContainer = $('.custom-colors');
const customColors = $$('.custom-colors li');

let isDrawing = false;
let isShiftPressed = false;
let pickingColor = false;

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

drawButton.addEventListener('click', (e) => setTool(e, TOOLS.DRAW));
eraseButton.addEventListener('click', (e) => setTool(e, TOOLS.ERASE));
rectangleButton.addEventListener('click', (e) => setTool(e, TOOLS.RECTANGLE));
ellipseButton.addEventListener('click', (e) => setTool(e, TOOLS.ELLIPSE));
pickerButton.addEventListener('click', (e) => setTool(e, TOOLS.PICKER));
trashButton.addEventListener('click', clearCanvas);

document.addEventListener('keydown', handleShiftKeydown);
document.addEventListener('keyup', handleShiftKeyup);

Array.from(customColors).forEach((customColor) => {
  customColor.addEventListener('click', (e) => {
    colorPicker.value = e.target.getAttribute('color');
    ctx.strokeStyle = e.target.getAttribute('color');
  })
})


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

function handleShiftKeydown({ key }) {
  isShiftPressed = key === 'Shift';
}

function handleShiftKeyup({ key }) {
  if (key === 'Shift') isShiftPressed = false;
}

function setTool (e, newTool) {
  tool = newTool;
  pickingColor = false;
  $('button.active')?.classList.remove('active');

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

  if (tool === TOOLS.RECTANGLE) {
    rectangleButton.classList.add('active');
    canvas.style.cursor = 'crosshair';
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = drawLW;
    return
  }

  if (tool === TOOLS.ELLIPSE) {
    ellipseButton.classList.add('active');
    canvas.style.cursor = 'crosshair';
    ctx.globalCompositeOperation = 'source-over';
    ctx.lineWidth = drawLW;
    return
  }

  if (tool === TOOLS.PICKER) {
    pickerButton.classList.add('active');
    canvas.style.cursor = 'crosshair';
    pickingColor = true
    return
  }
}

canvas.addEventListener('click', (e) => {
  if (pickingColor && colors.length < customColors.length) {
    const color = pickColor(e);
    addCustomColor(color);
  }
})

function addCustomColor(color) {
  colors.push(color);
  updateCustomColors();
}

function updateCustomColors() {
  colors.forEach((color, index) => {
    customColors[index].style.backgroundColor = color;
    customColors[index].setAttribute('color', color);
  })
}

function changeColor() {
  const { value } = colorPicker;
  console.log(value)
  ctx.strokeStyle = value;
}

function startDrawing(e) {
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

  if (tool === TOOLS.RECTANGLE) {
    ctx.putImageData(imageData, 0, 0);
    let width = offsetX - startX;
    let height = offsetY - startY;

    if (isShiftPressed) {
      const sideLength = Math.min(
        Math.abs(width),
        Math.abs(height)
      );

      width = width > 0 ? sideLength : -sideLength;
      height = height > 0 ? sideLength : -sideLength;
    }

    ctx.beginPath();
    ctx.rect(startX, startY, width, height);
    ctx.stroke();
    return
  }

  if (tool === TOOLS.ELLIPSE) {
    ctx.putImageData(imageData, 0, 0);

    const { offsetX, offsetY } = e;

    let radiusX = Math.abs(offsetX - startX) / 2;
    let radiusY = Math.abs(offsetY - startY) / 2;

    let centerX = startX + (offsetX - startX) / 2;
    let centerY = startY + (offsetY - startY) / 2;

    if (isShiftPressed) {
      const radius = Math.min(radiusX, radiusY);
      radiusX = radiusY = radius;

      centerX = startX + Math.sign(offsetX - startX) * radiusX;
      centerY = startY + Math.sign(offsetY - startY) * radiusY;
    }

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
    return
  }
  
}

function rgbToHex(r, g, b) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function pickColor(e) {
  const { offsetX, offsetY } = e;

  const imageData = ctx.getImageData(offsetX, offsetY, 1, 1);
  const [r, g, b, a] = imageData.data;

  if (a === 0) {
      return '#ffffff';
  }

  return hexColor = rgbToHex(r, g, b);
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