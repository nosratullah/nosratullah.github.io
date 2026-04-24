let dt = 0.01;
let trajectory = [];
let x, y;

function updateEquation() {
  if (!window._mjxReady) return;

  const a11 = parseFloat(document.getElementById('a11-slider').value);
  const a12 = parseFloat(document.getElementById('a12-slider').value);
  const a21 = parseFloat(document.getElementById('a21-slider').value);
  const a22 = parseFloat(document.getElementById('a22-slider').value);

  const fmt = v => (v >= 0 ? '\\phantom{-}' : '') + v.toFixed(2);

  const eqEl = document.getElementById('equation-display');
  eqEl.innerHTML =
    `\\[\\begin{pmatrix} \\dot{x}_t \\\\ \\dot{y}_t \\end{pmatrix} = ` +
    `\\begin{pmatrix} ${fmt(a11)} & ${fmt(a12)} \\\\ ${fmt(a21)} & ${fmt(a22)} \\end{pmatrix} ` +
    `\\begin{pmatrix} x_t \\\\ y_t \\end{pmatrix}\\]`;

  // Eigenvalues
  const trace = a11 + a22;
  const det   = a11 * a22 - a12 * a21;
  const disc  = trace * trace - 4 * det;
  let evLatex;
  if (disc >= 0) {
    const ev1 = ((trace + Math.sqrt(disc)) / 2).toFixed(2);
    const ev2 = ((trace - Math.sqrt(disc)) / 2).toFixed(2);
    evLatex = `\\lambda_1 = ${ev1}, \\quad \\lambda_2 = ${ev2}`;
  } else {
    const re = (trace / 2).toFixed(2);
    const im = (Math.sqrt(-disc) / 2).toFixed(2);
    evLatex = `\\lambda_{1,2} = ${re} \\pm ${im}\\,i`;
  }
  const evEl = document.getElementById('eigenvalues-display');
  evEl.innerHTML = `\\[${evLatex}\\]`;

  MathJax.typesetClear([eqEl, evEl]);
  MathJax.typesetPromise([eqEl, evEl]);
}

function setup() {
  let cnv = createCanvas(700, 520);
  cnv.parent('canvas-container');

  x = 1;
  y = 0;

  [['a11-slider', 'a11-val'], ['a12-slider', 'a12-val'],
   ['a21-slider', 'a21-val'], ['a22-slider', 'a22-val']].forEach(([id, vid]) => {
    const el = document.getElementById(id);
    const vl = document.getElementById(vid);
    el.addEventListener('input', () => {
      vl.textContent = parseFloat(el.value).toFixed(2);
      x = 1; y = 0; trajectory = [];
      updateEquation();
    });
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    x = 1; y = 0; trajectory = [];
  });
}

function draw() {
  let theme = document.documentElement.getAttribute('data-theme') || 'light';
  let bgColor = theme === 'dark' ? 17 : 255;
  let bgAlpha = theme === 'dark' ? 20 : 30;
  background(bgColor, bgAlpha);

  let a11 = parseFloat(document.getElementById('a11-slider').value);
  let a12 = parseFloat(document.getElementById('a12-slider').value);
  let a21 = parseFloat(document.getElementById('a21-slider').value);
  let a22 = parseFloat(document.getElementById('a22-slider').value);

  // Euler step
  let dx = a11 * x + a12 * y;
  let dy = a21 * x + a22 * y;
  x += dx * dt;
  y += dy * dt;
  trajectory.push([x, y]);

  translate(width / 2, height / 2);

  let dotColor = theme === 'dark' ? 200 : 50;
  stroke(dotColor);
  fill(dotColor);
  for (let i = 0; i < trajectory.length; i++) {
    ellipse(trajectory[i][0] * 100, trajectory[i][1] * 100, 2, 2);
  }

  // Nullclines
  strokeWeight(4);
  stroke(128,24,24);
  line(-width / 2, -a11 / a12 * (-width / 2), width / 2, -a11 / a12 * (width / 2));
  strokeWeight(4);
  // stroke(0, 0, 255);
  stroke(200,8,21);
  line(-width / 2, -a21 / a22 * (-width / 2), width / 2, -a21 / a22 * (width / 2));

  let stateColor = theme === 'dark' ? 255 : 17;
  fill(stateColor);
  stroke(stateColor);
  ellipse(x * 100, y * 100, 10, 10);

  drawVectorField(a11, a12, a21, a22);
}

function drawVectorField(a11, a12, a21, a22) {
  stroke(150);
  for (let i = -width / 2; i < width / 2; i += 20) {
    for (let j = -height / 2; j < height / 2; j += 20) {
      let vx = a11 * (i / 100) + a12 * (j / 100);
      let vy = a21 * (i / 100) + a22 * (j / 100);
      let len = sqrt(vx * vx + vy * vy);
      vx = vx / len * 10;
      vy = vy / len * 10;
      stroke(1);
      line(i, j, i + vx, j + vy);
      push();
      translate(i + vx, j + vy);
      rotate(atan2(vy, vx));
      line(0, 0, -5, -2);
      line(0, 0, -5, 2);
      pop();
    }
  }
}

function mousePressed() {
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  x = (mouseX - width / 2) / 100;
  y = (mouseY - height / 2) / 100;
  trajectory = [];
}
