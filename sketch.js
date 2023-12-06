var points = [];
var speed = 0.002;
var canvas;
let startTime = 0;
let duration = 10000; // 10 seconds
let initialFrameRate = 60;
let finalFrameRate = 1;
let steepness = 0.01;

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function setup() {
  canvas = createCanvas(windowWidth , windowHeight);
  canvas.position(0, 0);
  canvas.style('z-index', '-1');
  background(0);
  angleMode(DEGREES);
  noiseDetail(1);
  frameRate(initialFrameRate);
  startTime = millis();
  
  var density = 50; // Reduced density
  var space = width / density;
  for (let x = 0; x < width; x+=space) {
    for (let y = 0; y < height; y+=space) {
      var p = createVector(x + random(-10, 10), y + random(-10, 10));
      points.push(p);
    }
  }

  shuffle(points, true);
  r1 = random(255);
  g1 = random(200);
  b1 = random(255);
  r2 = random(255);
  g2 = random(255);
  b2 = random(255);
}

function draw() {
  let elapsedTime = millis() - startTime;
  let t = min(elapsedTime / duration, 1); // Normalize time between 0 and 1
  let x = 4 * (2 * t - 1) * steepness;
  let sigmoid = 1 / (1 + exp(-x));
  let currentFrameRate = lerp(initialFrameRate, finalFrameRate, sigmoid);

  frameRate(currentFrameRate);
  
  background(0, 8);
  noStroke();
  var max = min(frameCount, points.length);
  for (let i = 0; i < max; i++) {
    var p = points[i];
    var r = map(p.x, 0, width, r1, r2);
    var g = map(p.y, 0, width, g1, g2);
    var b = map(p.x, 0, width, b1, b2);
    fill(r, g, b);
    var angle = map(noise(p.x * speed, p.y * speed), 0, 1, 0, 360 * 3);
    p.x += cos(angle);
    p.y += sin(angle);
    ellipse(p.x, p.y, random(5), random(5));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}