import { AIHelper } from './aiHelper';
import { Player, TileContent, UpgradeType } from './interfaces';
import { Map } from './map';
import { Point } from './point';
import { Tile } from './tile';

const PRICING_MAP: { [ key: number ]: number } = {
    0: 0,
    1: 15000,
    2: 50000,
    3: 100000,
    4: 250000,
    5: 500000
};

class Queue<T> {
    private store: T[] = [];

    public push(val: T) {
        this.store.push(val);
    }

    public pop(): T | undefined {
        if (this.size() <= 0) {
            return undefined;
        }

        return this.store.shift();
    }

    public size(): number {
        return this.store.length;
    }
}

export class Bot {
    protected playerInfo: Player;

    public constructor() {
    }

    /**
     * Gets called before ExecuteTurn. This is where you get your bot's state.
     * @param  {Player} playerInfo Your bot's current state.
     * @returns void
     */
    public beforeTurn(playerInfo: Player): void {
        this.playerInfo = playerInfo;
    }

    public findClosestResource(map: Map): Point {
        this.playerInfo.Position.visited = false;

        let q = new Queue<Point>();
        q.push(this.playerInfo.Position);
        while (q.size() > 0) {
            const current: Point = q.pop();
            current.visited = true;

            if (map.getTileAt(current) === TileContent.Resource) {
                return current;
            }

            const left: Tile = map.getRealTileAt(new Point(current.x - 1, current.y));
            if (left && left.position.visited === false && Point.distance(left.position, this.playerInfo.Position) < map.visibleDistance
                && left.tileType !== TileContent.Wall) {
                q.push(left.position);
            }

            const right: Tile = map.getRealTileAt(new Point(current.x + 1, current.y));
            if (right && right.position.visited === false && Point.distance(right.position, this.playerInfo.Position) < map.visibleDistance
                && right.tileType !== TileContent.Wall) {
                q.push(right.position);
            }

            const up: Tile = map.getRealTileAt(new Point(current.x, current.y + 1));
            if (up && up.position.visited === false && Point.distance(up.position, this.playerInfo.Position) < map.visibleDistance
                && up.tileType !== TileContent.Wall) {
                q.push(up.position);
            }

            const down: Tile = map.getRealTileAt(new Point(current.x, current.y - 1));
            if (down && down.position.visited === false && Point.distance(down.position, this.playerInfo.Position) < map.visibleDistance
                && down.tileType !== TileContent.Wall) {
                q.push(down.position);
            }
        }

        return null;
    }

    public resourceAround(map: Map, point: Point): Point {
        // Left
        if (map.getTileAt(new Point(point.x - 1, point.y)) === TileContent.Resource) {
            return new Point(-1, 0);
        }

        // Right
        if (map.getTileAt(new Point(point.x + 1, point.y)) === TileContent.Resource) {
            return new Point(1, 0);
        }

        // Up
        if (map.getTileAt(new Point(point.x, point.y + 1)) === TileContent.Resource) {
            return new Point(0, 1);
        }

        // Down
        if (map.getTileAt(new Point(point.x, point.y - 1)) === TileContent.Resource) {
            return new Point(0, -1);
        }

        return null;
    }

    public randomMove(): string {
        if (Math.round(Math.random()) === 0) {
            return AIHelper.createMoveAction(new Point(Math.round(Math.random()) === 0 ? -1 : 1, 0));
        }
        return AIHelper.createMoveAction(new Point(0, Math.round(Math.random()) === 0 ? -1 : 1));
    }

    /**
     * This is where you decide what action to take.
     * @param  {Map} map The gamemap.
     * @param  {Player[]} visiblePlayers The list of visible players.
     * @returns string The action to take(instanciate them with AIHelper)
     */
    public executeTurn(map: Map, visiblePlayers: Player[]): string {
        // Full? Run!
        if (this.playerInfo.CarriedResources === this.playerInfo.CarryingCapacity) {
            const xDistance: number = this.playerInfo.HouseLocation.x - this.playerInfo.Position.x;
            const yDistance: number = this.playerInfo.HouseLocation.y - this.playerInfo.Position.y;

            if (xDistance !== 0 &&
                map.getTileAt(new Point(this.playerInfo.Position.x + (xDistance > 0 ? 1 : -1), this.playerInfo.Position.y)) !==
                TileContent.Wall) {
                console.log('Moving to house in X.');
                return AIHelper.createMoveAction(new Point(xDistance > 0 ? 1 : -1, 0));
            }

            if (yDistance !== 0 &&
                map.getTileAt(new Point(this.playerInfo.Position.x, this.playerInfo.Position.y + (yDistance > 0 ? 1 : -1))) !==
                TileContent.Wall) {
                console.log('Moving to house in Y.');
                return AIHelper.createMoveAction(new Point(0, yDistance > 0 ? 1 : -1));
            }
        }

        // At home? Get some upgrades!
        if (Point.Equals(this.playerInfo.HouseLocation, this.playerInfo.Position)) {
            // Check the level of the collecting speed and carrying capacity and upgrade the lowest one if we have enough resources.
            const collectingSpeedLevel = this.playerInfo.UpgradeLevels[ UpgradeType.CollectingSpeed ];
            const carryingCapacityLevel = this.playerInfo.UpgradeLevels[ UpgradeType.CarryingCapacity ];

            if (collectingSpeedLevel < carryingCapacityLevel) {
                const pricing = PRICING_MAP[ collectingSpeedLevel + 1 ];
                if (pricing <= this.playerInfo.TotalResources) {
                    console.log('Upgrading collecting speed.');
                    return AIHelper.createUpgradeAction(UpgradeType.CollectingSpeed);
                }
            } else {
                const pricing = PRICING_MAP[ carryingCapacityLevel + 1 ];
                if (pricing <= this.playerInfo.TotalResources) {
                    console.log('Upgrading carrying capacity.');
                    return AIHelper.createUpgradeAction(UpgradeType.CarryingCapacity);
                }
            }
        }

        // Next to resource? Just mine.
        const direction: Point = this.resourceAround(map, this.playerInfo.Position);
        if (direction) {
            console.log('Collecting resource.');
            return AIHelper.createCollectAction(direction);
        }

        const closest: Point = this.findClosestResource(map);
        // Go to resource. (doesn't avoid walls for now)
        if (closest) {
            const xDistance: number = closest.x - this.playerInfo.Position.x;
            const yDistance: number = closest.y - this.playerInfo.Position.y;

            if (xDistance !== 0 &&
                map.getTileAt(new Point(this.playerInfo.Position.x + (xDistance > 0 ? 1 : -1), this.playerInfo.Position.y)) !==
                TileContent.Wall) {
                console.log('Moving to resource in X.');
                return AIHelper.createMoveAction(new Point(xDistance > 0 ? 1 : -1, 0));
            }

            if (yDistance !== 0 &&
                map.getTileAt(new Point(this.playerInfo.Position.x, this.playerInfo.Position.y + (yDistance > 0 ? 1 : -1))) !==
                TileContent.Wall) {
                console.log('Moving to resource in Y.');
                return AIHelper.createMoveAction(new Point(0, yDistance > 0 ? 1 : -1));
            }
        }

        console.log('Moving randomly.');
        // Couldn't find anything, randomly move to explore.
        return this.randomMove();
    }

    /**
     * Gets called after executeTurn;
     * @returns void
     */
    public afterTurn(): void {
    }
}
