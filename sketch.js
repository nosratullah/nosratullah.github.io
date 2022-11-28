var points = [];
var speed = 0.002;
var time_counter = 0;
var canvas;

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
  
  var density = 100;
  var space = width / density;

  for (let x = 0; x < width; x+=space) {
    // const element = array[x];
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
  background(0, 8);
  noStroke();
  if ( frameCount <= points.length ) {
    var max = frameCount;
  } else {
    var max = points.length;
  }
  for (let i = 0; i < max; i++) {
    var p = points[i];

    var r = map(p.x, 0, width, r1, r2);
    var g = map(p.y, 0, width, g1, g2);
    var b = map(p.x, 0, width, b1, b2);
    
    fill(r, g, b);
    var angle = map(noise(p.x * speed, p.y * speed), 0, 1, 0, 720);
    p.add(createVector(cos(angle), sin(angle)));
    ellipse(p.x, p.y, random(5), random(5));
    }
  time_counter += 1;
  if (time_counter > 1000) {
    noLoop();
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}