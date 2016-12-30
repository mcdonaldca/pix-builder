var WIDTH = 14;
var HEIGHT = 10;
var UNIT = 48;

function Builder() {
  this.buildCanvas();

  this.buildCells();

  var builder = this;
  $('.cells').click(function(e) {
    var x = $(e.target).attr('data-x');
    var y = $(e.target).attr('data-y');
    builder.cellClick(x, y);
  })
}



Builder.prototype.buildCanvas = function() {
  var canvasContainer = $('.canvas');
  this.canvas = document.createElement('canvas');
  this.context = this.canvas.getContext("2d"); // Context of the canvas.
  this.canvas.width = WIDTH * UNIT;
  this.canvas.height = HEIGHT * UNIT;
  $(canvasContainer).append(this.canvas);
};



Builder.prototype.buildCells = function() {
  var cellsContainer = $('.cells');
  for (var x = 0; x < WIDTH; x++) {
    for (var y = 0; y < HEIGHT; y++) {
      var div = document.createElement('div');
      $(div).addClass('cell')
            .attr('data-x', x)
            .attr('data-y', y);
      $(cellsContainer).append(div);
    }
  }
};




Builder.prototype.cellClick = function(x, y) {
  console.log(x, y);
};



// Start application when window loads.   
window.onload = function() {
  // Declaerd globally for debugging purposes
  builder = new Builder();
}