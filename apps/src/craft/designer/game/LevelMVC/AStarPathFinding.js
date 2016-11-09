export default class AStarPathFinding {
  constructor(model) {
    this.levelModel = model;

    this.grid = this.createGrid();
  }

  createGrid() {
    let tempGrid = [];
    for (let i = 0; i < this.levelModel.actionPlane.length; i++) {
      let coordinates = this.levelModel.indexToXY(i);
      // Push node objects.
      tempGrid.push({
        x: coordinates.x,
        y: coordinates.y,
        cost: 1,    // cost is 1 so that all blocks are treated the same but could do something with lava, water.
        f: 0, g: 0, h: 0, visited: false, closed: false, parent: null
      });
    }
    return tempGrid;
  }

  reset() {
    for (let i = 0; i < this.grid.length; i++) {
      let node = this.grid[i];
      node.f = 0;
      node.g = 0;
      node.h = 0;
      node.visited = false;
      node.closed = false;
      node.parent = null;
    }
  }

  manhattanDistance(a, b) {
    const d1 = Math.abs (b.x - a.x);
    const d2 = Math.abs (b.y - a.y);
    return d1 + d2;
  }

  getNode(position) {
    const index = this.levelModel.coordinatesToIndex(position);
    if (this.levelModel.inBounds(position[0], position[1]) &&   // is the node within bounds
        this.levelModel.actionPlane[index].isEmpty &&           // is the node empty
        !this.grid[index].closed) {                             // has the node already been processed.
      return this.grid[index];
    }
    return null;
  }

  getNeighbors(node) {
    let neighbors = [];
    const west = this.getNode([node.x - 1, node.y]);
    const east = this.getNode([node.x + 1, node.y]);
    const south = this.getNode([node.x, node.y - 1]);
    const north = this.getNode([node.x, node.y + 1]);

    // west
    if (west) {
      neighbors.push(west);
    }

    // east
    if (east) {
      neighbors.push(east);
    }

    // south
    if (south) {
      neighbors.push(south);
    }

    // north
    if (north) {
      neighbors.push(north);
    }
    return neighbors;
  }

  findPath(startPosition, endPosition) {
    // Ensure we are in a starting state.
    this.reset();

    const startIndex = this.levelModel.coordinatesToIndex(startPosition);
    const endIndex = this.levelModel.coordinatesToIndex(endPosition);

    const endNode = this.grid[endIndex];

    let openList = [];

    // Push the starting node node to begin the algorithm.
    openList.push(this.grid[startIndex]);
    while (openList.length > 0) {
      // Get lowest f-scored node.
      let lowestFindex = 0;
      for (let i = 0; i < openList.length; i++) {
        if (openList[i].f < openList[lowestFindex].f) {
          lowestFindex = i;
        }
      }
      let currentNode = openList[lowestFindex];

      // Check if we've reached target and return path.
      if (currentNode === endNode) {
        let node = currentNode;
        let path = [];
        while (node.parent) {
          path.push(node);
          node = node.parent;
        }
        return path.reverse();
      }

      // process the current node.
      openList.splice(lowestFindex, 1); // Remove the node from the open list.
      currentNode.closed = true; // Flag this node as closed...

      // Find all non-closed, valid neighbors for the current node.
      let neighbors = this.getNeighbors(currentNode);

      for (let i = 0; i < neighbors.length; i++) {
        let neighbor = neighbors[i];

        let gScore = currentNode.g + neighbor.cost;
        let dirtyFlag = false;

        if (!neighbor.visited) {
          // First time we've arrived at this node, must be a better path.
          dirtyFlag = true;

          neighbor.visited = true;
          neighbor.h = this.manhattanDistance(neighbor, endNode);
          openList.push(neighbor);
        } else if (gScore < neighbor.g) {
          // We've already visited this node, but it now has a better score, let's try it again.
          dirtyFlag = true;
        }

        if (dirtyFlag) {
          neighbor.parent = currentNode;
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
        }
      }
    }

    // No path could be found, return empty array.
    return [];
  }
}
