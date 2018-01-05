/** 
  The world builder object controls the communication between the various 
  tools/actions and the world's canvas,
**/
function WorldBuilder() {
  this.width = INIT_WIDTH * UNIT * MULT;
  this.height = INIT_HEIGHT * UNIT * MULT;

  // Initialize the various parts of the editor.
  this.buildCanvases();
  this.buildCells();
  this.buildEdges();
  this.setUpEvents();
  this.world = new World();

  // Set the defaults for the editor.
  this.mode = Modes.FLOORING;
  this.mouseDown = false;
  this.openPanel = undefined;
  this.selection = 'img/flooring/wood-light.png';
}



/**
  Sets up three canvases: flooring, walls, and manipulation canvas.
  TODO: add canvas for wall shadows
**/
WorldBuilder.prototype.buildCanvases = function() {
  // Set up the flooring canvas + context
  this.flooringCanvas = document.createElement('canvas');
  this.flooringContext = this.flooringCanvas.getContext('2d'); // Context of the canvas.
  this.flooringCanvas.width = this.width;
  this.flooringCanvas.height = this.height;

  // Set up the wall canvas + context
  this.wallsCanvas = document.createElement('canvas');
  this.wallsContext = this.wallsCanvas.getContext('2d'); // Context of the canvas.
  this.wallsCanvas.width = this.width;
  this.wallsCanvas.height = this.height;

  // Set up the manipulation canvas, used to edit and scale before drawing
  // to one of the other canvases.
  this.manipCanvas = document.createElement('canvas');
  $(this.manipCanvas).addClass('hide');
  this.manipContext = this.manipCanvas.getContext('2d'); // Context of the canvas.

  // Add all the canvases to the html container.
  var canvasContainer = $('.canvas');
  $(canvasContainer).append(this.flooringCanvas);
  $(canvasContainer).append(this.wallsCanvas);
  $(canvasContainer).append(this.manipCanvas);
};



/** Create all the HTML for the cells of the world. */
WorldBuilder.prototype.buildCells = function() {
  var cellsContainer = $('.cells');
  for (var y = 0; y < INIT_HEIGHT; y++) {
    for (var x = 0; x < INIT_WIDTH; x++) {
      var div = document.createElement('div');
      $(div).addClass('cell')
            .attr('data-x', x)
            .attr('data-y', y)
      $(cellsContainer).append(div);
    }
  }
};



/** Create all the HTML for the edges of the cells. **/
WorldBuilder.prototype.buildEdges = function() {
  var edgesContainer = $('.edges');
  for (var y = 0; y < INIT_HEIGHT; y++) {
    for (var x = 0; x < INIT_WIDTH; x++) {
      var edgeTop = document.createElement('div');
      var edgeRight = document.createElement('div');
      var edgeBottom = document.createElement('div');
      var edgeLeft = document.createElement('div');

      $(edgeTop).addClass('edge horizontal')
                .attr('data-x', x)
                .attr('data-y', y)
                .attr('data-edge', 'top')
                .css('left', ((x * UNIT * MULT) + (4 * MULT)).toString() + 'px')
                .css('top', (y * UNIT * MULT).toString() + 'px');

      $(edgeRight).addClass('edge vertical')
                  .attr('data-x', x)
                  .attr('data-y', y)
                  .attr('data-edge', 'right')
                  .css('left', ((x * UNIT * MULT) + (12 * MULT)).toString() + 'px')
                  .css('top', ((y * UNIT * MULT) + (4 * MULT)).toString() + 'px');

      $(edgeBottom).addClass('edge horizontal')
                   .attr('data-x', x)
                    .attr('data-y', y)
                    .attr('data-edge', 'bottom')
                    .css('left', ((x * UNIT * MULT) + (4 * MULT)).toString() + 'px')
                   .css('top', ((y * UNIT * MULT) + (12 * MULT)).toString() + 'px');

      $(edgeLeft).addClass('edge vertical')
                 .attr('data-x', x)
                 .attr('data-y', y)
                 .attr('data-edge', 'left')
                 .css('left', (x * UNIT * MULT).toString() + 'px')
                 .css('top', ((y * UNIT * MULT) + (4 * MULT)).toString() + 'px');

      $(edgesContainer).append(edgeTop);
      $(edgesContainer).append(edgeRight);
      $(edgesContainer).append(edgeBottom);
      $(edgesContainer).append(edgeLeft);
    }
  }
};



/**
 * Set up the js events that run the show.
 */
WorldBuilder.prototype.setUpEvents = function() {
  var builder = this;
  // Mouse events for the cells + canvas.
  $('.cell').mousedown(function(e) {
    var x = $(e.target).attr('data-x');
    var y = $(e.target).attr('data-y');
    builder.cellMouseDown(x, y);
  });
  $('.canvas').mouseup(function(e) {
    var x = $(e.target).attr('data-x');
    var y = $(e.target).attr('data-y');
    builder.mouseUp(x, y);
  });
  $('.cell').mouseenter(function(e) {
    var x = $(e.target).attr('data-x');
    var y = $(e.target).attr('data-y');
    builder.cellMouseEnter(x, y);
  });
  $('.edge').mousedown(function(e) {
    var x = $(e.target).attr('data-x');
    var y = $(e.target).attr('data-y');
    var edge = $(e.target).attr('data-edge');
    builder.edgeMouseDown(x, y, edge);
  });

  // Events for action buttons.
  $('.actions__button').click(function(e) {
    var type = $(e.delegateTarget).attr('data-type');
    builder.actionButtonClick(type);
  });
  $('.toolbox .actions__button').click(function(e) {
    var type = $(e.delegateTarget).attr('data-type');
    builder.toolboxActionButtonClick(type);
  });

  // Events for creation selections.
  $('.panel__flooring .selection__option').click(function(e) { builder.flooringSelection(e); });
  $('.panel__walls .selection__option').click(function(e) { builder.wallsSelection(e); });
};



WorldBuilder.prototype.cellAction = function(x, y, edge) {
  edge = edge || this.currentEdge;

  switch(this.mode) {
    case Modes.FLOORING:
      if (this.selection != 'hammer') this.addFlooring(x, y);
      else this.removeFlooring(x, y);
      break;

    case Modes.WALLS:
      if (this.selection != 'hammer') this.addWall(x, y, Edges.CENTER);
      else this.removeWall(x, y, Edges.CENTER);
      break;

    default:
      break;
  }
};



WorldBuilder.prototype.edgeAction = function(x, y, edge) {
  if (this.mouseDown) edge = edge || this.currentEdge;

  switch(this.mode) {
    case Modes.WALLS:
      if (edge) {
        if (this.selection != 'hammer') this.addWall(x, y, edge);
        else this.removeWall(x, y, edge);
      }
      break;

    case Modes.FLOORING:
    default:
      break;
  }
};



WorldBuilder.prototype.addFlooring = function(x, y) {
  // Create a new image, set its onload function, and set the source
  var image = new Image();
  var builder = this;
  image.onload = function() {
    builder.drawImageOnLoad(this, x, y, builder.flooringContext);
  }
  image.src = this.selection;

  this.world.addFlooring(x, y, this.selection)
};



WorldBuilder.prototype.removeFlooring = function(x, y) {
  this.flooringContext.clearRect(x * UNIT * MULT, y * UNIT * MULT, UNIT * MULT, UNIT * MULT);
  this.world.removeFlooring(x, y)
};



WorldBuilder.prototype.addWall = function(x, y, edge) {
  var walls = this.world.addWall(x, y, this.selection, edge);
  this.drawWalls(edge, x, y);
};



WorldBuilder.prototype.removeWall = function(x, y, edge) {
  var walls = this.world.removeWall(x, y, edge);
  this.drawWalls(walls, x, y);
}



WorldBuilder.prototype.cellMouseDown = function(x, y) {
  this.mouseDown = true;
  this.cellAction(x, y);
};



WorldBuilder.prototype.edgeMouseDown = function(x, y, edge) {
  this.mouseDown = true;
  this.currentEdge = edge;
  this.edgeAction(x, y, edge);
};



WorldBuilder.prototype.cellMouseEnter = function(x, y) {
  if (this.mouseDown) {
    if (this.mode == Modes.WALLS) this.edgeAction(x, y);
    else this.cellAction(x, y);
  } 
};



WorldBuilder.prototype.mouseUp = function(x, y) {
  this.mouseDown = false;
};



WorldBuilder.prototype.actionButtonClick = function(type) {
  switch(type) {
    case 'toggle-grid':
      $('.canvas').toggleClass('gridded');
      break;

    case 'clear-all':
      var shouldClear = confirm('Do you want to clear the canvas?');
      if (shouldClear) {
        this.flooringContext.clearRect(0, 0, this.width, this.height);
        this.wallsContext.clearRect(0, 0, this.width, this.height);
      }
      break;

    case 'resize':
      $('.panels__panel.resize').toggleClass('expanded');
      break;

    default:
      break;
  }
};



/**
  Handles a click on one of the toolbox action buttons.
  
  @param type The type of button clicked on.
**/
WorldBuilder.prototype.toolboxActionButtonClick = function(type) {
  // If the panel is already open, close it.
  if (this.openPanel == type) {
    $('.toolbox').removeClass('expanded');
    this.openPanel = undefined;
  // If there is no panel open, open it.
  } else if (!this.openPanel) {
    $('.toolbox').addClass('expanded');
    this.openPanel = type;
  // Otherwise, set the new panel.
  } else {
    this.openPanel = type;
  }

  // Remove open class from old panel + add to new.
  $('.panel.open').removeClass('open');
  $('.panel__' + type).addClass('open');
}



/**
  Changes the toolbox panel mode.
   
  @param type The mode type to switch to.
**/
WorldBuilder.prototype.changeMode = function(type) {
  if (this.mode != type) {
    this.mode = type;
    $('.toolbox .currentMode').removeClass('currentMode');
    $('.toolbox [data-type="' + type + '"]').addClass('currentMode');

    if (this.mode == 'walls') {
      $('.edges').show();
      $('.edge.horizontal').hide();
    } else {
      $('.edges').hide();
    }
  }
}



/**
  Handles a selection within the floor toolbox panel.

  @param e The selection click event.
**/
WorldBuilder.prototype.flooringSelection = function(e) {
  this.changeMode(Modes.FLOORING);
  $('.panel .selected').removeClass('selected');

  if ($(e.delegateTarget).hasClass('hammer')) {
    this.selection = 'hammer';
  } else {
    var img = e.delegateTarget.firstElementChild;
    this.selection = $(img).attr('src');
  }

  $(e.delegateTarget).addClass('selected');
};



/**
  Handles a selection within the wall toolbox panel.

  @param e The selection click event.
**/
WorldBuilder.prototype.wallsSelection = function(e) {
  // Change the mode to be walls.
  this.changeMode(Modes.WALLS);
  // Remove the selected highlight from whatever was 
  // previously selected.
  $('.panel .selected').removeClass('selected');

  // If the clicked item is the hammer, we're in hammer mode!
  if ($(e.delegateTarget).hasClass('hammer')) {
    this.selection = 'hammer';
  // Otherwise, save the image source to use to draw.
  } else {
    var img = e.delegateTarget.firstElementChild;
    this.selection = $(img).attr('src');
  }

  // Add the selected highlight to the selection.
  $(e.delegateTarget).addClass('selected');
};



/**
  Draws a new wall to the wall context.

  @param edge The edge type to draw
  @param x    The x coordinate
  @param y    The y coordinate
**/
WorldBuilder.prototype.drawWalls = function(edge, x, y) {
  // Create a new image, set its onload function, and set the source
  var image = new Image();
  var builder = this;
  image.onload = function() {
    if (edge == Edges.CENTER) {
      builder.drawImageOnLoad(this, x, y - 1, builder.wallsContext);
    } else {
      builder.drawImageOnLoad(this, x, y, builder.wallsContext);
    }
  }
  // To find the kind of wall to draw, replace the "display" part of the
  // img path with the edge type.
  image.src = this.selection.replace('display', edge);
};



/**
  Called when the image to draw has been loaded.

  @param image   The image that's been loaded
  @param x       The x coordinate
  @param y       The y coordinate
  @param context The context to draw the image on
**/
WorldBuilder.prototype.drawImageOnLoad = function(image, x, y, context) {
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
  context.imageSmoothingEnabled = false;
  context.drawImage(this.manipCanvas, x * UNIT * MULT, y * UNIT * MULT);
};



/** Start application when window loads. **/ 
window.onload = function() {
  // Declaerd globally for debugging purposes
  builder = new WorldBuilder();
}