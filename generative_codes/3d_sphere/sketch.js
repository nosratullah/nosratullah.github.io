let radius = 10;
let big_radius = 60;
let step = 5;
let number_of_circles = 10;
let space = 50;
let number_of_frames = 600;

let radiusSlider, ringSlider, stepSlider, spaceSlider;

function setup() {
  createCanvas(1000, 800, WEBGL);
  // createCanvas(windowWidth, windowHeight, WEBGL);
  createP('radius size:').position(windowWidth - 300, windowHeight - 230);
  radiusSlider = createSlider(10, 100, radius);
  radiusSlider.position(windowWidth - 300, windowHeight - 200);

  createP('ring size:').position(windowWidth - 300, windowHeight - 180);
  ringSlider = createSlider(10, 100, big_radius);
  ringSlider.position(windowWidth - 300, windowHeight - 150);

  createP('step size:').position(windowWidth - 300, windowHeight - 130);
  stepSlider = createSlider(1, 10, step);
  stepSlider.position(windowWidth - 300, windowHeight - 100);

  createP('Space between spheres:').position(windowWidth - 300, windowHeight - 80);
  spaceSlider = createSlider(1, 100, space);
  spaceSlider.position(windowWidth - 300, windowHeight - 50);
}

function draw() {
  // Check theme and set background accordingly
  let theme = document.body.getAttribute('data-theme') || 'light';
  let bgColor = theme === 'dark' ? (17, 17, 17) : (255, 255, 255); // Black for dark mode, white for light mode
  let bgAlpha = theme === 'dark' ? 20 : 30; // Slight trail effect
  
  background(bgColor, bgAlpha);
  // if (frameCount === 1) {
  //   capturer.start();
  // }
  // background(17, 17, 17);
  ambientLight(100, 100, 100);
  pointLight(250, 250, 250, 100, 100, 0);
  pointLight(250, 250, 250, -100, -100, 0);

  const radius = radiusSlider.value();
  const big_radius = ringSlider.value();
  const step = stepSlider.value();
  const space = spaceSlider.value();
  for(let i = -step + 1; i < step; i++) {
    for(let j = -step + 1; j < step; j++) {
      push();
      translate(i * (radius*2+space), j * (radius*2+space), 0);
      rotateY(frameCount * 0.01); // Rotate the scene for a 3D effect
      rotateX(frameCount * 0.01); // Rotate the scene for a 3D effect
      // rotateZ(frameCount * 0.001); // Rotate the scene for a 3D effect
      // Draw the sphere
      // noFill();
      noStroke();
      // normalMaterial();
      // ambientLight(100, 100, 100);
      ambientMaterial(100, 250, 250);
      sphere(radius);

      // Draw the circular line around the sphere
      // push();
      for(let k = -number_of_circles; k < number_of_circles; k++) {
      let angle = radians(45); // Convert 45 degrees to radians
      let m = noise(frameCount * 0.01); // Generate a noise value between 0 and 1
      let n = sin(frameCount * 0.01); // + cos(i * 0.01 + j * 0.01); // Generate a noise value between 0 and 1
      let n_maped = map(n, -1, 1, 0, 1);
      rotateX(angle * n_maped); // Rotate the circle 45 degrees on the X axis
      // rotateY(angle * n); // Rotate the circle 45 degrees on the Y axis
      rotateZ(angle * m);
      noFill();
      let stColor = theme === 'light' ? (17, 17, 17) : (255, 255, 255); // Black for dark mode, 
      stroke(stColor);
      // background(bgColor, bgAlpha);
      strokeWeight(.2);
      circle(0, 0, big_radius); // The diameter of the circle is twice the radius of the sphere
      }
      pop();
    }
  }

  // if (frameCount < number_of_frames) {
  //   // capturer.capture(canvas);
  //   // saveCanvas('output/Img', 'png');
  //     let filename = "frame" + nf(frameCount, 4) + ".png"; // Create a filename with leading zeros
  //     saveCanvas(filename); // Save the current frame as an image
  // } else if (frameCount === number_of_frames) {
  //   // capturer.stop();
  //   // capturer.save();
  //   noLoop();
  // }
}


