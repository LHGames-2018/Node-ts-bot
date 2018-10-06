import { AIHelper } from '../helper/aiHelper';
import { Player, PurchasableItem, TileContent, UpgradeType } from '../helper/interfaces';
import { Map } from '../helper/map';
import { Point } from '../helper/point';
import { PrintMap } from './log.utils';
import { AStarNextPoint } from './movement.utils';

const ITEM_COST = 30000;

const PRICING_MAP: { [key: number]: number } = {
  0: 0,
  1: 15000,
  2: 50000,
  3: 100000,
  4: 250000,
  5: 500000,
};

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

  public findInMap(map: Map, start: Point, tileContent: TileContent): Point {
    for (let i = map.xMin; i < map.visibleDistance * 2 + 1 + map.xMin; ++i) {
      for (let j = map.yMin; j < map.visibleDistance * 2 + 1 + map.yMin; ++j) {
        const position = new Point(i, j);
        if (map.getTileAt(position) === tileContent && AStarNextPoint(start, position, map)) {
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
    const nextPoint = AStarNextPoint(this.playerInfo.Position, end, map);

    if (nextPoint) {
      const content = map.getTileAt(nextPoint);
      if (content === TileContent.Empty || content === TileContent.House) {
        console.log('AStar movement.');
        return AIHelper.createMoveAction(Point.Direction(this.playerInfo.Position, nextPoint));
      } else if (content === TileContent.Player || content === TileContent.Wall) {
        console.log('AStar attack.');
        return AIHelper.createAttackAction(Point.Direction(this.playerInfo.Position, nextPoint));
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

  /**
   * This is where we look for roaming option (shop, attack, steal)
   */
  public roam(map: Map, visiblePlayers: Player[]): string {
    // Enough to buy item, let's go.
    if (this.playerInfo.TotalResources >= ITEM_COST) {
      // Shop is around, buy now.
      if (this.tileAround(map, this.playerInfo.Position, TileContent.Shop)) {
        if (this.playerInfo.CarriedItems.findIndex((item) => item === PurchasableItem.Sword) < 0) {
          console.log('Purchase sword.');
          return AIHelper.createPurchaseAction(PurchasableItem.Sword);
        } else if (this.playerInfo.CarriedItems.findIndex((item) => item === PurchasableItem.Shield) < 0) {
          console.log('Purchase shield.');
          return AIHelper.createPurchaseAction(PurchasableItem.Shield);
        } else if (this.playerInfo.CarriedItems.findIndex((item) => item === PurchasableItem.Backpack) < 0) {
          console.log('Purchase backpack.');
          return AIHelper.createPurchaseAction(PurchasableItem.Backpack);
        } else if (this.playerInfo.CarriedItems.findIndex((item) => item === PurchasableItem.Pickaxe) < 0) {
          console.log('Purchase pickaxe.');
          return AIHelper.createPurchaseAction(PurchasableItem.Pickaxe);
        } else if (this.playerInfo.CarriedItems.findIndex((item) => item === PurchasableItem.HealthPotion) < 0) {
          console.log('Purchase health potion.');
          return AIHelper.createPurchaseAction(PurchasableItem.HealthPotion);
        }
      }

      const shopPosition = this.findInMap(map, this.playerInfo.Position, TileContent.Shop);
      if (shopPosition) {
        const move = this.findNextMoveTo(map, shopPosition);
        if (move) {
          return move;
        }
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


    let move1: string;
    if (Math.random() > 0.7) {
      move1 = this.findNextMoveTo(map, new Point(this.playerInfo.Position.x + 5, this.playerInfo.Position.y));
    } else {
      move1 = this.findNextMoveTo(map, new Point(this.playerInfo.Position.x, this.playerInfo.Position.y + 5));
    }
    if (move1) {
      return move1;
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
    PrintMap(map);
    console.log(`Player resource carrying(${this.playerInfo.CarriedResources}) total(${this.playerInfo.TotalResources})`);
    console.log(`Player at x(${this.playerInfo.Position.x}) y(${this.playerInfo.Position.y})`);
    console.log(`Player house at x(${this.playerInfo.HouseLocation.x}) y(${this.playerInfo.HouseLocation.y})`);
    // Player next to me? Beat him up.
    const playerDirection: Point = this.tileAround(map, this.playerInfo.Position, TileContent.Player);
    if (playerDirection) {
      console.log('Attacking player.');
      return AIHelper.createAttackAction(playerDirection);
    }

    // Roaming mode if the walls are breakable, we have cumulated enough resources and we are not full.
    if (map.wallsAreBreakable && this.playerInfo.TotalResources >= ITEM_COST
      && this.playerInfo.CarriedResources !== this.playerInfo.CarryingCapacity) {
      const roamMove = this.roam(map, visiblePlayers);
      if (roamMove) {
        return roamMove;
      }
    }

    // Full? Run!
    if (this.playerInfo.CarriedResources === this.playerInfo.CarryingCapacity) {
      let action = this.findNextMoveTo(map, this.playerInfo.HouseLocation);
      if (action) {
        console.log('For house.');
        return action;
      }

      const direction = Point.Direction(this.playerInfo.Position, this.playerInfo.HouseLocation);
      action = this.findNextMoveTo(map, new Point(this.playerInfo.Position.x + direction.x * 10, this.playerInfo.Position.y + direction.y * 10));
      if (action) {
        console.log('For house.');
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

    const point = this.findInMap(map, this.playerInfo.Position, TileContent.Resource);
    if (point) {
      const action = this.findNextMoveTo(map, point);
      if (action) {
        console.log(`For resource at x(${point.x}) y(${point.y})`);
        return action;
      }
    }

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
