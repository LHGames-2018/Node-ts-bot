export class Point {
    public constructor(public x: number, public y: number) { }

    public static distance(pt1: Point, pt2: Point): number {
        return Math.sqrt(Point.distanceSquared(pt1, pt2));
    }
    public static distanceSquared(pt1: Point, pt2: Point): number {
        if (pt1 !== undefined && pt2 !== undefined) {
            const xDist = pt1.x - pt2.x;
            const yDist = pt1.y - pt2.y;
            return xDist * xDist + yDist * yDist;
        }
        return undefined;
    }

    // Make sure to use Point.Equals(pt1, pt2) when comparing points
    // and not pt1 === pt2.
    public static Equals(pt1: Point, pt2: Point): boolean {
        return pt1.x === pt2.x && pt1.y === pt2.y;
    }

    public static Direction(start: Point, end: Point): Point {
        const point = new Point(0, 0);
        if (end.x - start.x !== 0) {
            point.x = end.x - start.x > 0 ? 1 : -1;
        }

        if (end.y - start.y !== 0) {
            point.y = end.y - start.y > 0 ? 1 : -1;
        }

        return point;
    }
}
