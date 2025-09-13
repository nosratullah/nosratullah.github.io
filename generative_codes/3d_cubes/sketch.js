let smallCube = 30;
let bigCube = 50;
let step = 3;

let smallCubeSlider, bigCubeSlider, stepSlider;

function setup() {
  createCanvas(1000, 800, WEBGL);
  // createCanvas(windowWidth, windowHeight, WEBGL);
  createP('Small Cube Size:').position(windowWidth - 300, windowHeight - 230);
  smallCubeSlider = createSlider(10, 100, smallCube);
  smallCubeSlider.position(windowWidth - 300, windowHeight - 200);

  createP('Big Cube Size:').position(windowWidth - 300, windowHeight - 180);
  bigCubeSlider = createSlider(10, 100, bigCube);
  bigCubeSlider.position(windowWidth - 300, windowHeight - 150);

  createP('Number of cubes:').position(windowWidth - 300, windowHeight - 130);
  stepSlider = createSlider(1, 10, step);
  stepSlider.position(windowWidth - 300, windowHeight - 100);
}

function draw() {
  // Check theme and set background accordingly
  let theme = document.body.getAttribute('data-theme') || 'light';
  let bgColor = theme === 'dark' ? (17, 17, 17) : (255, 255, 255); // Black for dark mode, white for light mode
  let bgAlpha = theme === 'dark' ? 20 : 30; // Slight trail effect
  background(bgColor, bgAlpha);
  // background(17, 17, 17);
  const smallCube = smallCubeSlider.value();
  const bigCube = bigCubeSlider.value();
  const step = stepSlider.value();
  for(let i = -step; i < step; i++) {
    for(let j = -step; j < step; j++) {
      push();
      translate(i * (smallCube+bigCube+10), j * (smallCube+bigCube+10), 0);
      let n = noise(i * 0.1, j * 0.1, frameCount * 0.02);
      if(n>0.0) {
        rotateX(n * TWO_PI);
        rotateZ(n * TWO_PI);
        }
      fill('black');
      stroke('white');
      box(smallCube);
      noFill();
      // stroke('black');
      let tranparent = map(n, 0, 1, 100, 255);
      stroke(100, 100, 100, tranparent);
      // let wiggle = map(n, 0, 1, 0, 5);
      box(bigCube);
      pop();
    }
  }
}
