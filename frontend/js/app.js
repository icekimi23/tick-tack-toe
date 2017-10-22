'use strict';
import Model from './model';
import View from './view';
import Controller from './controller';


export default class App{
    constructor(){
        this.view = null;
        this.model = null;
        this.controller = null;
        this.init();
    }

    init() {
        this.main();
        this.setEventHandlers();
    }

    main() {
        this.view = new View();
        this.model = new Model();
        this.controller = new Controller(this.view, this.model);

    }

    setEventHandlers() {
        this.view._findGameBtn.addEventListener('click', this.controller.onFindGameBtnClick);

        // событие начала игры
        this.controller.on('game started', (gameData) => {
            console.log('game started: ', gameData);
            this.controller.setState('in progress', {
                rowNum: gameData.rowNum,
                colNum: gameData.colNum,
                gameID: gameData.gameID,
                playerToMove: gameData.playerOne
            });
            // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
            this.controller.checkMoveTurn(gameData.playerOne);
        });

        // события совершения клика в ячейке одним из игроков
        this.controller.on('move', (gameData) => {
            console.log('move: ', gameData);
            // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
            this.controller.checkMoveTurn(this.controller._socket.id);
            // рисуем ход соперника
            this.view.displayMove(gameData.lastMove.row, gameData.lastMove.col, this.model.opponentMark);
        });

        // события начала поиска игры
        this.controller.on('looking for game', () => {
            console.log('looking for game');
        });

        // событие окончания игры
        this.controller.on('game over', (gameData) => {
            this.controller.setState('game over', gameData);
        });

        // событие при отключении соперника
        this.controller.on('opponent is disconnected', (gameData) => {
            this.view.off('click', this.controller.onCellClick);
            this.controller.setState('game aborted');
        });

        // событие при отключении соперника
        this.controller.on('opponent canceled game', (gameData) => {
            this.view.off('click', this.controller.onCellClick);
            this.controller.setState('game aborted');
        });
    }
}