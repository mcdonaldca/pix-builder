function World() {
  this.cells = {};

  for (var x = 0; x < WIDTH; x++) {
    this.cells[x] = {};
    for (var y = 0; y < HEIGHT; y++) {
      this.cells[x][y] = new Cell(x, y);
    }
  }

  this.Parts = {
    TOP: 'top',
    MIDDLE: 'middle',
    BOTTOM: 'bottom',
  }
}



World.prototype.addFlooring= function(x, y, flooring) {
  this.cells[x][y].setFlooring(flooring);
}



World.prototype.removeFlooring= function(x, y) {
  this.cells[x][y].removeFlooring();
}



World.prototype.addWall= function(x, y, wall, edge) {
  switch(edge) {
    case Edges.RIGHT:
    case Edges.LEFT:
      this.cells[x][y].setWall(wall, edge);
      break;

    case Edges.CENTER:
      var changeCells = [
        { x: x, y: y - 1, value: this.Parts.TOP },
        { x: x, y: y, value: this.Parts.MIDDLE },
        { x: x, y: y + 1, value: this.Parts.BOTTOM },
      ];

      for (var i = 0; i < changeCells.length; i++) {
        var cell = this.cells[changeCells[i].x][changeCells[i].y];

        if (cell) {
          if (cell.hasSideWall()) cell.clearSideWalls();
          cell.setWall(wall, edge, changeCells[i].value);
        }
      }
      break;

    default:
      break;
  }

  return this.getWalls(x, y);
}



World.prototype.getWalls = function(x, y) {
  return [];
}