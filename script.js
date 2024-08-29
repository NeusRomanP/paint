const $ = selector => document.querySelector(selector);

const canvas = $('canvas');

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseleave', stopDrawing);

let isDrawing = false;

function startDrawing () {
  console.log('start')
  isDrawing = true;
}

function draw () {
  if (isDrawing) {
    console.log('draw')
  }
  
}

function stopDrawing () {
  if (isDrawing) {
    console.log('stop')
    isDrawing = false;
  }
}