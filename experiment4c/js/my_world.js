"use strict";

/* global XXH, loadImage, createGraphics, color, CENTER, noStroke, fill, push, beginShape, vertex, endShape, pop, translate, image, floor, map, random, min */
/* exported 
    p3_preload, 
    p3_setup, 
    p3_worldKeyChanged,
    p3_tileWidth, 
    p3_tileHeight, 
    p3_tileClicked,
    p3_drawBefore, 
    p3_drawTile, 
    p3_drawSelectedTile, 
    p3_drawAfter
*/

const IMAGE_THRESHOLD = 0.6;  
const LIFT_OFFSET = -10;       
const TILE_WIDTH = 64;       
const TILE_HEIGHT = 64;      

const pokeUrls = [
  "https://cdn.glitch.global/470f81d7-3aac-48da-b769-f5ca4f18d17f/miao.png",
  "https://cdn.glitch.global/470f81d7-3aac-48da-b769-f5ca4f18d17f/mu.png",
  "https://cdn.glitch.global/470f81d7-3aac-48da-b769-f5ca4f18d17f/ha.png",
  "https://cdn.glitch.global/470f81d7-3aac-48da-b769-f5ca4f18d17f/saki.png",
  "https://cdn.glitch.global/470f81d7-3aac-48da-b769-f5ca4f18d17f/miku.png"
];

let images = [];              
let tileImageIndices = {};    
let tileStates = {};           
let clicks = {};               
let worldSeed;                
let tw, th;                 
let loadingProgress = 0;     

async function p3_preload() {
  createLoadingIndicator();
  
  images = await Promise.all(
    pokeUrls.map(async (url, index) => {
      try {
        const img = await loadImage(url + '?v=' + Date.now());
        updateProgress(index + 1);
        return img;
      } catch (e) {
        console.warn(`Image loading failed: ${url}`, e);
        updateProgress(index + 1);
        return createFallbackImage();
      }
    })
  );
  
  imageMode(CENTER);
}

function p3_setup() {
  tw = p3_tileWidth();
  th = p3_tileHeight();
  noSmooth(); 
}

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
  
  tileImageIndices = {};
  tileStates = {};
  clicks = {};
}

function p3_tileWidth() { return TILE_WIDTH; }
function p3_tileHeight() { return TILE_HEIGHT; }

function p3_tileClicked(i, j) {
  const key = `${i}_${j}`;
  clicks[key] = (clicks[key] || 0) + 1;
  
  const clickId = Date.now();
  tileStates[key] = clickId;

  setTimeout(() => {
    if (tileStates[key] === clickId) {
      tileImageIndices[key] = -1;
      setTimeout(() => {
        if (tileStates[key] === clickId) {
          tileImageIndices[key] = getRandomImageIndex();
        }
      }, 1000);
    }
  }, 1000);
}

function p3_drawBefore() {
  background(100); 
}

function p3_drawTile(i, j) {
  noStroke();
  fill(getTileColor(i, j));
  
  drawTileBase(i, j);
  drawTileImage(i, j);
}

function p3_drawSelectedTile(i, j) {
  drawSelectionEffect(i, j);
  drawCoordinates(i, j);
}

function p3_drawAfter() {}

function createFallbackImage() {
  const g = createGraphics(TILE_WIDTH, TILE_HEIGHT);
  g.background(220);
  g.fill(100);
  g.stroke(150);
  g.strokeWeight(2);
  g.rect(5, 5, TILE_WIDTH-10, TILE_HEIGHT-10, 5);
  g.textSize(14);
  g.textAlign(CENTER, CENTER);
  g.text("?", TILE_WIDTH/2, TILE_HEIGHT/2);
  return g;
}

function getTileColor(i, j) {
  return (i + j) % 2 === 0 
    ? color(245) 
    : color(255, 122, 117);
}

function drawTileBase(i, j) {
  push();
  beginShape();
  vertex(-tw/2, -th/2);
  vertex(tw/2, -th/2);
  vertex(tw/2, th/2);
  vertex(-tw/2, th/2);
  endShape(CLOSE);
  pop();
}

function drawTileImage(i, j) {
  const key = `${i}_${j}`;
  initTileImageIndex(key, i, j);
  translate(-30, -30); 
  
  if (tileImageIndices[key] !== -1 && images[tileImageIndices[key]]) {
    push();
    if (tileStates[key]) translate(0, LIFT_OFFSET);
    
    const img = images[tileImageIndices[key]];
    const scale = min(tw/img.width, th/img.height) * 0.9;
    image(img, 0, 0, img.width*scale, img.height*scale);
    
    pop();
  }
}

function initTileImageIndex(key, i, j) {
  if (tileImageIndices[key] === undefined) {
    const hash = XXH.h32("tile:" + [i, j], worldSeed);
    const normalizedHash = (hash + 0.5) / 0xFFFFFFFF;
    
    tileImageIndices[key] = normalizedHash < IMAGE_THRESHOLD
      ? -1
      : floor(map(hash, 0, 0xFFFFFFFF, 0, images.length-1, true));
  }
}

function drawSelectionEffect(i, j) {
  push();
  noFill();
  stroke(255, 204, 0, 200);
  strokeWeight(2);
  rect(-tw/2+2, -th/2+2, tw-4, th-4, 5);
  pop();
}

function drawCoordinates(i, j) {
  push();
  fill(255);
  noStroke();
  textSize(12);
  textAlign(CENTER, CENTER);
  text(`(${i},${j})`, 0, 0);
  pop();
}

function getRandomImageIndex() {
  return images.length > 0 ? floor(random(images.length)) : -1;
}

function createLoadingIndicator() {
  const div = document.createElement('div');
  div.id = 'loading';
  div.style = `
    position: fixed;
    top: 20px;
    left: 20px;
    color: white;
    background: rgba(0,0,0,0.7);
    padding: 10px;
    border-radius: 5px;
    font-family: Arial;
  `;
  div.innerHTML = `
    <div>loading: <span id="progress">0%</span></div>
    <div>Loaded: <span id="loaded">0/${pokeUrls.length}</span></div>
  `;
  document.body.appendChild(div);
}

function updateProgress(count) {
  loadingProgress = count;
  const percent = Math.floor((count / pokeUrls.length) * 100);
  document.getElementById('progress').textContent = `${percent}%`;
  document.getElementById('loaded').textContent = `${count}/${pokeUrls.length}`;
  
  if (count === pokeUrls.length) {
    setTimeout(() => {
      document.getElementById('loading').remove();
    }, 1000);
  }
}