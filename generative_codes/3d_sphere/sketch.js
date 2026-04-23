function setup() {
  let cnv = createCanvas(720, 520, WEBGL);
  cnv.parent('canvas-container');

  [['radius-slider', 'radius-val'], ['ring-slider', 'ring-val'],
   ['step-slider', 'step-val'], ['space-slider', 'space-val']].forEach(([id, vid]) => {
    const el = document.getElementById(id);
    const vl = document.getElementById(vid);
    el.addEventListener('input', () => vl.textContent = el.value);
  });
}

function draw() {
  let theme = document.documentElement.getAttribute('data-theme') || 'light';
  let bgColor = theme === 'dark' ? 17 : 255;
  let bgAlpha = theme === 'dark' ? 20 : 30;

  background(bgColor, bgAlpha);
  ambientLight(100, 100, 100);
  pointLight(250, 250, 250, 100, 100, 0);
  pointLight(250, 250, 250, -100, -100, 0);

  const radius = int(document.getElementById('radius-slider').value);
  const big_radius = int(document.getElementById('ring-slider').value);
  const step = int(document.getElementById('step-slider').value);
  const space = int(document.getElementById('space-slider').value);

  for (let i = -step + 1; i < step; i++) {
    for (let j = -step + 1; j < step; j++) {
      push();
      translate(i * (radius * 2 + space), j * (radius * 2 + space), 0);
      rotateY(frameCount * 0.01);
      rotateX(frameCount * 0.01);
      noStroke();
      ambientMaterial(100, 250, 250);
      sphere(radius);

      for (let k = -10; k < 10; k++) {
        let angle = radians(45);
        let m = noise(frameCount * 0.01);
        let n = sin(frameCount * 0.01);
        let n_maped = map(n, -1, 1, 0, 1);
        rotateX(angle * n_maped);
        rotateZ(angle * m);
        noFill();
        stroke(theme === 'light' ? 17 : 255);
        strokeWeight(0.2);
        circle(0, 0, big_radius);
      }
      pop();
    }
  }
}
