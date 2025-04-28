"use strict";

/* global XXH */
/* exported --
    p3_preload
    p3_setup
    p3_worldKeyChanged
    p3_tileWidth
    p3_tileHeight
    p3_tileClicked
    p3_drawBefore
    p3_drawTile
    p3_drawSelectedTile
    p3_drawAfter
*/

let worldSeed;
let playerX = 0;
let playerY = 0;
let goalX, goalY;
let tw, th;
let score = 0; 
let lastMoveTime = 0;
let moveDelay = 200; 

function p3_preload() {}

function p3_setup() {
  tw = p3_tileWidth();
  th = p3_tileHeight();
}

function p3_worldKeyChanged(key) {
  worldSeed = XXH.h32(key, 0);
  noiseSeed(worldSeed);
  randomSeed(worldSeed);
  playerX = 0;
  playerY = 0;
  score = 0; 
  relocateGoal();
}

function relocateGoal() {
  do {
    goalX = playerX + Math.floor(random(-10, 11));
    goalY = playerY + Math.floor(random(-10, 11));
  } while (
    (goalX === playerX && goalY === playerY) || 
    isMountain(goalX, goalY) 
  );
}

function p3_tileWidth() {
  return 32;
}

function p3_tileHeight() {
  return 16;
}

function isMountain(i, j) {
  return (XXH.h32("terrain:" + [i, j], worldSeed) % 10) === 0;
}

function p3_tileClicked(i, j) {}

function p3_drawBefore() {}

function p3_drawTile(i, j) {
  noStroke();
  push();

  if (i === playerX && j === playerY) {
    fill(0, 100, 255); // 玩家
    rectMode(CENTER);
    rect(0, 0, tw / 2, th);
  } else if (i === goalX && j === goalY) {
    fill(173, 216, 230); // 目标
    beginShape();
    vertex(-tw, 0);
    vertex(0, th);
    vertex(tw, 0);
    vertex(0, -th);
    endShape(CLOSE);
  } else if (isMountain(i, j)) {
    fill(0); // 山脉
    beginShape();
    vertex(-tw, 0);
    vertex(0, th);
    vertex(tw, 0);
    vertex(0, -th);
    endShape(CLOSE);
  } else {
    fill(0, 180 + noise(i * 0.1, j * 0.1) * 75, 0); // 更丰富的绿色
    beginShape();
    vertex(-tw, 0);
    vertex(0, th);
    vertex(tw, 0);
    vertex(0, -th);
    endShape(CLOSE);
  }

  pop();
}

function p3_drawSelectedTile(i, j) {
  noFill();
  stroke(0, 255, 0, 128);
  beginShape();
  vertex(-tw, 0);
  vertex(0, th);
  vertex(tw, 0);
  vertex(0, -th);
  endShape(CLOSE);

  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(10);
  text(`(${i},${j})`, 0, 0);
}

function p3_drawAfter() {
  let now = millis();
  let moveX = 0;
  let moveY = 0;

  if (keyIsDown(87)) moveY--; // W 上
  if (keyIsDown(83)) moveY++; // S 下
  if (keyIsDown(65)) moveX++; // A 左
  if (keyIsDown(68)) moveX--; // D 右

  if (now - lastMoveTime > moveDelay) {
    if ((moveX !== 0 || moveY !== 0) && !isMountain(playerX + moveX, playerY + moveY)) {
      playerX += moveX;
      playerY += moveY;
      lastMoveTime = now;
    }
  }

  if (playerX === goalX && playerY === goalY) {
    score++; 
    relocateGoal();
  }

  const dist = findGoalDistance();
  if (typeof updateGameInfo === 'function') {
    updateGameInfo(dist, score);
  }
}

function findGoalDistance() {
  let dx = goalX - playerX;
  let dy = goalY - playerY;
  return Math.sqrt(dx * dx + dy * dy);
}
