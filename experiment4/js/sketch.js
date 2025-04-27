// sketch.js - Night Scene with OOP
// Author: Your Name
// Date:

const firstColor = "#0b0f23";
const sectionColor = "#141b35";
const thirdColor = "#2a2f3c";
const forthColor = "#0b0f23";
const starColor = "#ffffcc";

let canvasContainer;
let centerHorz, centerVert;

let nightScene;

function setup() {
  canvasContainer = $("#canvas-container");
  let canvas = createCanvas(canvasContainer.width(), canvasContainer.height());
  canvas.parent("canvas-container");

  // 创建夜景实例
  nightScene = new NightScene();

  $(window).resize(function() {
    resizeScreen();
  });
  resizeScreen();

  // 创建按钮
  const btn = select("#reimagine");
  btn.mousePressed(() => {
    nightScene.seed += 1;
  });
}

function draw() {
  nightScene.display();
}

function resizeScreen() {
  centerHorz = canvasContainer.width() / 2;
  centerVert = canvasContainer.height() / 2;
  resizeCanvas(canvasContainer.width(), canvasContainer.height());
}

//----------------------------------
// NightScene 类
class NightScene {
  constructor() {
    this.seed = 245;
  }

  display() {
    randomSeed(this.seed);
    background(100);
    noStroke();

    this.drawVerticalGradient(0, 100, firstColor, sectionColor);
    this.drawVerticalGradient(100, 200, sectionColor, thirdColor);
    this.drawVerticalGradient(200, 300, thirdColor, thirdColor);
    this.drawVerticalGradient(300, 350, thirdColor, forthColor);
    this.drawVerticalGradient(350, 400, forthColor, forthColor);

    const stars = 50 * random(0.5, 1);
    const scrub = mouseX / width;

    for (let i = 0; i < stars; i++) {
      let z = random(2, 3);
      let x = width * ((random() + (scrub / 50 + millis() / 20000.0) / z) % 1);
      let s = width / 50 / z;
      let y = random(height / 20, height / 2 - 30);
      let alpha = map(sin(millis() / 1000 + i), -1, 1, 150, 255);
      fill(starColor + hex(floor(alpha), 2));
      this.drawStar(x, y, s / 2, s / 4, 5);
    }

    for (let i = 0; i < 5; i++) {
      let z = random(1.5, 3);
      let x = width * (1 - ((random() + (scrub / 50 + millis() * 0.00005) / z) % 1));
      let s = width / 6 / z;
      let y = random(200, 300);
      let alpha = map(sin(millis() / 1500 + i), -1, 1, 100, 180);
      fill(255, 255, 255, alpha);
      this.drawCloud(x, y, s);
    }

    const moonPhase = this.randomMoonPhase();
    let moonX = random(30, canvasContainer.width()-30);
    let moonY = random(130, 170);
    let moonR = 30;

    this.drawMoon(moonX, moonY, moonR, moonPhase);
    this.drawMoonReflection(moonX, moonR, moonR);
  }

  drawVerticalGradient(y1, y2, c1, c2) {
    noFill();
    for (let y = y1; y <= y2; y++) {
      let amt = map(y, y1, y2, 0, 1);
      let c = lerpColor(color(c1), color(c2), amt);
      stroke(c);
      line(0, y, width, y);
    }
  }

  drawStar(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius1;
      let sy = y + sin(a) * radius1;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius2;
      sy = y + sin(a + halfAngle) * radius2;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }

  drawCloud(x, y, size = 100) {
    noStroke();
    fill("#444955");
    let r = size * 0.3;
    ellipse(x, y, r * 2);
    ellipse(x - r, y, r * 1.5);
    ellipse(x + r, y, r * 1.5);
    ellipse(x - r * 0.7, y - r * 0.5, r * 1.2);
    ellipse(x + r * 0.7, y - r * 0.5, r * 1.2);
  }

  drawMoon(x, y, r, phase) {
    fill("#fff7cc");
    switch (phase) {
      case "full":
        ellipse(x, y, r * 2);
        break;
      case "new":
        break;
      case "first-quarter":
        arc(x, y, r * 2, r * 2, -HALF_PI, HALF_PI, PIE);
        break;
      case "third-quarter":
        arc(x, y, r * 2, r * 2, HALF_PI, -HALF_PI, PIE);
        break;
      case "waxing-crescent":
        this.drawMoonArc(x, y, r, 0.3, true);
        break;
      case "waning-crescent":
        this.drawMoonArc(x, y, r, 0.3, false);
        break;
      case "waxing-gibbous":
        this.drawMoonArc(x, y, r, 0.95, true);
        break;
      case "waning-gibbous":
        this.drawMoonArc(x, y, r, 0.95, false);
        break;
    }
  }

  drawMoonArc(x, y, r, innerRatio, rightSide = true) {
    beginShape();
    for (let a = -HALF_PI; a <= HALF_PI; a += 0.05) {
      let px = x + (rightSide ? cos(a) : -cos(a)) * r;
      let py = y + sin(a) * r;
      vertex(px, py);
    }
    for (let a = HALF_PI; a >= -HALF_PI; a -= 0.05) {
      let px = x + (rightSide ? cos(a) : -cos(a)) * r * innerRatio;
      let py = y + sin(a) * r;
      vertex(px, py);
    }
    endShape(CLOSE);
  }

  drawMoonReflection(x, y, r) {
    noStroke();
    let glowCount = 10;
    for (let i = 0; i < glowCount; i++) {
      let alpha = map(i, 0, glowCount, 60, 0);
      let ry = r * 0.5 + i * 4;
      fill(255, 245, 200, alpha);
      ellipse(x, 320 + i * 2, r * 6.6, ry);
    }
  }

  randomMoonPhase() {
    const phases = [
      "new", "new",
      "first-quarter", "third-quarter",
      "full", "full",
      "waxing-crescent", "waxing-crescent",
      "waxing-gibbous", "waxing-gibbous", "waxing-gibbous",
      "waning-gibbous", "waning-gibbous", "waning-gibbous",
      "waning-crescent", "waning-crescent"
    ];
    return random(phases);
  }
}
