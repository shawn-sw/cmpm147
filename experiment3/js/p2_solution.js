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

  let k = floor(random(0, numRows / 2));
  let l = floor(random(0, numCols / 2));
  let m = floor(random(k + 1, numRows / 2));
  let n = floor(random(l + 1, numCols / 2));
  for (let x = k; x < m; x++) {
    for (let y = l; y < n; y++) {
      grid[x][y] = "?";
    }
  }

  let k2 = floor(random(k + 1, numRows));
  let l2 = floor(random(l + 1, numCols));
  let m2 = floor(random(k2 + 1, numRows));
  let n2 = floor(random(l2 + 1, numCols));
  for (let x = k2; x < m2; x++) {
    for (let y = l2; y < n2; y++) {
      grid[x][y] = ":";
    }
  }

  for (let x = m; x <= k2; x++) {
    grid[x][n] = "|";
  }
  for (let y = l2 - 1; y >= n; y--) {
    grid[k2][y] = "_";
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
        placeTile(i, j, floor(random(0, (random()+(millis()/4000/random()))%3)), 13);      
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

      if (cell === '.') {
        placeTile(i, j, floor(random(22, 24)), 21);
      } else if (cell === '?') {
        placeTile(i, j, 11, floor(random(11, 24)));
        if (random() < 0.05) {
          placeTile(i, j, 3, 30);
        }
        drawContext(grid, i, j, '?', 11, 21);
      } else if (cell === ':') {
        placeTile(i, j, 1, floor(random(23, 24)));
        if (random() < 0.07) {
          placeTile(i, j, 3, 28);
        }
        drawContext(grid, i, j, ':', 2, 21);
      } else if (cell === '|' || cell === '_') {
        placeTile(i, j, 6, 27);
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