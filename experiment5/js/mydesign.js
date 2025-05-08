/* exported p4_inspirations, p4_initialize, p4_render, p4_mutate */


function getInspirations() {
    return [
      {
        name: "paradise", 
        assetUrl: "https://cdn.glitch.global/070b0b20-b1b6-4fbb-9fd1-3ff45914f282/paradise.png?v=1746726286283",
      },
      {
        name: "lake", 
        assetUrl: "https://cdn.glitch.global/070b0b20-b1b6-4fbb-9fd1-3ff45914f282/lake.png?v=1746726295225",
      },
      {
        name: "hotel", 
        assetUrl: "https://cdn.glitch.global/070b0b20-b1b6-4fbb-9fd1-3ff45914f282/hotel.png?v=1746726312935",
      },
      {
        name: "roots", 
        assetUrl: "https://cdn.glitch.global/070b0b20-b1b6-4fbb-9fd1-3ff45914f282/roots.png?v=1746726290817",
      },
    ];
  }
  
  function initDesign(inspiration) {
    resizeCanvas(inspiration.image.width / 4, inspiration.image.height / 4);
    let design = {
      bg: 128,
      shapeType: shapeDropdown.value,
      fg: Array(1000).fill().map(() => {
        let x = random(width);
        let y = random(height);
        let col = inspiration.image.get(x * 4, y * 4);
        return {
          x: x,
          y: y,
          w: random(width / 8),
          h: random(height / 8),
          fill: color(col[0], col[1], col[2])
        };
      })
    };
    return design;
  }
  
  function renderDesign(design, inspiration) {
    background(design.bg);
    noStroke();
    for (let box of design.fg) {
      fill(box.fill);
      if (design.shapeType === "rectangles") {
        rect(box.x, box.y, box.w, box.h);
      } else if (design.shapeType === "ellipse") {
        ellipse(box.x, box.y, box.w, box.h);
      } else if (design.shapeType === "triangle") {
        triangle(box.x, box.y, box.x + box.w, box.y, box.x, box.y + box.h);
      }
    }
  }
  
  function mutateDesign(design, inspiration, rate) {
    design.bg = mut(design.bg, 0, 255, rate);
    design.fg.forEach(box => {
      box.x = mut(box.x, 0, width, rate);
      box.y = mut(box.y, 0, height, rate);
      box.w = mut(box.w, 0, width / 8, rate);
      box.h = mut(box.h, 0, height / 8, rate);
      let col = inspiration.image.get(box.x * 4, box.y * 4);
      box.fill = color(col[0], col[1], col[2]);
    });
  }
  
  function mut(num, min, max, rate) {
    return constrain(randomGaussian(num, (rate * (max - min)) / 10), min, max);
  }