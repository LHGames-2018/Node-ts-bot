import { TileContent } from '../helper/interfaces';
import { Map } from '../helper/map';

export function PrintTileSymbol(tileContent: TileContent): string {
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

export function PrintMap(map: Map) {
  const out = [];
  for (let i = 0; i < map.tiles.length; ++i) {
    for (let j = 0; j < map.tiles[i].length; ++j) {
      if (i === 0) {
        out.push('');
      }
      out[j] += PrintTileSymbol(map.tiles[i][j].TileType);
    }
  }

  for (const o of out) {
    console.log(o);
  }
}
