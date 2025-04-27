/* exported generateGrid, drawGrid */
/* global placeTile */
let useAlternate = false;

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("drawButton").addEventListener("click", () => {
    useAlternate = !useAlternate;
    regenerateGrid();
  });
});

function generateGrid(numCols, numRows) {
  if (useAlternate) {
    return generateAlternateGrid(numCols, numRows);
  } else {
    let grid = [];
    for (let i = 0; i < numRows; i++) {
      let row = [];
      for (let j = 0; j < numCols; j++) {
        row.push(noise(i / 10, j / 10) > 0.5 ? '.' : '_');
      }
      grid.push(row);
    }
    return grid;
  }
}

function generateAlternateGrid(numCols, numRows) {
  let grid = [];
  for (let i = 0; i < numRows; i++) {
    let row = [];
    for (let j = 0; j < numCols; j++) {
      row.push(".");
    }
    grid.push(row);
  }

  let roomCenters = [];
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      if (noise(i, j) * 10 > 8) {
        roomCenters.push([i, j]);
      }
    }
  }

  let prevRoom = undefined;
  while (roomCenters.length > 0) {
    const currRoom = roomCenters.pop();
    const roomWidth = floor(random(4, 8));
    const roomHeight = floor(random(4, 7));
    const startI = currRoom[0] - floor(roomHeight / 2); // currRoom[0] 是行i
    const startJ = currRoom[1] - floor(roomWidth / 2);  // currRoom[1] 是列j

    // 画房间
    for (let i = startI; i < startI + roomHeight; i++) {
      for (let j = startJ; j < startJ + roomWidth; j++) {
        if (gridCheck(grid, i, j, ".")) {
          grid[i][j] = ":"; // 房间地板
        }
      }
    }

    if (prevRoom !== undefined) {
      const [prevI, prevJ] = prevRoom;
      const [currI, currJ] = currRoom;

      if (random() < 0.5) {
        // 先水平走廊，再垂直走廊
        for (let j = min(prevJ, currJ); j <= max(prevJ, currJ); j++) {
          if (gridCheck(grid, prevI, j, ".")) {
            grid[prevI][j] = "|";
          }
        }
        for (let i = min(prevI, currI); i <= max(prevI, currI); i++) {
          if (gridCheck(grid, i, currJ, ".")) {
            grid[i][currJ] = "|";
          }
        }
      } else {
        // 先垂直走廊，再水平走廊
        for (let i = min(prevI, currI); i <= max(prevI, currI); i++) {
          if (gridCheck(grid, i, prevJ, ".")) {
            grid[i][prevJ] = "|";
          }
        }
        for (let j = min(prevJ, currJ); j <= max(prevJ, currJ); j++) {
          if (gridCheck(grid, currI, j, ".")) {
            grid[currI][j] = "|";
          }
        }
      }
    }

    prevRoom = currRoom;
  }

  // 随机放置宝箱
  let chestNotPlaced = true;
  let tries = 0;
  while (chestNotPlaced && tries < 500) {
    const j = floor(random(0, numCols));
    const i = floor(random(0, numRows));
    if (gridCheck(grid, i, j, ":") && gridCode(grid, i, j, ":") == 15) {
      grid[i][j] = "?"; // 宝箱
      chestNotPlaced = false;
    }
    tries++;
  }

  return grid;
}



function drawGrid(grid) {
  if (useAlternate) {
    drawAlternateGrid(grid);
  } else {
    drawDefaultGrid(grid);
  }
}

function drawDefaultGrid(grid) {
  background(128);
  for(let i = 0; i < grid.length; i++) {
    for(let j = 0; j < grid[i].length; j++) {
      if (grid[i][j] == '.') {
        placeTile(i, j, floor(random(0, (random()+(millis()/5000/random()))%4)), 13);      
      }
      if (grid[i][j] == '_') {
        placeTile(i, j, floor(random(0, 3)), 6);
        if (random(0,20) < 1) {
          placeTile(i, j, 26, floor(random(0,3)));
        }
        if (random(0,10) < 3) {
          placeTile(i, j, 14, floor(random(0,3)));
        }
        drawCorners(grid, i, j, "_", 0, 6);
      } 
      else {
        drawContext(grid, i, j, "_", 0, 6);
      }
    }
  }
}

function drawAlternateGrid(grid) {
  background(128);

  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      const cell = grid[i][j];

      if (cell === ".") {
        // 石头：动态闪烁
        placeTile(j, i, floor(random(9, 12)), 18); 
      } 
      else if (cell === ":") {
        // 房间地板
        placeTile(j, i, floor(random(1, 3)), 23); 
      } 
      else if (cell === "|") {
        // 走廊
        placeTile(j, i, 22, 21); 
      } 
      else if (cell === "?") {
        // 宝箱
        placeTile(j, i, floor(random(1, 4)), floor(random(21, 24))); 
        placeTile(j, i, 4, 28);
      }
    }
  }
}


function gridCheck(grid, i, j, target) {
  if (i >= 0 && i < grid.length && j >= 0 && j < grid[0].length) {
    return grid[i][j] == target;
  } else {
    return false;
  }
}

function gridCode(grid, i, j, target) {
  let x = 0;
  if (gridCheck(grid, i - 1, j, target)) { //north
    x += 1<<0
  }
  if (gridCheck(grid, i + 1, j, target)) { //south
    x += 1<<1
  }
  if (gridCheck(grid, i, j + 1, target)) { //east
    x += 1<<2
  }
  if (gridCheck(grid, i, j - 1, target)) { //west
    x += 1<<3
  }
  return x;
}

function drawCorners(grid, i, j, target, ti, tj) {
  let code = gridCode(grid, i, j, target);
  if (code == 9) {
    placeTile((i + 1), (j + 1), ti + 13, tj + 1); //N + W
  }
  if (code == 5) {
    placeTile((i + 1), (j - 1), ti + 12, tj + 1); //N + S
  }
  if (code == 6) {
    placeTile((i - 1), (j - 1), ti + 12, tj + 0); //S + E
  }
  if (code == 10) {
    placeTile((i - 1), (j + 1), ti + 13, tj + 0); //E + N
  }
}

function drawContext(grid, i, j, target, ti, tj) {
  let code = gridCode(grid, i, j, target);
  const [tiOffset, tjOffset] = lookup[code]; 
  placeTile(i, j, ti + tiOffset, tj + tjOffset);
}

const lookup = [
  [10, 1], // 0000: 无连接
  [10, 0], // 0001: 北
  [10, 2], // 0010: 南
  [10, 1], // 0011: 南北
  [11, 1], // 0100: 东
  [11, 0], // 0101: 北东
  [11, 2], // 0110: 南东
  [10, 1], // 0111: 东南北
  [9, 1],  // 1000: 西
  [9, 0],  // 1001: 北西
  [9, 2],  // 1010: 南西
  [10, 1], // 1011: 南北西
  [10, 1], // 1100: 西东
  [10, 0], // 1101: 西东北
  [10, 2], // 1110: 西东南
  [10, 1], // 1111: 四连通中心
];