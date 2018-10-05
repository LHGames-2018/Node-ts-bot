const aStar = require('a-star');

import { AIHelper } from '../helper/aiHelper';
import { Player, PurchasableItem, TileContent, UpgradeType } from '../helper/interfaces';
import { Map } from '../helper/map';
import { Point } from '../helper/point';

const ITEM_COST = 30000;

const PRICING_MAP: { [key: number]: number } = {
    0: 0,
    1: 15000,
    2: 50000,
    3: 100000,
    4: 250000,
    5: 500000,
};

function PrintTileSymbol(tileContent: TileContent): string {
    switch (tileContent) {
        case TileContent.Wall:
            return 't';
        case TileContent.House:
            return 'h';
        case TileContent.Empty:
            return '-';
        case TileContent.Resource:
            return 'r';
        case TileContent.Shop:
            return 's';
        case TileContent.Player:
            return 'p';
        case TileContent.Lava:
            return 'l';
        default:
            return '?';
    }
}

function PrintMap(map: Map) {
    for (let i = 0; i < map.tiles.length; ++i) {
        let out = '';
        for (let j = 0; j < map.tiles[i].length; ++j) {
            out += PrintTileSymbol(map.tiles[i][j].tileType);
        }

        console.log(out);
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

    public findInMap(map: Map, tileContent: TileContent): Point {
        for (let i = map.xMin; i < map.visibleDistance * 2 + 1 + map.xMin; ++i) {
            for (let j = map.yMin; j < map.visibleDistance * 2 + 1 + map.yMin; ++j) {
                const position = new Point(i, j);
                if (map.getTileAt(position) === tileContent) {
                    return position;
                }
            }
        }

        return null;
    }

    public tileAround(map: Map, point: Point, content: TileContent): Point {
        // Left
        if (map.getTileAt(new Point(point.x - 1, point.y)) === content) {
            return new Point(-1, 0);
        }

        // Right
        if (map.getTileAt(new Point(point.x + 1, point.y)) === content) {
            return new Point(1, 0);
        }

        // Up
        if (map.getTileAt(new Point(point.x, point.y + 1)) === content) {
            return new Point(0, 1);
        }

        // Down
        if (map.getTileAt(new Point(point.x, point.y - 1)) === content) {
            return new Point(0, -1);
        }

        return null;
    }

    public findNextMoveTo(map: Map, end: Point): string {
        // Inside of map, find path with dijkstra.
        if (map.getRealTileAt(end)) {
            const path = aStar({
                                   start: this.playerInfo.Position,
                                   isEnd: (node: Point) => {
                                       return Point.Equals(node, end);
                                   },
                                   neighbor: (node: Point) => {
                                       const neighbors: Point[] = [];

                                       // Left
                                       let p = new Point(node.x - 1, node.y);
                                       let c = map.getTileAt(p);
                                       if (c === TileContent.Empty || c === TileContent.Wall || c === TileContent.House || Point.Equals(p, end)) {
                                           neighbors.push(p);
                                       }

                                       // right
                                       p = new Point(node.x + 1, node.y);
                                       c = map.getTileAt(p);
                                       if (c === TileContent.Empty || c === TileContent.Wall || c === TileContent.House || Point.Equals(p, end)) {
                                           neighbors.push(p);
                                       }

                                       // up
                                       p = new Point(node.x, node.y + 1);
                                       c = map.getTileAt(p);
                                       if (c === TileContent.Empty || c === TileContent.Wall || c === TileContent.House || Point.Equals(p, end)) {
                                           neighbors.push(p);
                                       }

                                       // down
                                       p = new Point(node.x, node.y - 1);
                                       c = map.getTileAt(p);
                                       if (c === TileContent.Empty || c === TileContent.Wall || c === TileContent.House || Point.Equals(p, end)) {
                                           neighbors.push(p);
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

            if (path.path.length >= 2) {
                const pXY = path.path[1];
                const content = map.getTileAt(new Point(pXY.x, pXY.y));
                if (content === TileContent.Empty || content === TileContent.House) {
                    if (pXY.x !== this.playerInfo.Position.x) {
                        console.log('Dijkstra to point in X.');
                        return AIHelper.createMoveAction(new Point(pXY.x - this.playerInfo.Position.x, 0));
                    }

                    console.log('Dijkstra to point in Y.');
                    return AIHelper.createMoveAction(new Point(0, pXY.y - this.playerInfo.Position.y));
                } else {
                    if (pXY.x !== this.playerInfo.Position.x) {
                        console.log('Dijkstra destroy tree in X.');
                        return AIHelper.createAttackAction(new Point(pXY.x - this.playerInfo.Position.x, 0));
                    }

                    console.log('Dijkstra destroy tree in Y.');
                    return AIHelper.createAttackAction(new Point(0, pXY.y - this.playerInfo.Position.y));
                }
            }
        }

        // Otherwise, randomly move to target.
        let xDistance: number = end.x - this.playerInfo.Position.x;
        let yDistance: number = end.y - this.playerInfo.Position.y;

        if (xDistance < 0) {
            xDistance = -1;
        } else if (xDistance > 0) {
            xDistance = 1;
        }

        if (yDistance < 0) {
            yDistance = -1;
        } else if (yDistance > 0) {
            yDistance = 1;
        }

        let content: TileContent;

        if (xDistance !== 0) {
            content = map.getTileAt(new Point(this.playerInfo.Position.x + xDistance, this.playerInfo.Position.y));
            if (content === TileContent.Empty || content === TileContent.House) {
                console.log('Moving to point in X.');
                return AIHelper.createMoveAction(new Point(xDistance, 0));
            }

            if (content === TileContent.Wall) {
                console.log('Destroying tree in X.');
                return AIHelper.createAttackAction(new Point(xDistance, 0));
            }
        }

        if (yDistance !== 0) {
            content = map.getTileAt(new Point(this.playerInfo.Position.x, this.playerInfo.Position.y + yDistance));
            if (content === TileContent.Empty || content === TileContent.House) {
                console.log('Moving to point in Y.');
                return AIHelper.createMoveAction(new Point(0, yDistance));
            }

            if (content === TileContent.Wall) {
                console.log('Destroying tree in Y.');
                return AIHelper.createAttackAction(new Point(0, yDistance));
            }
        }

        return null;
    }

    public randomMove(): string {
        if (Math.round(Math.random()) === 0) {
            console.log('Random move in X.');
            return AIHelper.createMoveAction(new Point(Math.round(Math.random()) === 0 ? -1 : 1, 0));
        }

        console.log('Random move in Y.');
        return AIHelper.createMoveAction(new Point(0, Math.round(Math.random()) === 0 ? -1 : 1));
    }

    public biasedSafeRandom(map: Map): string {
        let content: TileContent;

        // Roam if not found.
        if (Math.round(Math.random()) > 0.4) {
            content = map.getTileAt(new Point(this.playerInfo.Position.x + 1, this.playerInfo.Position.y));
            if (content === TileContent.Empty || content === TileContent.House) {
                console.log('Biased move in X.');
                return AIHelper.createMoveAction(new Point(1, 0));
            }

            if (content === TileContent.Wall) {
                console.log('Biased destroy tree in X.');
                return AIHelper.createAttackAction(new Point(1, 0));
            }
        }

        content = map.getTileAt(new Point(this.playerInfo.Position.x, this.playerInfo.Position.y + 1));
        if (content === TileContent.Empty || content === TileContent.House) {
            console.log('Biased move in Y.');
            return AIHelper.createMoveAction(new Point(0, 1));
        }

        if (content === TileContent.Wall) {
            console.log('Biased destroy tree in Y.');
            return AIHelper.createAttackAction(new Point(0, 1));
        }

        if (Math.round(Math.random()) > 0.5) {
            content = map.getTileAt(new Point(this.playerInfo.Position.x - 1, this.playerInfo.Position.y));
            if (content === TileContent.Empty || content === TileContent.House) {
                console.log('Biased reverse move in X.');
                return AIHelper.createMoveAction(new Point(-1, 0));
            }

            if (content === TileContent.Wall) {
                console.log('Biased reverse destroy tree in X.');
                return AIHelper.createAttackAction(new Point(-1, 0));
            }
        }

        content = map.getTileAt(new Point(this.playerInfo.Position.x, this.playerInfo.Position.y + 1));
        if (content === TileContent.Empty || content === TileContent.House) {
            console.log('Biased reverse move in Y.');
            return AIHelper.createMoveAction(new Point(0, 1));
        }

        if (content === TileContent.Wall) {
            console.log('Biased reverse destroy tree in Y.');
            return AIHelper.createAttackAction(new Point(0, 1));
        }

        return null;
    }

    /**
     * This is where we look for roaming option (shop, attack, steal)
     */
    public roam(map: Map, visiblePlayers: Player[]): string {
        // Enough to buy item, let's go.
        if (this.playerInfo.TotalResources >= ITEM_COST) {
            if (this.tileAround(map, this.playerInfo.Position, TileContent.Shop)) {
                console.log('Purchase sword.');
                if (this.playerInfo.CarriedItems.findIndex((item) => item === PurchasableItem.Sword) < 0) {
                    return AIHelper.createPurchaseAction(PurchasableItem.Sword);
                } else if (this.playerInfo.CarriedItems.findIndex((item) => item === PurchasableItem.Shield) < 0) {
                    return AIHelper.createPurchaseAction(PurchasableItem.Shield);
                } else if (this.playerInfo.CarriedItems.findIndex((item) => item === PurchasableItem.Backpack) < 0) {
                    return AIHelper.createPurchaseAction(PurchasableItem.Backpack);
                } else if (this.playerInfo.CarriedItems.findIndex((item) => item === PurchasableItem.Pickaxe) < 0) {
                    return AIHelper.createPurchaseAction(PurchasableItem.Pickaxe);
                } else if (this.playerInfo.CarriedItems.findIndex((item) => item === PurchasableItem.HealthPotion) < 0) {
                    return AIHelper.createPurchaseAction(PurchasableItem.HealthPotion);
                }
            }

            const shopPosition = this.findInMap(map, TileContent.Shop);
            if (shopPosition) {
                const action1 = this.findNextMoveTo(map, shopPosition);
                if (action1) {
                    return action1;
                }
            }

            const action = this.biasedSafeRandom(map);
            if (action) {
                return action;
            }
        }

        // Look for a player to kill or a house to steal from.
        // let playerPosition: Point = null;
        // for (const player of visiblePlayers) {
        //     if (playerPosition) {
        //         if (Point.distance(this.playerInfo.Position, playerPosition) > Point.distance(this.playerInfo.Position, player.Position)) {
        //             playerPosition = player.Position;
        //         }
        //     } else {
        //         playerPosition = player.Position;
        //     }
        // }
        //
        // if (playerPosition) {
        //
        // }

        const action = this.biasedSafeRandom(map);
        if (action) {
            return action;
        }

        return null;
    }

    /**
     * This is where you decide what action to take.
     * @param  {Map} map The gamemap.
     * @param  {Player[]} visiblePlayers The list of visible players.
     * @returns string The action to take(instanciate them with AIHelper)
     */
    public executeTurn(map: Map, visiblePlayers: Player[]): string {
        // Player next to me? Beat him up.
        const playerDirection: Point = this.tileAround(map, this.playerInfo.Position, TileContent.Player);
        if (playerDirection) {
            console.log('Attacking player.');
            return AIHelper.createAttackAction(playerDirection);
        }

        // Roaming mode if the walls are breakable, we have cumulated enough resources and we are not full.
        // if (map.wallsAreBreakable && this.playerInfo.TotalResources >= ITEM_COST
        //   && this.playerInfo.CarriedResources !== this.playerInfo.CarryingCapacity) {
        if (map.wallsAreBreakable) {
            const roamMove = this.roam(map, visiblePlayers);
            if (roamMove) {
                return roamMove;
            }
        }

        // Full? Run!
        if (this.playerInfo.CarriedResources === this.playerInfo.CarryingCapacity) {
            const action = this.findNextMoveTo(map, this.playerInfo.HouseLocation);
            if (action) {
                return action;
            }
        }

        // At home? Get some upgrades!
        if (Point.Equals(this.playerInfo.HouseLocation, this.playerInfo.Position)) {
            // Check the level of the collecting speed and carrying capacity and upgrade the lowest one if we have enough resources.
            const collectingSpeedLevel = this.playerInfo.getUpgradeLevel(UpgradeType.CollectingSpeed);
            const carryingCapacityLevel = this.playerInfo.getUpgradeLevel(UpgradeType.CarryingCapacity);
            const attackPowerLevel = this.playerInfo.getUpgradeLevel(UpgradeType.AttackPower);
            const defenceLevel = this.playerInfo.getUpgradeLevel(UpgradeType.Defence);

            // Go for attack power when collecting is at a threshold level.
            if ((collectingSpeedLevel + carryingCapacityLevel) - attackPowerLevel >= 2 || attackPowerLevel === 0) {
                const pricing = PRICING_MAP[attackPowerLevel + 1];
                if (pricing <= this.playerInfo.TotalResources) {
                    console.log('Upgrading attack power.');
                    return AIHelper.createUpgradeAction(UpgradeType.AttackPower);
                }
            }

            if ((collectingSpeedLevel + carryingCapacityLevel) - defenceLevel >= 2) {
                const pricing = PRICING_MAP[defenceLevel + 1];
                if (pricing <= this.playerInfo.TotalResources) {
                    console.log('Upgrading defence.');
                    return AIHelper.createUpgradeAction(UpgradeType.Defence);
                }
            }

            if (collectingSpeedLevel < carryingCapacityLevel) {
                const pricing = PRICING_MAP[collectingSpeedLevel + 1];
                if (pricing <= this.playerInfo.TotalResources) {
                    console.log('Upgrading collecting speed.');
                    return AIHelper.createUpgradeAction(UpgradeType.CollectingSpeed);
                }
            } else {
                const pricing = PRICING_MAP[carryingCapacityLevel + 1];
                if (pricing <= this.playerInfo.TotalResources) {
                    console.log('Upgrading carrying capacity.');
                    return AIHelper.createUpgradeAction(UpgradeType.CarryingCapacity);
                }
            }
        }

        // Next to resource? Just mine.
        const resourceDirection: Point = this.tileAround(map, this.playerInfo.Position, TileContent.Resource);
        if (resourceDirection) {
            console.log('Collecting resource.');
            return AIHelper.createCollectAction(resourceDirection);
        }

        const point = this.findInMap(map, TileContent.Resource);
        if (point) {
            const action = this.findNextMoveTo(map, point);
            if (action) {
                return action;
            }
        }

        // Couldn't find anything, randomly move to explore.
        const action = this.biasedSafeRandom(map);
        if (action) {
            return action;
        }

        return this.randomMove();
    }

    /**
     * Gets called after executeTurn;
     * @returns void
     */
    public afterTurn(): void {
    }
}
