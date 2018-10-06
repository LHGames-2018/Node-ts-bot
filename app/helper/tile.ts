import { TileContent } from './interfaces';
import { Point } from './point';

export class Tile {

    public TileType: TileContent;
    public Position: Point;

    public constructor(content: TileContent, x: number, y: number) {
        this.TileType = content;
        this.Position = new Point(x, y);
    }
}

export class ResourceTile extends Tile {
    public AmountLeft: number;
    public Density: number;

    public constructor(content: TileContent, x: number, y: number, amountLeft: number, density: number) {
        super(content, x, y);
        this.AmountLeft = amountLeft;
        this.Density = density;
    }
}