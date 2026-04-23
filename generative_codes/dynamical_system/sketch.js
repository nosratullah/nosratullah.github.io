let dt = 0.01;
let trajectory = [];
let x, y;

function setup() {
  let cnv = createCanvas(700, 520);
  cnv.parent('canvas-container');

  x = 1;
  y = 0;

  // Wire slider value displays and reset trajectory on change
  [['a11-slider', 'a11-val'], ['a12-slider', 'a12-val'],
   ['a21-slider', 'a21-val'], ['a22-slider', 'a22-val']].forEach(([id, vid]) => {
    const el = document.getElementById(id);
    const vl = document.getElementById(vid);
    el.addEventListener('input', () => {
      vl.textContent = parseFloat(el.value).toFixed(2);
      x = 1; y = 0; trajectory = [];
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

  // Update equation display
  document.getElementById('equation-display').innerHTML =
    `dx/dt = ${a11.toFixed(2)}x + ${a12.toFixed(2)}y<br>` +
    `dy/dt = ${a21.toFixed(2)}x + ${a22.toFixed(2)}y`;

  // Calculate and display eigenvalues
  let trace = a11 + a22;
  let det = a11 * a22 - a12 * a21;
  let disc = trace * trace - 4 * det;
  if (disc >= 0) {
    let ev1 = ((trace + sqrt(disc)) / 2).toFixed(2);
    let ev2 = ((trace - sqrt(disc)) / 2).toFixed(2);
    document.getElementById('eigenvalues-display').innerHTML = `λ₁ = ${ev1}<br>λ₂ = ${ev2}`;
  } else {
    let re = (trace / 2).toFixed(2);
    let im = (sqrt(-disc) / 2).toFixed(2);
    document.getElementById('eigenvalues-display').innerHTML =
      `λ₁ = ${re} + ${im}i<br>λ₂ = ${re} − ${im}i`;
  }

  // Euler step
  let dx = a11 * x + a12 * y;
  let dy = a21 * x + a22 * y;
  x += dx * dt;
  y += dy * dt;
  trajectory.push([x, y]);

  translate(width / 2, height / 2);

  // Trajectory dots
  let dotColor = theme === 'dark' ? 200 : 50;
  stroke(dotColor);
  fill(dotColor);
  for (let i = 0; i < trajectory.length; i++) {
    ellipse(trajectory[i][0] * 100, trajectory[i][1] * 100, 2, 2);
  }

  // Nullclines
  stroke(255, 0, 0);
  line(-width / 2, -a11 / a12 * (-width / 2), width / 2, -a11 / a12 * (width / 2));
  stroke(0, 0, 255);
  line(-width / 2, -a21 / a22 * (-width / 2), width / 2, -a21 / a22 * (width / 2));

  // Current state dot
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
  // Only respond to clicks within the canvas
  if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) return;
  x = (mouseX - width / 2) / 100;
  y = (mouseY - height / 2) / 100;
  trajectory = [];
}
