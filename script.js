const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const TOOLS = {
  DRAW: 'draw',
  ERASE: 'erase',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  PICKER: 'picker',
  FILL: 'fill'
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
const fillButton = $('#fill');
const undoButton = $('#undo');
const trashButton = $('#trash');

const ccTrashButton = $('#custom-colors-trash');

const saveButton = $('#save');

const customColorsContainer = $('.custom-colors');
const customColors = $$('.custom-colors li');
const dropdownMenuItems = $$('nav li.dropdown');

let isDrawing = false;
let isShiftPressed = false;
let pickingColor = false;

let lastImage = null;

let currentColor = '#000000';
let currentColorRGB = parseColor(currentColor);
let selectedCustomColor = null;
let selectedCustomColorIndex = -1;

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

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchleave', stopDrawing);

colorPicker.addEventListener('change', changeColor);

drawButton.addEventListener('click', (e) => setTool(e, TOOLS.DRAW));
eraseButton.addEventListener('click', (e) => setTool(e, TOOLS.ERASE));
rectangleButton.addEventListener('click', (e) => setTool(e, TOOLS.RECTANGLE));
ellipseButton.addEventListener('click', (e) => setTool(e, TOOLS.ELLIPSE));
pickerButton.addEventListener('click', (e) => setTool(e, TOOLS.PICKER));
fillButton.addEventListener('click', (e) => setTool(e, TOOLS.FILL));
undoButton.addEventListener('click', undoMove);
trashButton.addEventListener('click', clearCanvas);
ccTrashButton.addEventListener('click', removeSelectedColor);

saveButton.addEventListener('click', saveImage);

document.addEventListener('keydown', handleShiftKeydown);
document.addEventListener('keyup', handleShiftKeyup);

canvas.addEventListener('touchstart', (e) => {}, { passive: false })

canvas.addEventListener('touchmove', (e) => {}, { passive: false })

Array.from(customColors).forEach((customColor, index) => {
  let touchHandled = false;
  customColor.addEventListener('click', (e) => {
    if (touchHandled) {
      e.preventDefault();
      return
    }
    selectedCustomColorIndex = index;
    handleCustomColor(e);
  })

  customColor.addEventListener('touchstart', (e) => {
    touchHandled = true;
    selectedCustomColorIndex = index;
    handleCustomColor(e);
  })

  customColor.addEventListener('touchend', (e) => {
    touchHandled = false;
  })
})

Array.from(dropdownMenuItems).forEach((dropdownMenu) => {
  dropdownMenu.addEventListener('click', () => {
    dropdownMenu.querySelector('ul').classList.add('open');
  })
  document.addEventListener('click', (e) => {
    if (!dropdownMenu.contains(e.target)) {
      dropdownMenu.querySelector('ul').classList.remove('open');
    }
  })
})

function handleCustomColor(e) {
  if (selectedCustomColorIndex < colors.length 
      && selectedCustomColorIndex > -1) {
    colorPicker.value = e.target.getAttribute('color');
    ctx.strokeStyle = e.target.getAttribute('color');
    selectedCustomColor = e.target;
    changeColor();
    e.target.classList.add('active');
  }
}

function removeSelectedColor(e) {
  if (selectedCustomColorIndex < colors.length 
      && selectedCustomColorIndex > -1) {
    colors.splice(selectedCustomColorIndex, 1);
    updateCustomColors();
  }
}

function clearCustomColors() {
  if (selectedCustomColor) {
    selectedCustomColor = null;
    selectedCustomColorIndex = -1;
  }
  Array.from(customColors).forEach(customColor => {
    customColor.classList.remove('active');
    customColor.style.backgroundColor = 'transparent';
  })
}

function initializeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  canvas.style.cursor = 'crosshair';
  ctx.globalCompositeOperation = 'source-over';
  ctx.lineWidth = drawLW;
  ctx.strokeStyle = '#000';
}

function clearCanvas() {
  lastImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
  undoButton.classList.remove('disabled');

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

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

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

  if (tool === TOOLS.FILL) {
    fillButton.classList.add('active');
    canvas.style.cursor = 'url("./icons/fill.png") 0 24, auto';
    return
  }
}

canvas.addEventListener('click', (e) => {
  if (pickingColor && colors.length < customColors.length) {
    const color = pickColor(e);
    addCustomColor(color);
  }
})

canvas.addEventListener('touch', (e) => {
  if (pickingColor && colors.length < customColors.length) {
    const color = pickColor(e);
    addCustomColor(color);
  }
})

function addCustomColor(color) {
  if (!colors.includes(color.toLowerCase())) {
    colors.push(color.toLowerCase());
    updateCustomColors();
  }
}

function updateCustomColors() {
  clearCustomColors();
  colors.forEach((color, index) => {
    customColors[index].style.backgroundColor = color;
    customColors[index].setAttribute('color', color);
  })
}

function getCoords(e) {
  if (e.touches) {
      return {
          offsetX: e.touches[0].clientX - canvas.getBoundingClientRect().left,
          offsetY: e.touches[0].clientY - canvas.getBoundingClientRect().top
      };
  } else {
      return {
          offsetX: e.clientX - canvas.getBoundingClientRect().left,
          offsetY: e.clientY - canvas.getBoundingClientRect().top
      };
  }
}


function changeColor() {
  const { value } = colorPicker;
  currentColor = value;
  currentColorRGB = parseColor(currentColor);
  ctx.strokeStyle = value;
}

function startDrawing(e) {
  isDrawing = true;

  const { offsetX, offsetY } = getCoords(e);

  if (tool !== TOOLS.PICKER) {
    lastImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  startX = offsetX;
  startY = offsetY;
  lastX = offsetX;
  lastY = offsetY;

  imageData = ctx.getImageData(
    0, 0, canvas.width, canvas.height
  );
}

function draw (e) {
  if (!isDrawing) return;

  const { offsetX, offsetY } = getCoords(e);

  if (tool === TOOLS.DRAW || tool === TOOLS.ERASE) {
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    lastX = offsetX;
    lastY = offsetY;

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

    const { offsetX, offsetY } = getCoords(e);

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
  const { offsetX, offsetY } = getCoords(e);

  const imageData = ctx.getImageData(offsetX, offsetY, 1, 1);
  const [r, g, b, a] = imageData.data;

  if (a === 0) {
      return '#ffffff';
  }

  return hexColor = rgbToHex(r, g, b);
}

function stopDrawing () {
  if (isDrawing) {
    isDrawing = false;
    if (tool !== TOOLS.PICKER) {
      undoButton.classList.remove('disabled');
    }
  }
}

window.addEventListener('resize', () => {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  initializeCanvas();

  ctx.putImageData(imageData, 0, 0);
});

async function saveImage() {
  if (window.showSaveFilePicker) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: 'myImage',
        types: [
          {
              description: 'PNG Image',
              accept: { 'image/png': ['.png'] },
          },
          {
              description: 'JPEG Image',
              accept: { 'image/jpeg': ['.jpeg', '.jpg'] },
          },
          {
              description: 'WEBP Image',
              accept: { 'image/webp': ['.webp'] },
          }
        ],
      });

      const extension = fileHandle.name.split('.').pop().toLowerCase();
      const mimeType = {
        png: 'image/png',
        jpeg: 'image/jpeg',
        jpg: 'image/jpeg',
        webp: 'image/webp',
      }[extension] || 'image/png';

      if (mimeType === 'image/jpeg') {
        const tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = canvas.width;
        tmpCanvas.height = canvas.height;
        const tmpCtx = tmpCanvas.getContext('2d');

        tmpCtx.fillStyle = 'white';
        tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);

        tmpCtx.drawImage(canvas, 0, 0);

        const blob = await new Promise(resolve => tmpCanvas.toBlob(resolve, mimeType));
        await guardarBlob(blob, fileHandle);
      } else {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType));
        await guardarBlob(blob, fileHandle);
      }
    } catch (error) {
        console.log('Something went wrong!')
    }
  } else {
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'myImage.png';
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  
}

async function guardarBlob(blob, fileHandle) {
  const writableStream = await fileHandle.createWritable();
  await writableStream.write(blob);
  await writableStream.close();
}

/* FILL COLOR */
function getPixelColor(x, y) {
  const imageData = ctx.getImageData(x, y, 1, 1);
  const data = imageData.data;
  return [data[0], data[1], data[2], data[3]];
}

function colorsMatch(color1, color2) {
  return color1[0] === color2[0] &&
         color1[1] === color2[1] &&
         color1[2] === color2[2] &&
         color1[3] === color2[3];
}

function floodFill(x, y) {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const targetColor = getPixel(x, y);
  if (colorsMatch(targetColor, currentColor)) return;

  const stack = [[x, y]];

  function setPixel(x, y, color) {
    const index = (y * canvas.width + x) * 4;
    data[index] = color[0];
    data[index + 1] = color[1];
    data[index + 2] = color[2];
    data[index + 3] = 255;
  }

  function getPixel(x, y) {
    const index = (y * canvas.width + x) * 4;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
  }

  while (stack.length) {
    let [currentX, currentY] = stack.pop();

    if (currentX < 0 || currentX >= canvas.width || currentY < 0 || currentY >= canvas.height) continue;

    const currentPixelColor = getPixel(currentX, currentY);

    if (colorsMatch(currentPixelColor, targetColor)) {
      setPixel(currentX, currentY, currentColorRGB);

      stack.push([currentX + 1, currentY]);
      stack.push([currentX - 1, currentY]);
      stack.push([currentX, currentY + 1]);
      stack.push([currentX, currentY - 1]);
    }else {
      setPixel(currentX, currentY, currentColorRGB);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function parseColor(color) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return [data[0], data[1], data[2], data[3]];
}

canvas.addEventListener('click', (e) => {
  if (tool === TOOLS.FILL) {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    floodFill(x, y);
  }
});

function undoMove() {
  if (lastImage) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.putImageData(lastImage, 0, 0);
    undoButton.classList.add('disabled');
    lastImage = null;
  }
}

ctx.lineJoin = 'round';
ctx.lineCap = 'round';