import { UpgradeType, PurchasableItem } from './interfaces';
import { Point } from './point';

export class AIHelper {

    /**
     * Creates a steal Action. You can only steal from Adjacent tiles
     * (no diagonals).
     * @param  {Point} direction The direction from which you want to steal.
     * @returns string The steal Action.
     */
    public static createStealAction(direction: Point): string {
        return AIHelper.createAction('StealAction', direction);
    }

    /**
     * Creates a melee attack Action. You can only attack someone on an
     * Adjacent tile. (no diagonals).
     * @param  {Point} direction The direction of your target.
     * @returns string The attack Action.
     */
    public static createAttackAction(direction: Point): string {
        return AIHelper.createAction('MeleeAttackAction', direction);
    }

    /**
     * Creates a Collect Action. You can only collect resources from
     * Adjacent tiles (no diagonals).
     * @param  {Point} direction The direction from which you want to collect.
     * @returns string The collect Action.
     */
    public static createCollectAction(direction: Point): string {
        return AIHelper.createAction('CollectAction', direction);
    }

    /**
     * Creates a move action to the specified direction. You can only move
     * to adjacent tiles (no diagonals).
     * @param  {Point} direction The direction in which you want to move.
     * @returns string The move action.
     */
    public static createMoveAction(direction: Point): string {
        return AIHelper.createAction('MoveAction', direction);
    }

    /**
     * Instanciates a heal action. The action will fail if you don't have
     * any healing potions available.
     * @returns string The heal action.
     */
    public static createHealAction(): string {
        return JSON.stringify({ ActionName: 'HealAction', Content: '' });
    }

    /**
     * Creates a purchase action for the specified item. You need to be ON
     * a shop tile for this action to succeed. If you are on any other
     * type of tile, the action will fail. You can only carry 1 of each
     * item, except for health potions.
     * @param  {PurchasableItem} item The type of item to purchase.
     * @returns string The purchase Action.
     */
    public static createPurchaseAction(item: PurchasableItem): string {
        let action;
        switch (item) {
            case PurchasableItem.Backpack:
                action = { ActionName: 'PurchaseAction', Content: 'Backpack' };
                break;
            case PurchasableItem.Pickaxe:
                action = { ActionName: 'PurchaseAction', Content: 'Pickaxe' };
                break;
            case PurchasableItem.HealthPotion:
                action = { ActionName: 'PurchaseAction', Content: 'HealthPotion' };
                break;
            case PurchasableItem.Sword:
                action = { ActionName: 'PurchaseAction', Content: 'Sword' };
                break;
            case PurchasableItem.Shield:
                action = { ActionName: 'PurchaseAction', Content: 'Shield' };
                break;
        }
        return JSON.stringify(action);
    }

    /**
     * Creates an upgrade action for the specified Upgrade. You muse be in
     * your house to upgrade your player. The action will fail if you do
     * not have enough resources or are not on your house or are already
     * at max upgrade for this type.
     * @param  {UpgradeType} upgrade The type of the upgrade.
     * @returns string The upgrade action.
     */
    public static createUpgradeAction(upgrade: UpgradeType): string {
        let action: string;
        switch (upgrade) {
            case UpgradeType.CollectingSpeed:
                action = JSON.stringify({ ActionName: 'UpgradeAction', Content: 'CollectingSpeed' });
                break;
            case UpgradeType.CarryingCapacity:
                action = JSON.stringify({ ActionName: 'UpgradeAction', Content: 'CarryingCapacity' });
                break;
            case UpgradeType.AttackPower:
                action = JSON.stringify({ ActionName: 'UpgradeAction', Content: 'AttackPower' });
                break;
            case UpgradeType.Defence:
                action = JSON.stringify({ ActionName: 'UpgradeAction', Content: 'Defence' });
                break;
            case UpgradeType.MaximumHealth:
                action = JSON.stringify({ ActionName: 'UpgradeAction', Content: 'MaximumHealth' });
                break;
        }
        console.log(action);
        return action;
    }
    /**
     * Creates an action that does nothing.
     * @returns string Empty action.
     */
    public static createEmptyAction(): string {
        return '';
    }

    private static createAction(name: string, target: Point): string {
        const action = {
            ActionName: name,
            Content: JSON.stringify(target)
        };

        return JSON.stringify(action);
    }
}
