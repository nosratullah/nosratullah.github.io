var trajectories = [];
var maxTrajectories = 100; // Limit for performance
var container;
var canvas;

// Camera controls
var cameraDistance = 120;
var cameraAngleX = 0;
var cameraAngleY = 0;
var isDragging = false;
var lastMouseX = 0;
var lastMouseY = 0;

// Lorenz attractor parameters
var sigma = 10;
var rho = 28;
var beta = 8/3;
var dt = 0.002; // Time step

// Color palette - tighter, harmonious color range
var colorPalette = [
  [255, 100, 150],  // Warm Pink
  [255, 150, 100],  // Soft Orange
  [255, 200, 100],  // Light Orange
  [200, 255, 150],  // Light Green
  [150, 255, 200],  // Mint Green
  [100, 200, 255],  // Sky Blue
  [150, 150, 255],  // Soft Purple
  [200, 150, 255],  // Light Purple
  [255, 150, 200],  // Rose
  [154, 205, 50]    // Your signature lime green
];

function windowResized() {
  container = document.getElementById('sketch-container');
  if (container) {
    // Calculate the available space considering the layout
    let availableWidth = container.offsetWidth;
    let availableHeight = window.innerHeight - 80; // Subtract header height (60px)
    
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
  
  // Initialize camera angles for good butterfly view
  cameraAngleX = -0.5; // Slightly looking down
  cameraAngleY = 0.8;  // Angled to see both wings
  
  // Initialize some trajectories with different starting points
  for (let i = 0; i < 30; i++) {
    addTrajectory();
  }
}

function draw() {
  // Check theme and set background accordingly
  let theme = document.documentElement.getAttribute('data-theme') || 'light';
  let bgColor = theme === 'dark' ? [17, 17, 17] : [255, 255, 255]; // Black for dark mode, white for light mode
  let bgAlpha = theme === 'dark' ? 20 : 30; // Slight trail effect
  
  background(bgColor[0], bgColor[1], bgColor[2], bgAlpha);
  
  // Calculate camera position based on angles and distance
  let cameraX = cameraDistance * cos(cameraAngleY) * cos(cameraAngleX);
  let cameraY = cameraDistance * sin(cameraAngleX);
  let cameraZ = cameraDistance * sin(cameraAngleY) * cos(cameraAngleX);
  
  // Set up camera with calculated position
  camera(
    cameraX,     // X position
    cameraY,     // Y position  
    cameraZ,     // Z position
    0, 0, 100,    // Look at: Slightly above center where action happens
    0, 0, -1      // Up vector
  );
  
  // Scale down the entire scene to fit better in the view
  scale(5);
  
  // Add new trajectories occasionally
  if (trajectories.length < maxTrajectories && random(1) < 0.01) {
    addTrajectory();
  }
  
  // Update and draw trajectories
  for (let i = trajectories.length - 1; i >= 0; i--) {
    let traj = trajectories[i];
    updateLorenzTrajectory(traj);
    drawTrajectory(traj);
    
    // Remove trajectories only when they're fully faded out
    if (traj.life <= -50) { // Give extra time for smooth fade-out
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
  // Create smoother fade-out effect
  let fadeThreshold = traj.maxLife * 0.2; // Start fading in last 20% of life
  let alpha;
  let thicknessFactor = 1; // Factor to control overall thickness
  
  if (traj.life > fadeThreshold) {
    // Normal full opacity and thickness
    alpha = 255;
    thicknessFactor = 1;
  } else {
    // Smooth exponential fade-out for both alpha and thickness
    let fadeProgress = traj.life / fadeThreshold;
    alpha = 255 * pow(fadeProgress, 2); // Quadratic fade for smoother effect
    thicknessFactor = pow(fadeProgress, 1.5); // Slightly less aggressive thickness fade
  }
  
  // Draw trail
  if (traj.history.length > 1) {
    for (let i = 1; i < traj.history.length; i++) {
      let segmentProgress = i / traj.history.length;
      let segmentAlpha = alpha * segmentProgress * 0.8;
      
      // Apply thickness fade to each segment
      let baseThickness = map(i, 0, traj.history.length, 0.2, 2);
      let adjustedThickness = baseThickness * thicknessFactor;
      
      stroke(traj.color[0], traj.color[1], traj.color[2], segmentAlpha);
      strokeWeight(adjustedThickness);
      
      let prev = traj.history[i - 1];
      let curr = traj.history[i];
      line(prev.x, prev.y, prev.z, curr.x, curr.y, curr.z);
    }
  }
  
  // Draw current position as a small sphere with size based on thickness factor
  push();
  translate(traj.position.x, traj.position.y, traj.position.z);
  fill(traj.color[0], traj.color[1], traj.color[2], alpha);
  noStroke();
  // sphere(0.8 * thicknessFactor); // Uncomment if you want spheres to shrink too
  pop();
}

function drawAxes() {
  // Draw coordinate axes for reference
  let theme = document.documentElement.getAttribute('data-theme') || 'light';
  let axisColor = theme === 'dark' ? [100, 100, 100, 100] : [150, 150, 150, 100];
  
  stroke(axisColor[0], axisColor[1], axisColor[2], axisColor[3]);
  strokeWeight(0.1);
  
//   // X-axis (red) - shorter
//   stroke(255, 100, 100, 100);
//   line(-1.5, 0, 0, 1.5, 0, 0);
  
//   // Y-axis (green) - shorter
//   stroke(100, 255, 100, 100);
//   line(0, -1.0, 0, 0, 1.0, 0);
  
//   // Z-axis (blue) - shorter
//   stroke(100, 100, 255, 100);
//   line(0, 0, 0, 0, 0, 2.0);
}

// Mouse and scroll controls for camera
function mousePressed() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    isDragging = true;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseReleased() {
  isDragging = false;
}

function mouseDragged() {
  if (isDragging) {
    // Calculate mouse movement
    let deltaX = mouseX - lastMouseX;
    let deltaY = mouseY - lastMouseY;
    
    // Update camera angles based on mouse movement
    cameraAngleY += deltaX * 0.01; // Horizontal rotation
    cameraAngleX -= deltaY * 0.01; // Vertical rotation
    
    // Constrain vertical rotation to prevent flipping
    cameraAngleX = constrain(cameraAngleX, -PI/2 + 0.1, PI/2 - 0.1);
    
    // Update last mouse position
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}

function mouseWheel(event) {
  // Zoom in/out with scroll wheel
  cameraDistance += event.delta * 0.1;
  
  // Constrain zoom limits
  cameraDistance = constrain(cameraDistance, 30, 300);
  
  // Prevent default scrolling behavior
  return false;
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
