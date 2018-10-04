import { Point } from './point';

export interface GameInfo {
    Player: IPlayer;
    CustomSerializedMap: string;
    OtherPlayers: IPlayer[];
    xMin: number;
    yMin: number;
}

export interface IPlayer {
    Health: number;
    MaxHealth: number;
    CarriedResources: number;
    CarryingCapacity: number;
    CollectingSpeed: number;
    AttackPower: number;
    Defence: number;
    TotalResources: number;
    Position: Point;
    HouseLocation: Point;
    Score: number;
    Name: string;
    UpgradeLevels: number[];
    CarriedItems: PurchasableItem[];
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
    MicrosoftSword,
    UbisoftShield,
    DevolutionsBackpack,
    DevolutionsPickaxe,
    HealthPotion,
}
