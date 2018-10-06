import { TileContent } from './interfaces';
import { Tile, ResourceTile } from './tile';
import { Point } from './point';


export class Map {

    public tiles: Tile[][];
    public xMin: number;
    public yMin: number;
    private xMax: number;
    private yMax: number;
    private _wallsAreBreakable: boolean;

    // tslint:disable-next-line:variable-name
    private _visibleDistance: number;

    /**
     * How far your Bot can see.
     * @returns number
     */
    public get visibleDistance(): number {
        return this._visibleDistance;
    }

    /**
     * If the walls (trees) are breakable
     * @returns boolean
     */
    public get wallsAreBreakable(): boolean {
        return this._wallsAreBreakable;
    }

    public constructor(customSerializedMap: string, xMin: number, yMin: number, wallsAreBreakable: boolean) {
        this.xMin = xMin;
        this.yMin = yMin;
        this._wallsAreBreakable = wallsAreBreakable;
        this.deserializeMap(customSerializedMap);
        this.initMapSize();
    }

    /**
     *  Returns the TileContent at this location. If you try to look outside
     *  of your visible region, it will always return TileContent.Empty.
     *
     *  Negative values are valid since the map wraps around when you reach
     *  the end.
     * @param  {Point} position The tile's position.
     * @returns TileContent The content of the tile.
     */
    public getTileAt(position: Point): TileContent {
        if (position.x < this.xMin || position.x >= this.xMax || position.y < this.yMin || position.y >= this.yMax) {
            return TileContent.Empty;
        }
        const x = position.x - this.xMin;
        const y = position.y - this.yMin;
        return this.tiles[x][y].TileType;
    }

    public getRealTileAt(position: Point): Tile {
        if (position.x < this.xMin || position.x >= this.xMax || position.y < this.yMin || position.y >= this.yMax) {
            return null;
        }
        const x = position.x - this.xMin;
        const y = position.y - this.yMin;
        return this.tiles[x][y];
    }

    /**
     * Deserialize the map received from the game server.
     * DO NOT MODIFY THIS.
     * @param  {string} serializedMap The map received from the server.
     * @returns void
     */
    private deserializeMap(serializedMap: string): void {
        serializedMap = serializedMap.substring(1, serializedMap.length - 2);
        const rows = serializedMap.split('[');
        let column = rows[1].split('{');
        this.tiles = new Array<Tile[]>();
        for (let i = 0; i < rows.length - 1; i++) {
            this.tiles[i] = new Array<Tile>();
            column = rows[i + 1].split('{');
            for (let j = 0; j < column.length - 1; j++) {
                let tileType = TileContent.Empty;
                if (column[j + 1][0] !== '}') {
                    const infos = column[j + 1].split('}') as any;
                    tileType = parseInt(infos[0], 10) as TileContent;
                    if (tileType === TileContent.Resource) {
                        const amountLeft = parseInt(infos[0].split(',')[1], 10);
                        const density = parseInt(infos[0].split(',')[2], 10);
                        this.tiles[i][j] = new ResourceTile(
                            tileType, i, j,
                            amountLeft, density
                        );
                    }
                }
                if (tileType !== TileContent.Resource) {
                    this.tiles[i][j] = new Tile(tileType, i + this.xMin, j + this.yMin);
                }
            }
        }
    }

    /**
     * Initializes the XMax, YMax and VisibleDistance.
     * @returns void
     */
    private initMapSize(): void {
        if (this.tiles !== undefined) {
            this.xMax = this.xMin + this.tiles.length;
            this.yMax = this.yMin + this.tiles[0].length;
            this._visibleDistance = (this.xMax - this.xMin - 1) / 2;
        }
    }
}
