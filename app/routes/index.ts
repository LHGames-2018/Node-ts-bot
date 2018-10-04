import { Request, Response, NextFunction } from 'express';
import { GameInfo } from '../interfaces';
import { Map } from '../map';
import { Bot } from '../bot';

module Route {

    export class Index {
        private bot: Bot;
        public ping(res: Response) {
            res.send("I am alive!");
        }

        public index(req: Request, res: Response, next: NextFunction) {
            if (!this.bot) {
                this.bot = new Bot();
            }
            const mapData = JSON.parse(req.body.data) as GameInfo;
            const map = new Map(mapData.CustomSerializedMap, mapData.xMin, mapData.yMin);

            this.bot.beforeTurn(mapData.Player);
            const action = this.bot.executeTurn(map, mapData.OtherPlayers);
            this.bot.afterTurn();

            res.send(action);
        }
    }
}

export = Route;
