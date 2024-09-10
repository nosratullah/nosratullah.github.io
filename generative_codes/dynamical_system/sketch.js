let dt = 0.01;
let trajectory = [];
let restartButton;
let equationP, eigenvaluesP;

function setup() {
  createCanvas(1000, 600);
  
  // Initial state
  x = 1;
  y = 0;

  // Display the equation
  equationP = createP('').position(10, height - 180);

  // Display the eigenvalues
  eigenvaluesP = createP('').position(10, height - 100);

  // Create sliders for matrix A parameters
  createP('a11:').position(10, height + 10);
  a11Slider = createSlider(-2, 2, -1, 0.01);
  a11Slider.position(50, height + 10);

  createP('a12:').position(10, height + 40);
  a12Slider = createSlider(-2, 2, -1, 0.01);
  a12Slider.position(50, height + 40);

  createP('a21:').position(10, height + 70);
  a21Slider = createSlider(-2, 2, 2, 0.01);
  a21Slider.position(50, height + 70);

  createP('a22:').position(10, height + 100);
  a22Slider = createSlider(-2, 2, -1, 0.01);
  a22Slider.position(50, height + 100);

  // Create restart button
  // restartButton = createButton('Restart');
  // restartButton.position(10, height + 150);
  // restartButton.mousePressed(restartSystem);
}

function draw() {
  background(30); // Dark background

  // Get matrix A parameters from sliders
  let a11 = a11Slider.value();
  let a12 = a12Slider.value();
  let a21 = a21Slider.value();
  let a22 = a22Slider.value();

  // Update the equation display
  equationP.html(`Equation: <br> dx/dt = ${a11.toFixed(1)} * x + ${a12.toFixed(1)} * y <br> dy/dt = ${a21.toFixed(1)} * x + ${a22.toFixed(1)} * y`);

  // Calculate eigenvalues
  let trace = a11 + a22;
  let determinant = a11 * a22 - a12 * a21;
  let discriminant = trace * trace - 4 * determinant;
  let eigenvalue1, eigenvalue2;

  if (discriminant >= 0) {
    eigenvalue1 = ((trace + sqrt(discriminant)) / 2).toFixed(2);
    eigenvalue2 = ((trace - sqrt(discriminant)) / 2).toFixed(2);
  } else {
    eigenvalue1 = `${(trace / 2).toFixed(2)} + ${(sqrt(-discriminant) / 2).toFixed(2)}i`;
    eigenvalue2 = `${(trace / 2).toFixed(2)} - ${(sqrt(-discriminant) / 2).toFixed(2)}i`;
  }

  // Update the eigenvalues display
  eigenvaluesP.html(`Eigenvalues: <br> λ1 = ${eigenvalue1} <br> λ2 = ${eigenvalue2}`);

  // Update the system state using Euler's method
  let dx = a11 * x + a12 * y;
  let dy = a21 * x + a22 * y;
  x += dx * dt;
  y += dy * dt;

  // Store the trajectory
  trajectory.push([x, y]);

  // Draw the phase diagram
  translate(width / 2, height / 2);
  stroke(200);
  fill(200);
  for (let i = 0; i < trajectory.length; i++) {
    ellipse(trajectory[i][0] * 100, trajectory[i][1] * 100, 2, 2);
  }

  // Draw the nullclines
  stroke(255, 0, 0);
  line(-width / 2, -a11 / a12 * (-width / 2), width / 2, -a11 / a12 * (width / 2)); // dx/dt = 0
  stroke(0, 0, 255);
  line(-width / 2, -a21 / a22 * (-width / 2), width / 2, -a21 / a22 * (width / 2)); // dy/dt = 0

  // Draw the current state
  fill(255);
  ellipse(x * 100, y * 100, 10, 10);

  // Draw the vector field
  drawVectorField(a11, a12, a21, a22);
}

function restartSystem() {
  // Reset the state and clear the trajectory
  x = 1;
  y = 0;
  trajectory = [];
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
  // Convert mouse coordinates to the phase diagram coordinates
  let mouseXTransformed = (mouseX - width / 2) / 100;
  let mouseYTransformed = (mouseY - height / 2) / 100;

  // Set the initial state to the clicked position
  x = mouseXTransformed;
  y = mouseYTransformed;

  // Clear the trajectory
  trajectory = [];
}