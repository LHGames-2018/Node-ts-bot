import { Point } from './point';

export interface GameInfo {
    Player: Player;
    CustomSerializedMap: string;
    Leaderboard: string[];
    OtherPlayers: Player[];
    xMin: number;
    yMin: number;
    WallsAreBreakable: boolean;
}

export interface IPlayer {
    Health: number;
    MaxHealth: number;
    CarriedResources: number;
    CarryingCapacity: number;
    CollectingSpeed: number;
    TotalResources: number;
    AttackPower: number;
    Defence: number;
    Position: Point;
    HouseLocation: Point;
    CarriedItems: PurchasableItem[];
    Score: number;
    Name: string;
    UpgradeLevels: number[];
    getUpgradeLevel(type: UpgradeType): number;
}

export class Player implements IPlayer {
    public Health: number;
    public MaxHealth: number;
    public CarriedResources: number;
    public CarryingCapacity: number;
    public CollectingSpeed: number;
    public TotalResources: number;
    public AttackPower: number;
    public Defence: number;
    public Position: Point;
    public HouseLocation: Point;
    public CarriedItems: PurchasableItem[];
    public Score: number;
    public Name: string;
    public UpgradeLevels: number[];

    public getUpgradeLevel(type: UpgradeType): number {
        return this.UpgradeLevels[type];
    }
}

export enum TileContent {
    Empty,
    Wall,
    House,
    Lava,
    Resource,
    Shop,
    Player
}

export enum UpgradeType {
    CarryingCapacity,
    AttackPower,
    Defence,
    MaximumHealth,
    CollectingSpeed
}

export enum PurchasableItem {
    Sword,
    Shield,
    Backpack,
    Pickaxe,
    HealthPotion,
}
