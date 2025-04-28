"use strict";

/* global XXH */
/* exported --
    p3_preload-
    p3_setup-
    p3_worldKeyChanged-
    p3_tileWidth-
    p3_tileHeight-
    p3_tileClicked
    p3_drawBefore-
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter-
*/

function p3_preload() {}
function p3_setup() {}

let worldSeed;
let clicks = {};
let colorOffset = 0;

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
  colorOffset = Math.floor(random(0, 100));
  clicks = {};
}

function p3_tileWidth() { return 16; }
function p3_tileHeight() { return 16; }
const blockSize = p3_tileWidth();

function getTileKey(i, j) {
  return `${i},${j}`;
}
function getHash(i, j, tag = "tile") {
  return XXH.h32(`${tag}:${i},${j}`, worldSeed).toNumber();
}

function p3_tileClicked(i, j, event) {
  const key = getTileKey(i, j);
  if (event.type === 'mousedown') {
    clicks[key] = (clicks[key] || 0) === 1 ? 0 : 1;
  }
}

function p3_tileHovered(i, j) {
  if (isDragging) {  // isDragging 也是 global 的
    const key = getTileKey(i, j);
    clicks[key] = 1;
  }
}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  noStroke();
  push();

  const key = getTileKey(i, j);

  if (clicks[key] == null) {
    const generationType = getHash(i, j) % 30;
    if (generationType === 0) generateCross3x3(i, j);
    else if (generationType === 1) generateSquare2x2(i, j);
    else if (generationType === 2) generateHollowSquare3x3(i, j);
  }

  const n = clicks[key] | 0;
  if (n > 0) {
    generateRoof(i, j, n);

  } else {
    generateFloor(i, j);
  }

  pop();
}

function canPlaceStructure(i, j, distance = 10) {
  for (let x = i - distance; x <= i + distance; x++) {
    for (let y = j - distance; y <= j + distance; y++) {
      if (clicks[getTileKey(x, y)] > 0) return false;
    }
  }
  return true;
}

function generateCross3x3(i, j) {
  if (!canPlaceStructure(i, j)) return;
  const offsets = [[0,0], [-1,0], [1,0], [0,-1], [0,1]];
  offsets.forEach(([dx, dy]) => clicks[getTileKey(i+dx, j+dy)] = 1);
}

function generateSquare2x2(i, j) {
  if (!canPlaceStructure(i, j)) return;
  const offsets = [[0,0], [1,0], [0,1], [1,1]];
  offsets.forEach(([dx, dy]) => clicks[getTileKey(i+dx, j+dy)] = 1);
}

function generateHollowSquare3x3(i, j) {
  if (!canPlaceStructure(i, j)) return;
  const offsets = [
    [-1,-1], [0,-1], [1,-1],
    [-1, 0],        [1, 0],
    [-1, 1], [0, 1], [1, 1]
  ];
  offsets.forEach(([dx, dy]) => clicks[getTileKey(i+dx, j+dy)] = 1);
}

function generateRoof(i, j, n) {
  let hash = getHash(i, j);

  colorMode(HSB);
  let baseHue = 210; 
  let hueJitter = map(hash, 0, 4294967295, -10, 10);
  let saturation = map(hash, 0, 4294967295, 200, 255);
  let brightness = map(hash, 0, 4294967295, 70, 90);

  fill((baseHue + hueJitter + 360) % 360, saturation, brightness);
  colorMode(RGB);

  let sideWave = hash % 2 == 0 ? sinAt(i + millis() * 0.005) : 0;
  let upperWave = hash % 2 == 1 ? sinAt(i + millis() * 0.005) : 0;

  stroke(0);
  strokeWeight(1);

  beginShape();
  vertex(-p3_tileWidth(), -blockSize * n + sideWave);
  vertex(0, p3_tileHeight() - blockSize * n + upperWave);
  vertex(p3_tileWidth(), -blockSize * n + sideWave);
  vertex(0, -p3_tileHeight() - blockSize * n + upperWave);
  endShape(CLOSE);

  noStroke();
}

function generateFloor(i, j, n) {
  let hash = getHash(i, j);

  colorMode(HSB);
  let baseHue = 120; 
  let hueJitter = map(hash, 0, 4294967295, -10, 10);
  let saturation = map(hash, 0, 4294967295, 200, 255);
  let brightness = map(hash, 0, 4294967295, 70, 90);

  fill((baseHue + hueJitter + 360) % 360, saturation, brightness);
  colorMode(RGB);

  let sideWave = hash % 2 == 0 ? sinAt(i + millis() * 0.005) : 0;
  let upperWave = hash % 2 == 1 ? sinAt(i + millis() * 0.005) : 0;

  stroke(0);
  strokeWeight(0.2);

  beginShape();
  vertex(-p3_tileWidth(), 0 + sideWave);
  vertex(0, p3_tileHeight() + upperWave);
  vertex(p3_tileWidth(), 0 + sideWave);
  vertex(0, -p3_tileHeight() + upperWave);
  endShape(CLOSE);

  noStroke();
}


function sinAt(x, freq = 0.3, scale = 4, timeScale = 0.001, phaseOffset = 0) {
  let t = (x * freq + millis() * timeScale) % 1.0;
  return (abs(t - 0.5) * 4 - 1) * scale;
}

function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0, 255, 0, 128);
  beginShape();
  vertex(-p3_tileWidth(), 0);
  vertex(0, p3_tileHeight());
  vertex(p3_tileWidth(), 0);
  vertex(0, -p3_tileHeight());
  endShape(CLOSE);
  noStroke();
  fill(0);
  text(`tile ${i},${j}`, 0, 0);
}

function p3_drawAfter() {}

