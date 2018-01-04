function Cell(x, y) {
  this.x = x;
  this.y = y;

  this.hasFlooring = false;
  this.hasWall = false;

  this.flooringType = undefined;
  this.wallType = undefined;
  this.walls = {};
}



Cell.prototype.setFlooring= function(flooring) {
  this.hasFlooring = true;
  this.flooringType = flooring;
}



Cell.prototype.removeFlooring= function() {
  this.hasFlooring = false;
  this.flooringType = undefined;
}



Cell.prototype.setWall= function(wall, edge, value) {
  this.hasWall = true;
  this.wallType = wall;
  this.walls[edge] = edge == Edges.CENTER ? value : 1;
}



Cell.prototype.hasSideWall = function() {
  return Edges.RIGHT in this.walls || Edges.LEFT in this.walls;
}



Cell.prototype.clearSideWalls = function() {
  if (this.walls[Edges.RIGHT]) delete this.walls[Edges.RIGHT]
  if (this.walls[Edges.LEFT]) delete this.walls[Edges.LEFT]
}