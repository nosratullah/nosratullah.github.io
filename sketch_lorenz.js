var trajectories = [];
var maxTrajectories = 100; // Limit for performance
var container;
var canvas;

// Lorenz attractor parameters
var sigma = 10;
var rho = 28;
var beta = 8/3;
var dt = 0.005; // Time step

// Color palette - vibrant colors
var colorPalette = [
  [255, 20, 147],   // DeepPink
  [0, 255, 255],    // Cyan
  [255, 165, 0],    // Orange
  [138, 43, 226],   // BlueViolet
  [255, 69, 0],     // RedOrange
  [50, 205, 50],    // LimeGreen
  [255, 215, 0],    // Gold
  [255, 20, 147],   // DeepPink
  [0, 191, 255],    // DeepSkyBlue
  [255, 105, 180],  // HotPink
  [154, 205, 50],   // YellowGreen (keeping your accent)
  [255, 0, 255]     // Magenta
];

function windowResized() {
  container = document.getElementById('sketch-container');
  if (container) {
    // Calculate the available space considering the layout
    let availableWidth = container.offsetWidth;
    let availableHeight = window.innerHeight - 60; // Subtract header height (60px)
    
    resizeCanvas(availableWidth, availableHeight);
  }
}

function setup() {
  container = document.getElementById('sketch-container');
  if (container) {
    // Calculate the available space considering the layout
    let availableWidth = container.offsetWidth;
    let availableHeight = window.innerHeight - 60; // Subtract header height (60px)
    
    canvas = createCanvas(availableWidth, availableHeight, WEBGL);
    canvas.parent('sketch-container');
  } else {
    canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  }
  
  canvas.style('z-index', '-1');
  background(0);
  
  // Initialize some trajectories with different starting points
  for (let i = 0; i < 30; i++) {
    addTrajectory();
  }
}

function draw() {
  // Check theme and set background accordingly
  let theme = document.body.getAttribute('data-theme') || 'light';
  let bgColor = theme === 'dark' ? (17, 17, 17) : (255, 255, 255); // Black for dark mode, white for light mode
  let bgAlpha = theme === 'dark' ? 20 : 30; // Slight trail effect
  
  background(bgColor, bgAlpha);
  
  // Mouse-responsive camera with aspect ratio consideration
  let mouseInfluence = 0.5;
  let cameraX = map(mouseX, 0, width, -150, 150) * mouseInfluence;
  let cameraY = map(mouseY, 0, height, -100, 100) * mouseInfluence;
  
  // Adjust camera distance based on canvas aspect ratio to maintain proper view
  let aspectRatio = width / height;
  let baseCameraDistance = 120;
  let adjustedDistance = baseCameraDistance * Math.max(1, aspectRatio * 0.8);
  
  // Better angle to see the butterfly wings - positioned to show both lobes
  camera(
    adjustedDistance + cameraX,     // X: Side view to see depth
    -80 + cameraY,                  // Y: Slightly above to see down into the wings
    80 + cameraX * 0.1,             // Z: Angled to see the butterfly structure
    0, 10, 20,                       // Look at: Slightly above center where action happens
    0, 1, 0                         // Up vector
  );
  
  // Scale down the entire scene to fit better in the view
  scale(2);
  
  // Add new trajectories occasionally
  if (trajectories.length < maxTrajectories && random(1) < 0.03) {
    addTrajectory();
  }
  
  // Update and draw trajectories
  for (let i = trajectories.length - 1; i >= 0; i--) {
    let traj = trajectories[i];
    updateLorenzTrajectory(traj);
    drawTrajectory(traj);
    
    // Remove dead trajectories
    if (traj.life <= 0) {
      trajectories.splice(i, 1);
    }
  }
  
  // Draw coordinate axes for reference (optional)
  drawAxes();
}

function addTrajectory() {
  // Start trajectories from slightly different points near the attractor
  let x = random(-5, 5) + 0.1;
  let y = random(-5, 5) + 0.1;
  let z = random(5, 35) + 0.1;
  
  let trajectory = {
    position: createVector(x, y, z),
    life: random(800, 1500), // Longer lifespan for the attractor
    maxLife: random(800, 1500),
    color: random(colorPalette),
    history: [],
    trailLength: random(80, 150) // Variable trail lengths
  };
  
  trajectories.push(trajectory);
}

function updateLorenzTrajectory(traj) {
  traj.life--;
  
  // Current position
  let x = traj.position.x;
  let y = traj.position.y;
  let z = traj.position.z;
  
  // Lorenz differential equations
  let dx = sigma * (y - x);
  let dy = x * (rho - z) - y;
  let dz = x * y - beta * z;
  
  // Update position using Euler integration
  traj.position.x += dx * dt;
  traj.position.y += dy * dt;
  traj.position.z += dz * dt;
  
  // Store history for trail (limit length for performance)
  traj.history.push(traj.position.copy());
  if (traj.history.length > traj.trailLength) {
    traj.history.shift();
  }
}

function drawTrajectory(traj) {
  let alpha = map(traj.life, 0, traj.maxLife, 0, 255);
  
  // Draw trail
  if (traj.history.length > 1) {
    for (let i = 1; i < traj.history.length; i++) {
      let segmentAlpha = alpha * (i / traj.history.length) * 0.8;
      let thickness = map(i, 0, traj.history.length, 0.2, 2);
      
      stroke(traj.color[0], traj.color[1], traj.color[2], segmentAlpha);
      strokeWeight(thickness);
      
      let prev = traj.history[i - 1];
      let curr = traj.history[i];
      line(prev.x, prev.y, prev.z, curr.x, curr.y, curr.z);
    }
  }
  
  // Draw current position as a small sphere
  push();
  translate(traj.position.x, traj.position.y, traj.position.z);
  fill(traj.color[0], traj.color[1], traj.color[2], alpha);
  noStroke();
  sphere(0.8);
  pop();
}

function drawAxes() {
  // Draw coordinate axes for reference
  let theme = document.body.getAttribute('data-theme') || 'light';
  let axisColor = theme === 'dark' ? [100, 100, 100, 100] : [150, 150, 150, 100];
  
  stroke(axisColor[0], axisColor[1], axisColor[2], axisColor[3]);
  strokeWeight(0.5);
  
  // X-axis (red) - shorter
  stroke(255, 100, 100, 100);
  line(-15, 0, 0, 15, 0, 0);
  
  // Y-axis (green) - shorter
  stroke(100, 255, 100, 100);
  line(0, -10, 0, 0, 10, 0);
  
  // Z-axis (blue) - shorter
  stroke(100, 100, 255, 100);
  line(0, 0, 0, 0, 0, 20);
}

// Add some interactivity - click to add new trajectory
function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    addTrajectory();
  }
}

// Keyboard controls for parameter adjustment
function keyPressed() {
  if (key === 'r' || key === 'R') {
    // Reset all trajectories
    trajectories = [];
    for (let i = 0; i < 30; i++) {
      addTrajectory();
    }
  }
  
  if (key === 'c' || key === 'C') {
    // Clear all trajectories
    trajectories = [];
  }
  
  // Adjust Lorenz parameters with keys
  if (key === '1') {
    sigma += 0.5;
    console.log('Sigma:', sigma);
  }
  if (key === '2') {
    sigma = Math.max(0.5, sigma - 0.5);
    console.log('Sigma:', sigma);
  }
  if (key === '3') {
    rho += 1;
    console.log('Rho:', rho);
  }
  if (key === '4') {
    rho = Math.max(1, rho - 1);
    console.log('Rho:', rho);
  }
  if (key === '5') {
    beta += 0.1;
    console.log('Beta:', beta);
  }
  if (key === '6') {
    beta = Math.max(0.1, beta - 0.1);
    console.log('Beta:', beta);
  }
}
