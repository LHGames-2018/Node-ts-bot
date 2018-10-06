import { Request, Response } from 'express';
import { GameInfo, Player } from '../helper/interfaces';
import { Map } from '../helper/map';
import { Bot } from '../bot/bot';

module Route {

    export class Index {
        private bot: Bot;

        public ping(req: Request, res: Response) {
            res.send('I am alive!');
        }

        public index = (req: Request, res: Response) => {
            if (!this.bot) {
                this.bot = new Bot();
            }

            const mapData = JSON.parse(req.body.data) as GameInfo;
            const map = new Map(mapData.CustomSerializedMap, mapData.xMin, mapData.yMin, mapData.WallsAreBreakable);

            mapData.Player = Object.assign(new Player(), mapData.Player);
            mapData.OtherPlayers = mapData.OtherPlayers.map(player => {
                return Object.assign(new Player(), player);
            });

            this.bot.beforeTurn(mapData.Player);

            const action = this.bot.executeTurn(map, mapData.OtherPlayers);
            this.bot.afterTurn();
            console.log(action);
            res.send(action);
        }
    }
}

export = Route;
