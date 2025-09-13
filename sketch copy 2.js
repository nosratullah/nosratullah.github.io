var trajectories = [];
var sphereRadius = 80;
var sphereCenter;
var attractionForce = 0.5;
var maxTrajectories = 150; // Limit for performance
var container;
var canvas;

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
    
    // Reset sphere center to origin (0,0,0) in 3D space
    sphereCenter = createVector(0, 0, 0);
    
    // Adjust existing trajectories to maintain proper positioning
    for (let traj of trajectories) {
      if (traj.onSphere) {
        // Recalculate spherical coordinates for trajectories on sphere
        let normal = p5.Vector.sub(traj.position, sphereCenter);
        normal.normalize();
        normal.mult(sphereRadius);
        traj.position = p5.Vector.add(sphereCenter, normal);
      }
    }
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
  
  // Sphere center at origin in 3D space
  sphereCenter = createVector(0, 0, 0);
  
  // Initialize some trajectories
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
  let cameraX = map(mouseX, 0, width, -100, 100) * mouseInfluence;
  let cameraY = map(mouseY, 0, height, -100, 100) * mouseInfluence;
  
  // Adjust camera distance based on canvas aspect ratio to maintain proper view
  let aspectRatio = width / height;
  let baseCameraDistance = 200;
  let adjustedDistance = baseCameraDistance * Math.max(1, aspectRatio * 0.8);
  
  camera(
    adjustedDistance + cameraX, 
    -150 + cameraY, 
    adjustedDistance,
    0, 0, 0,
    0, 1, 0
  );
  
  // Draw central sphere (wireframe for performance)
  // Adjust sphere color based on theme
  let sphereColor = theme === 'dark' ? [154, 205, 50, 100] : [154, 205, 50, 150];
  push();
  translate(0, 0, 0); // Ensure sphere is at origin
  stroke(sphereColor[0], sphereColor[1], sphereColor[2], sphereColor[3]);
  strokeWeight(.1);
  noFill();
  sphere(sphereRadius);
  pop();
  
  // Add new trajectories occasionally
  if (trajectories.length < maxTrajectories && random(1) < 0.05) {
    addTrajectory();
  }
  
  // Update and draw trajectories
  for (let i = trajectories.length - 1; i >= 0; i--) {
    let traj = trajectories[i];
    updateTrajectory(traj);
    drawTrajectory(traj);
    
    // Remove dead trajectories
    if (traj.life <= 0) {
      trajectories.splice(i, 1);
    }
  }
}

function addTrajectory() {
  let angle1 = random(TWO_PI);
  let angle2 = random(PI);
  let distance = random(300, 500);
  
  let x = distance * sin(angle2) * cos(angle1);
  let y = distance * sin(angle2) * sin(angle1);
  let z = distance * cos(angle2);
  
  let trajectory = {
    position: createVector(x, y, z),
    velocity: createVector(random(-1, 1), random(-1, 1), random(-1, 1)),
    life: random(400, 800), // Longer lifespan for dynamical system
    maxLife: random(400, 800),
    onSphere: false,
    color: random(colorPalette),
    history: [],
    // Spherical coordinates for surface motion
    theta: 0,     // Azimuthal angle
    phi: 0,       // Polar angle
    omega_theta: 0, // Angular velocity in theta
    omega_phi: 0    // Angular velocity in phi
  };
  
  trajectories.push(trajectory);
}

function updateTrajectory(traj) {
  traj.life--;
  
  if (!traj.onSphere) {
    // Use a modified Lorenz-like attractor system for approach to sphere
    let dx = traj.position.x;
    let dy = traj.position.y;
    let dz = traj.position.z;
    
    // Lorenz-like parameters (modified for sphere attraction)
    let sigma = 10;
    let rho = 50;
    let beta = 8/3;
    let dt = 0.001; // Time step
    
    // Add attraction toward sphere center
    let distToCenter = dist(dx, dy, dz, sphereCenter.x, sphereCenter.y, sphereCenter.z);
    let attractionStrength = map(distToCenter, 0, 400, 5, 0.1);
    
    // Modified Lorenz equations with sphere attraction
    let dxdt = sigma * (dy - dx) - attractionStrength * (dx - sphereCenter.x);
    let dydt = dx * (rho - dz) - dy - attractionStrength * (dy - sphereCenter.y);
    let dzdt = dx * dy - beta * dz - attractionStrength * (dz - sphereCenter.z);
    
    // Update velocity using the dynamical system
    traj.velocity.x = dxdt * dt;
    traj.velocity.y = dydt * dt;
    traj.velocity.z = dzdt * dt;
    
    // Check if trajectory reached the sphere
    if (distToCenter < sphereRadius + 15) {
      traj.onSphere = true;
      // Project position onto sphere surface
      let normal = p5.Vector.sub(traj.position, sphereCenter);
      normal.normalize();
      normal.mult(sphereRadius);
      traj.position = p5.Vector.add(sphereCenter, normal);
      
      // Initialize spherical coordinates for surface motion
      traj.theta = atan2(traj.position.z - sphereCenter.z, traj.position.x - sphereCenter.x);
      traj.phi = acos((traj.position.y - sphereCenter.y) / sphereRadius);
      traj.omega_theta = random(-0.02, 0.02); // Angular velocity in theta
      traj.omega_phi = random(-0.01, 0.01);   // Angular velocity in phi
    }
  } else {
    // Use coupled oscillator dynamics on sphere surface
    let t = frameCount * 0.01; // Time parameter
    
    // Coupled oscillator equations for spherical motion
    let coupling = 0.5;
    let damping = 0.3;
    let noise = 0.001;
    
    // Add some chaotic behavior with coupling between theta and phi
    let d_omega_theta = -coupling * sin(traj.phi) * cos(traj.theta) + noise * random(-1, 1);
    let d_omega_phi = coupling * sin(traj.theta) * cos(traj.phi) + noise * random(-1, 1);
    
    // Update angular velocities
    traj.omega_theta += d_omega_theta;
    traj.omega_phi += d_omega_phi;
    
    // Apply damping
    traj.omega_theta *= damping;
    traj.omega_phi *= damping;
    
    // Update angles
    traj.theta += traj.omega_theta;
    traj.phi += traj.omega_phi;
    
    // Keep phi in valid range [0, PI]
    traj.phi = constrain(traj.phi, 0.1, PI - 0.1);
    
    // Convert spherical coordinates back to Cartesian
    traj.position.x = sphereCenter.x + sphereRadius * sin(traj.phi) * cos(traj.theta);
    traj.position.y = sphereCenter.y + sphereRadius * cos(traj.phi);
    traj.position.z = sphereCenter.z + sphereRadius * sin(traj.phi) * sin(traj.theta);
    
    // Calculate velocity for trail effect
    let prevPos = traj.history.length > 0 ? traj.history[traj.history.length - 1] : traj.position;
    traj.velocity = p5.Vector.sub(traj.position, prevPos);
  }
  
  // Update position (for non-sphere trajectories)
  if (!traj.onSphere) {
    traj.position.add(traj.velocity);
  }
  
  // Store history for trail (limit length for performance)
  traj.history.push(traj.position.copy());
  if (traj.history.length > 25) {
    traj.history.shift();
  }
}

function drawTrajectory(traj) {
  let alpha = map(traj.life, 0, traj.maxLife, 0, 255);
  
  // Draw trail
  if (traj.history.length > 1) {
    strokeWeight(1);
    for (let i = 1; i < traj.history.length; i++) {
      let segmentAlpha = alpha * (i / traj.history.length) * 0.7;
      stroke(traj.color[0], traj.color[1], traj.color[2], segmentAlpha);
      strokeWeight(random(.1, 1));
      let prev = traj.history[i - 1];
      let curr = traj.history[i];
      line(prev.x, prev.y, prev.z, curr.x, curr.y, curr.z);
    }
  }
  
  // Draw current position
  push();
  translate(traj.position.x, traj.position.y, traj.position.z);
  fill(traj.color[0], traj.color[1], traj.color[2], alpha);
  noStroke();
  sphere(2);
  pop();
}