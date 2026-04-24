function setup() {
  let cnv = createCanvas(720, 520, WEBGL);
  cnv.parent('canvas-container');

  [['small-slider', 'small-val'], ['big-slider', 'big-val'],
   ['step-slider', 'step-val']].forEach(([id, vid]) => {
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

  const smallCube = int(document.getElementById('small-slider').value);
  const bigCube = int(document.getElementById('big-slider').value);
  const step = int(document.getElementById('step-slider').value);

  for (let i = -step; i < step; i++) {
    for (let j = -step; j < step; j++) {
      push();
      translate(i * (smallCube + bigCube + 10), j * (smallCube + bigCube + 10), 0);
      let n = noise(i * 0.1, j * 0.1, frameCount * 0.02);
      if (n > 0.0) {
        rotateX(n * TWO_PI);
        rotateZ(n * TWO_PI);
      }
      fill(theme === 'dark' ? 240 : 20);
      stroke(theme === 'dark' ? 255 : 0);
      box(smallCube);
      noFill();
      let transparent = map(n, 0, 1, 100, 255);
      stroke(100, 100, 100, transparent);
      box(bigCube);
      pop();
    }
  }
}
