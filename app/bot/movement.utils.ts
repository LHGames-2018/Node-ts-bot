const AStarAlgorithm = require('a-star');

import { TileContent } from '../helper/interfaces';
import { Map } from '../helper/map';
import { Point } from '../helper/point';

export function AStarNextPoint(start: Point, end: Point, map: Map): Point {
  if (!map.getRealTileAt(end)) {
    return null;
  }

  const path: { status: 'success' | 'noPath' | 'timeout', path: Point[] } = AStarAlgorithm({
    start: start,
    isEnd: (node: Point) => {
      return Point.Equals(node, end);
    },
    neighbor: (node: Point) => {
      const neighbors: Point[] = [];

      // Left
      let point = new Point(node.x - 1, node.y);
      let tile = map.getRealTileAt(point);
      if (tile) {
        if (tile.TileType === TileContent.Empty || tile.TileType === TileContent.Wall || tile.TileType === TileContent.House || Point.Equals(
          point, end)) {
          if (tile.TileType !== TileContent.Wall || (tile.TileType === TileContent.Wall && map.wallsAreBreakable)) {
            neighbors.push(point);
          }
        }
      }

      // right
      point = new Point(node.x + 1, node.y);
      tile = map.getRealTileAt(point);
      if (tile) {
        if (tile.TileType === TileContent.Empty || tile.TileType === TileContent.Wall || tile.TileType === TileContent.House || Point.Equals(
          point, end)) {
          if (tile.TileType !== TileContent.Wall || (tile.TileType === TileContent.Wall && map.wallsAreBreakable)) {
            neighbors.push(point);
          }
        }
      }

      // up
      point = new Point(node.x, node.y + 1);
      tile = map.getRealTileAt(point);
      if (tile) {
        if (tile.TileType === TileContent.Empty || tile.TileType === TileContent.Wall || tile.TileType === TileContent.House || Point.Equals(
          point, end)) {
          if (tile.TileType !== TileContent.Wall || (tile.TileType === TileContent.Wall && map.wallsAreBreakable)) {
            neighbors.push(point);
          }
        }
      }

      // down
      point = new Point(node.x, node.y - 1);
      tile = map.getRealTileAt(point);
      if (tile) {
        if (tile.TileType === TileContent.Empty || tile.TileType === TileContent.Wall || tile.TileType === TileContent.House || Point.Equals(
          point, end)) {
          if (tile.TileType !== TileContent.Wall || (tile.TileType === TileContent.Wall && map.wallsAreBreakable)) {
            neighbors.push(point);
          }
        }
      }

      return neighbors;
    },
    distance: (node1: Point, node2: Point) => {
      return Point.distance(node1, node2);
    },
    heuristic: (node: Point) => {
      return Math.abs(end.x - node.x) + Math.abs(end.y - node.y);
    },
    hash: (node: Point) => {
      return [node.x, node.y].join(',');
    },
  });

  if (path.status === 'success' && path.path.length >= 2 && !Point.Equals(path.path[0], path.path[1])) {
    return path.path[1];
  }

  return null;
}
