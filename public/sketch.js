/*
TODO:
- Agregar puntaje por fila y el contador
- implementar hold de tetrimino - usar formato de tetris.pause
- agregar la pausa a Kalinka cuando se pausa el juego
- poner sonido de portal blue al cambio de hold
*/

const socket = io()

let keyPressUp = false;
let keyPressDown = false;
let keyPressLeft = false;
let keyPressRight = false;
let musicPlay;
let intro = true;
let gameStarted = false;
//Shapelist de formas  que tiende de entrada una matriz
var shapeList = [
  [0, 0, 1, 0,
    0, 0, 1, 0,
    0, 0, 1, 0,
    0, 0, 1, 0], // I

  [0, 2, 0,
    0, 2, 0,
    0, 2, 2], // L

  [0, 3, 0,
    0, 3, 0,
    3, 3, 0], // J

  [4, 4, 0,
    0, 4, 4,
    0, 0, 0], // Z

  [0, 5, 5,
    5, 5, 0,
    0, 0, 0], // S

  [0, 0, 0,
    6, 6, 6,
    0, 6, 0], // T

  [7, 7,
    7, 7], // O
];// tetriminos shapes

var palletteMono = [];

var pallette = [
  [255, 255, 255], // 0, void
  [255, 201, 66], // 1 Yellow
  [255, 66, 66], // 2 Red
  [79, 235, 148], // 3 Green
  [39, 82, 255], // 4 Blue
  [255, 161, 66], // 5 Orange
  [39, 189, 255], // 6 Light Blue
  [196, 61, 255], // 7 Purple
]; // color pallette

// Fonts
let kanitReg, kanigSB, retro, tetrisImg, qr, kalinka, holdOnTight, bite, mupi1, mupi2;

function preload() {
  //Fonts
  kanitReg = loadFont('/assets/fonts/kanit/Kanit-Regular.ttf');
  kanitSB = loadFont('/assets/fonts/kanit/Kanit-SemiBold.ttf');
  retro = loadFont('/assets/fonts/retro/Retro Gaming.ttf')
  //Img
  tetrisImg = loadImage('/assets/imgs/tetris.png');
  qr = loadImage('/assets/imgs/qr.jpeg');
  //Music
  kalinka = loadSound('/assets/audio/Kalinka.mp3');
  holdOnTight = loadSound('/assets/audio/Hold On Tight.mp3');
  //SFX
  bite = loadSound('/assets/audio/Bite.mp3');
  bite.setVolume(0.2)

  /*mupi1.size(1080, 1920)
  mupi2 = createVideo('/assets/video/Mupi2.mp4');*/
}

// Game
function setup() { //setup de canvas y demas
  musicPlay = true
  HOTPlaying()
  volSlider = createSlider(0, 1, 0.15, 0.05);//Slider para el volumen
  createCanvas(1080, 1920);
  setupStart()
  setupTetris()
}

function setupStart() {
  mupi1 = createVideo('/assets/video/Mupi1.mp4');
  mupi1.hide();
  mupi1.play();
  mupi1.onended(loadingScreen)

  mupi2 = createVideo('/assets/video/Mupi2.mp4');
  mupi2.hide();
  mupi2.loop();
}

function setupTetris() {
  this.tetris = new Tetris(10, 20);
  this.timer = new Timer();
  frameRate(60);
  palletteMono = [];
  for (let i = 0; i < pallette.length; i++) {
    let rgb = pallette[i];
    let gray = rgb[0] + rgb[1] + rgb[2];
    palletteMono[i] = [];
    palletteMono[i][0] = 255 * gray;
    palletteMono[i][1] = 255 * gray;
    palletteMono[i][2] = 255 * gray;
  }
}

function HOTPlaying() {
  if (musicPlay == true) {
    holdOnTight.pause();
    musicPlay = false;
  } else {
    holdOnTight.loop()
    musicPlay = true;
  }
}

socket.on('input', (input) => {
  //console.log(input);
  switch (parseInt(input.key)) {
    case 87: //W
      //console.log("W");
      keyPressUp = true;
      applyInputArduino(200);
      keyPressUp = false;
      break;

    case 65: //A
      //console.log("A");
      keyPressLeft = true;
      applyInputArduino(200);
      keyPressLeft = false;
      break;

    case 83: //S
      //console.log("S");
      keyPressDown = true;
      applyInputArduino(200);
      keyPressDown = false;
      break;

    case 68: //D
      //console.log("D");
      keyPressRight = true;
      applyInputArduino(200);
      keyPressRight = false;
      break;

    case 70: //F
      //console.log("F");
      this.tetris.pause = !this.tetris.pause;//F
      HOTPlaying()
      break;

    case 82: //R
      //console.log("R");
      this.tetris.restart = true;
      break;

    case 81: //Q
      //console.log("Q");
      console.log("Game Start");
      startGame()
      gameStarted = true;
      break;

    default:
      console.log("WTF was that input???");
      break;
  }
})

function draw() { //dibuja y actualiza el tetris cada tick
  if (!gameStarted) {
    kalinka.setVolume(volSlider.value())
    background(0); // Set background color
    if (intro) {
      holdOnTight.stop()
      image(mupi1, 0, 0, 1080, 1920);
    } else {
      image(mupi2, 0, 0, 1080, 1920);
      let txt = "PRESS START"
      textSize(64)
      textFont(retro)
      text(txt, (width / 2) - 95, height / 2 - 30)
    }
  } else {
    if (this.timer.updateStep()) {
      applyInput(25);
    }
    this.tetris.update();
    this.tetris.display(this);
    holdOnTight.setVolume(volSlider.value());
  }
}

function loadingScreen() {
  intro = false
  musicPlay = true;
  HOTPlaying()
  kalinka.loop()
}

function startGame() {
  if (!gameStarted) {
    musicPlay = false;
    HOTPlaying()
    kalinka.stop()
  }
}

function applyInput(newDelay) { // recibe las entreadas del usuario para mover los tetriminos
  if (this.tetris.pause) return;
  if (keyPressUp) this.tetris.rotate = true;
  if (keyPressDown) this.tetris.ty = +1;
  if (keyPressLeft) this.tetris.tx = -1;
  if (keyPressRight) this.tetris.tx = +1;
  this.timer.reset(newDelay);
}

function applyInputArduino(newDelay) { // recibe las entreadas del usuario para mover los tetriminos
  if (this.tetris.pause) return;
  if (keyPressUp) this.tetris.rotate = true;
  if (keyPressDown) this.tetris.ty = +1;
  if (keyPressLeft) this.tetris.tx = -1;
  if (keyPressRight) this.tetris.tx = +1;
  this.timer.reset(newDelay);
}

function keyPressed() { // funcion para config de controles y listeners
  if (keyCode == 70) {
    this.tetris.pause = !this.tetris.pause;//F
    HOTPlaying()
  }
  if (keyCode == 82) this.tetris.restart = true;//R
  keyPressUp |= keyCode === 87;//W
  keyPressDown |= keyCode === 83;//S
  keyPressLeft |= keyCode === 65;//A
  keyPressRight |= keyCode === 68;//D
  //arduinoKeyPressed(getArduino);
  applyInput(200);
}
function keyReleased() { // lo mismo pero cuando los sueltan
  keyPressUp ^= keyCode === 87;
  keyPressDown ^= keyCode === 83;
  keyPressLeft ^= keyCode === 65;
  keyPressRight ^= keyCode === 68;
}

function arduinoKeyPressed(getArduino) {
  keyPressUp |= getArduino === 87; //W
  applyInput(200);
}

class Tetris {
  constructor(nx, ny) { //el constructor base del Tetris
    this.tGrid = new TGrid(nx, ny); // tamaño del tetris
    this.timer = new Timer(); // timer del tetris
    this.restartGame();
    this.shapeNext = undefined;
    this.shapeHold = undefined;
    this.pickNextShape();
  }
  restartGame() { // default values para el tetris
    this.tGrid.clearGrid();
    this.restart = false;
    this.pause = false;
    this.gameOver = false;
    this.spawn = true;
    this.rotate = false;
    this.tx = 0;
    this.ty = 0;
    this.level = 1;
    this.rowsPerLevel = 5; // 5 default
    this.rowsCompleted = 0;
    this.shapesCount = 0;
    this.timer.reset(600);
    holdOnTight.stop();// esto reinicia holdOnTight cada vez que se reinicia el juego
    holdOnTight.play();
  }
  pickNextShape() {
    this.shapeCurr = this.shapeNext;
    var indexNext = parseInt(random(shapeList.length));
    this.shapeNext = shapeList[indexNext].slice();
  }
  update() {
    if (this.restart) {
      this.restartGame();
    }
    if (this.pause) {
      return;
    }
    // Spawn new shape
    if (this.spawn) {
      this.pickNextShape();
      this.tGrid.setShape(this.shapeCurr);
      this.shapesCount++;
      this.spawn = false;
    }
    // Update level/rows/difficulty
    this.level += floor(this.rowsCompleted / this.rowsPerLevel);
    this.rowsCompleted %= this.rowsPerLevel;
    this.timer.duration = ceil(800 / sqrt(this.level));
    // Game over check
    this.gameOver = this.tGrid.collision(0, 0);
    if (this.gameOver) {
      return;
    }
    // Apply user input: transforms
    if (this.rotate) this.tGrid.rotateShape();
    if (!this.tGrid.collision(this.tx, 0)) this.tGrid.sx += this.tx;
    if (!this.tGrid.collision(0, this.ty)) this.tGrid.sy += this.ty;
    // Apply game step
    if (this.timer.updateStep()) {
      if (!this.tGrid.collision(0, 1)) {
        if (this.ty == 0) {
          this.tGrid.sy++;
        }
      } else {
        this.tGrid.splatShape();
        this.rowsCompleted += this.tGrid.updateRows();
        this.spawn = true;
      }
    }
    // Reset transforms
    this.rotate = false;
    this.tx = this.ty = 0;
  }

  display(canvas) {
    var off, x, y, w, h, cell;
    var canvasW = canvas.width;
    var canvasH = canvas.height;
    off = 40;
    h = 1300; // size of tetris screen
    w = 650;
    cell = ceil(Math.min(w / this.tGrid.nx, h / this.tGrid.ny));
    w = this.tGrid.nx * cell;
    h = this.tGrid.ny * cell;
    x = parseInt((canvasW / 12));
    y = parseInt((canvasH - h) / 2.0);
    canvas.background(0, 0, 50); //done
    canvas.strokeWeight(3); //width of tetris cells
    canvas.noStroke();
    canvas.fill(12, 26, 97); //done
    canvas.rect(x - 4, y - 4, w + 8, h + 8);
    canvas.fill(12, 26, 97); //done
    canvas.rect(x - 1, y - 1, w + 3, h + 3);
    // Game screen
    var colors = this.pause || this.gameOver ? palletteMono : pallette;
    this.displayGrid(canvas, x, y, w, h, colors);

    // Shape preview
    {
      var _w = 2 * canvasW / 6;
      var _h = 1 * canvasH / 6;
      var _y = 6 * canvasH / 20;
      var _x = 5 * canvasW / 6;
      this.displayNextShape(canvas, _x, _y, _w, _h);
    }

    // Header
    {
      var ty = canvasH / 16 + 50;
      var tx = canvasW / 2;
      var txtTitle = "NIKE X TETRIS";
      canvas.textAlign(CENTER, CENTER);
      canvas.noStroke();
      canvas.textFont(kanitSB);
      canvas.textSize(110);
      canvas.fill(240, 240, 240); //done
      canvas.text(txtTitle, tx, ty - 70);
      var txtDesc = "Get to level 3 for a discount!"
      canvas.textAlign(CENTER, CENTER);
      canvas.noStroke();
      canvas.textFont(kanitReg);
      canvas.textSize(50);
      canvas.fill(160); //done
      canvas.text(txtDesc, tx, ty + 30);
      image(tetrisImg, 1, 1765)

    }

    // Game level, ...
    {
      var ty = (4 * canvasH / 20) - 55;
      var tx1 = 5 * canvasW / 6;
      var txtLevel = "LEVEL " + this.level;
      var txtProgress = "ROW " + this.rowsCompleted + "/" + this.rowsPerLevel;
      var txtShapes = "SHAPE " + this.shapesCount;

      canvas.textAlign(CENTER, CENTER);
      canvas.noStroke();
      canvas.fill(240); //done
      canvas.textSize(44);
      canvas.textFont(kanitReg);
      canvas.text(txtLevel, tx1, ty);

      canvas.fill(160); //done
      canvas.textSize(32);
      canvas.textFont(kanitReg);
      canvas.text(txtProgress, tx1, (ty * 1.12));
      canvas.text(txtShapes, tx1, (ty * 1.22));
    }

    // Game status
    var lvlWin = 3; // ESTO CAMBIA EL NUMERO DE NIVELES PARA GANAR EL DESCUENTO
    var txtGameStatus = undefined;
    if (this.gameOver) {
      if (this.level >= lvlWin) {
        txtGameStatus = "YOU WIN"
      } else {
        txtGameStatus = "GAME OVER";
      }
    }
    if (this.pause) txtGameStatus = "PAUSE";
    if (txtGameStatus !== undefined) {
      canvas.textSize(144);
      canvas.textFont(kanitSB);
      canvas.textAlign(CENTER, CENTER);
      canvas.noStroke();
      canvas.fill(0, 0, 0); //done
      canvas.text(txtGameStatus, canvasW / 2 + 4, canvasH / 2 + 4);
      if (this.pause) {
        canvas.fill(255, 255, 0); //Yellow
      } else if (this.level >= lvlWin) {
        canvas.fill(0, 255, 0); //Green
      } else {
        canvas.fill(255, 0, 0); //Red
      }
      canvas.text(txtGameStatus, canvasW / 2, canvasH / 2);
      if (this.level >= lvlWin) {
        canvas.fill(0, 0, 0)
        canvas.rect(canvasW / 2 - 350, canvasH / 2 + 90, 700, 40)

        canvas.textSize(40);
        canvas.textFont(kanitReg);
        canvas.textAlign(CENTER, CENTER);
        canvas.noStroke();
        canvas.fill(240, 240, 240); //done
        canvas.text("Scan this QR code for your disscount!", canvasW / 2, canvasH / 2 + 100);

        image(qr, canvasW / 2 - 200, canvasH / 2 + 150, 400, 400);
      }

    }

    // Controls
    {
      var ty = 8 * canvasW / 6;
      var tx1 = (6 * canvasW / 8) - 40;
      var tx2 = tx1 + 40;
      canvas.textAlign(LEFT);
      canvas.noStroke();
      canvas.textSize(32);
      canvas.textFont(kanitReg);
      canvas.fill(160); //done
      canvas.text("W", tx1, ty);
      canvas.text("- ROTATE", tx2, ty);
      ty = ty * 1.02;
      canvas.text("A", tx1, ty);
      canvas.text("- MOVE LEFT", tx2, ty);
      ty = ty * 1.02;
      canvas.text("D", tx1, ty);
      canvas.text("- MOVE RIGHT", tx2, ty);
      ty = ty * 1.02;
      canvas.text("S", tx1, ty);
      canvas.text("- MOVE DOWN", tx2, ty);
      ty = ty * 1.02;
      canvas.text("F", tx1, ty);
      canvas.text("- PAUSE", tx2, ty);
      ty = ty * 1.02;
      canvas.text("R", tx1, ty);
      canvas.text("- RESTART", tx2, ty);
      ty = ty * 1.02;
    }
  }

  displayGrid(pg, x, y, w, h, pallette) {
    var nx = this.tGrid.nx;
    var ny = this.tGrid.ny;
    var cw = w / nx;
    var ch = h / ny;
    // BackGround
    for (var gy = 0; gy < ny; gy++) {
      for (var gx = 0; gx < nx; gx++) {
        var cx = x + gx * cw;
        var cy = y + gy * ch;
        pg.stroke(12, 26, 97); //grid color
        if ((gx & 1) == 1) {
          pg.fill(0, 0, 20); //done
        } else {
          pg.fill(0, 0, 30); //done
        }
        pg.rect(cx, cy, cw, ch);
      }
    }

    // ForeGround
    for (var gy = 0; gy < ny; gy++) {
      for (var gx = 0; gx < nx; gx++) {
        var cx = x + gx * cw;
        var cy = y + gy * ch;
        var valGrid = this.tGrid.getGridVal(gx, gy);
        if (valGrid > 0) {
          pg.stroke(0); //done
          var rgb = pallette[valGrid % pallette.length];
          pg.fill(rgb[0], rgb[1], rgb[2]); // foreground colors
          pg.rect(cx, cy, cw, ch);
        }
      }
    }

    // Shape
    var ks = this.tGrid.shapeSize;
    var kr = ceil(this.tGrid.shapeSize / 2.0);
    for (var ky = 0; ky < ks; ky++) {
      for (var kx = 0; kx < ks; kx++) {
        var gx = this.tGrid.sx + kx - kr;
        var gy = this.tGrid.sy + ky - kr;
        var cx = x + gx * cw;
        var cy = y + gy * ch;
        var valShape = this.tGrid.getShapeVal(kx, ky);
        if (valShape != 0) {
          pg.stroke(0);
          var rgb = pallette[valShape % pallette.length];
          pg.fill(rgb[0], rgb[1], rgb[2]); // tetriminos color
          pg.rect(cx, cy, cw, ch);
        }
      }
    }
  }
  //TODO:How do i save and display a holded tetrimino
  displayNextShape(pg, x, y, w, h) {
    var shape = this.shapeNext;
    var shapeSize = parseInt(sqrt(shape.length));
    var ks = shapeSize;
    var kr = shapeSize / 2.0;
    var cw = min(w / 5.0, h / 5.0);
    var ch = cw;
    for (var ky = 0; ky < ks; ky++) {
      for (var kx = 0; kx < ks; kx++) {
        var gx = kx - kr;
        var gy = ky - kr;
        var cx = x + gx * cw;
        var cy = y + gy * ch;
        cx = parseInt(cx);
        cy = parseInt(cy);
        var valShape = shape[ky * shapeSize + kx];
        if (valShape != 0) {
          pg.fill(255); //done
        } else {
          pg.fill(0, 0, 30); // bg color for next tetrimino
        }
        pg.stroke(12, 26, 97); //done
        pg.rect(cx, cy, cw, ch);
      }
    }
  }
}

class Timer { // el timer del tetris
  constructor() {
    this.duration = 600;
    this.time = 0;
  }
  reset(duration) {
    this.setTime();
    this.duration = duration;
  }
  setTime() {
    this.time = millis();
  }
  getTime() {
    return millis() - this.time;
  }
  updateStep() {
    if (this.getTime() >= this.duration) {
      this.setTime();
      return true;
    }
    return false;
  }
}

class TGrid { //REVISAR
  constructor(nx, ny) {
    this.nx = nx;
    this.ny = ny;
    this.grid = [];
    this.grid.length = nx * ny;
    this.clearGrid();
    this.setShape([0]);
  }

  clearGrid() {
    for (var i = 0; i < this.grid.length; i++) {
      this.grid[i] = 0;
    }
  }

  isInsideGrid(x, y) {
    return x >= 0 && x < this.nx && y >= 0 && y < this.ny;
  }

  setShape(shape) {
    this.shape = shape;
    this.shapeSize = parseInt(sqrt(shape.length));
    this.sx = ceil(this.nx / 2);
    this.sy = ceil(this.shapeSize / 2);
  }

  getGridVal(x, y) {
    if (!this.isInsideGrid(x, y)) {
      return -1;
    } else {
      return this.grid[y * this.nx + x];
    }
  }

  setGridVal(x, y, val) {
    this.grid[y * this.nx + x] = val;
  }

  getShapeVal(x, y) {
    return this.shape[y * this.shapeSize + x];
  }

  rotateShapeDir(CW) {
    var size = this.shapeSize;
    var cpy = this.shape.slice(0);
    if (CW) {
      var ib = 0,
        ia = size * size;
      for (var y = 1; y <= size; y++, ia++) {
        for (var x = 1; x <= size; x++, ib++) {
          this.shape[ib] = cpy[ia - x * size];
        }
      }
    } else {
      var ib = 0,
        ia = -1;
      for (var y = 1; y <= size; y++, ia--) {
        for (var x = 1; x <= size; x++, ib++) {
          this.shape[ib] = cpy[ia + x * size];
        }
      }
    }
  }

  rotateShape() {
    this.rotateShapeDir(true);
    if (this.collision(0, 0)) {
      this.rotateShapeDir(false);
    }
  }

  collision(tx, ty) {
    var ks = this.shapeSize;
    var kr = ceil(this.shapeSize / 2);
    for (var ky = 0; ky < ks; ky++) {
      for (var kx = 0; kx < ks; kx++) {
        var px = this.sx + kx - kr + tx;
        var py = this.sy + ky - kr + ty;
        var valGrid = this.getGridVal(px, py);
        var valShape = this.getShapeVal(kx, ky);
        if (valGrid * valShape != 0) {
          return true;
        }
      }
    }
    return false;
  }

  updateRows() {
    var rows = 0;
    for (var gy = 0; gy < this.ny; gy++) {
      var rowCompleted = true;
      for (var gx = 0; gx < this.nx; gx++) {
        var gi = gy * this.nx + gx;
        if (this.grid[gi] == 0) rowCompleted = false;
      }
      if (rowCompleted) {
        this.grid.copyWithin(this.nx, 0, gy * this.nx);
        bite.play(); //SFX cuando limpe linea
        rows++;
      }
    }
    if (rows > 0) {
      for (var gx = 0; gx < this.nx; gx++) {
        this.grid[gx] = 0;
      }
    }
    return rows;
  }

  splatShape() {
    let ks = this.shapeSize;
    let kr = ceil(this.shapeSize / 2);
    for (let ky = 0; ky < ks; ky++) {
      for (let kx = 0; kx < ks; kx++) {
        let px = this.sx + kx - kr;
        let py = this.sy + ky - kr;
        let valShape = this.getShapeVal(kx, ky);
        if (valShape != 0) {
          this.setGridVal(px, py, valShape);
        }
      }
    }
  }
}