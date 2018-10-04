import { TileContent } from './interfaces';
import { Point } from './point';

export class Tile {

    public tileType: TileContent;
    public position: Point;

    public constructor(content: TileContent, x: number, y: number) {
        this.tileType = content;
        this.position = new Point(x, y);
    }
}
