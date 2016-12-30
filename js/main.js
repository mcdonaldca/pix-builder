var WIDTH = 14;
var HEIGHT = 10;
var UNIT = 16;
var MULT = 3;

function Builder() {
  this.width = WIDTH * UNIT * MULT;
  this.height = HEIGHT * UNIT * MULT;

  this.buildCanvas();
  this.buildCells();

  var builder = this;
  $('.cell').mousedown(function(e) {
    var x = $(e.target).attr('data-x');
    var y = $(e.target).attr('data-y');
    builder.cellMouseDown(x, y);
  });

  var builder = this;
  $('.cell').mouseup(function(e) {
    var x = $(e.target).attr('data-x');
    var y = $(e.target).attr('data-y');
    builder.cellMouseUp(x, y);
  });
  $('.cell').mouseenter(function(e) {
    var x = $(e.target).attr('data-x');
    var y = $(e.target).attr('data-y');
    builder.cellMouseEnter(x, y);
  });
  $('.actions__button').click(function(e) {
    var type = $(e.target).attr('data-type');
    builder.actionButtonClick(type);
  });

  this.mouseDown = false;
  this.selectedImage = 'img/flooring/wood-light.png';
}



Builder.prototype.buildCanvas = function() {
  var canvasContainer = $('.canvas');
  this.displayCanvas = document.createElement('canvas');
  this.displayContext = this.displayCanvas.getContext('2d'); // Context of the canvas.
  this.displayCanvas.width = this.width;
  this.displayCanvas.height = this.height;

  this.manipCanvas = document.createElement('canvas');
  $(this.manipCanvas).addClass('hide');
  this.manipContext = this.manipCanvas.getContext('2d'); // Context of the canvas.

  $(canvasContainer).append(this.displayCanvas);
  $(canvasContainer).append(this.manipCanvas);
};



Builder.prototype.buildCells = function() {
  var cellsContainer = $('.cells');
  for (var y = 0; y < HEIGHT; y++) {
    for (var x = 0; x < WIDTH; x++) {
      var div = document.createElement('div');
      $(div).addClass('cell')
            .attr('data-x', x)
            .attr('data-y', y);
      $(cellsContainer).append(div);
    }
  }
};




Builder.prototype.fillCell = function(x, y) {
  // Create a new image, set its onload function, and set the source
  var image = new Image();
  var pool = this;
  image.onload = function() {
    pool.drawImageOnLoad(this, x, y);
  }
  image.src = this.selectedImage;
};




Builder.prototype.cellMouseDown = function(x, y) {
  this.mouseDown = true;
  this.fillCell(x, y);
};




Builder.prototype.cellMouseUp = function(x, y) {
  this.mouseDown = false;
};




Builder.prototype.cellMouseEnter = function(x, y) {
  if (this.mouseDown) this.fillCell(x, y);
};




Builder.prototype.actionButtonClick = function(type) {
  switch(type) {
    case 'toggle-grid':
      $('.canvas').toggleClass('gridded');
      break;

    case 'clear-all':
      var shouldClear = confirm('Do you want to erase your world?');
      if (shouldClear) this.displayContext.clearRect(0, 0, this.displayCanvas.width, this.displayCanvas.height);
      break;

    default:
      break;
  }
};



// Called when the image to draw has been loaded.
Builder.prototype.drawImageOnLoad = function(image, x, y) {
  // Set the manipulation canvas to the image height and width
  // This canvas will always be the size of the original image
  this.manipCanvas.width = image.width * MULT;
  this.manipCanvas.height = image.height * MULT;

  // Draw original image on manipulation canvas
  // Turn off image smoothing so pixels render exactly
  this.manipContext.imageSmoothingEnabled = false;
  this.manipContext.scale(MULT, MULT);
  this.manipContext.drawImage(image, 0, 0);

  // Scale the display canvas & draw the manipulation canvas content
  this.displayContext.imageSmoothingEnabled = false;
  this.displayContext.drawImage(this.manipCanvas, x * UNIT * MULT, y * UNIT * MULT);
};



// Start application when window loads.   
window.onload = function() {
  // Declaerd globally for debugging purposes
  builder = new Builder();
}