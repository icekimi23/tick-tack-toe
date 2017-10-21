'use strict';

class App{
    constructor(){

    }

    init() {
        this.main();
        this.setEventHandlers();
    }

    main() {
        //model.initGameBoard();
        //view.render(model.rowNum, model.colNum);
    }

    setEventHandlers() {
        //view._el.addEventListener('click', controller.onCellClick);
        view._findGameBtn.addEventListener('click', controller.onFindGameBtnClick);

        // событие начала игры
        controller.on('game started', (gameData) => {
            console.log('game started: ', gameData);
            controller.setState('in progress', {
                rowNum: gameData.rowNum,
                colNum: gameData.colNum,
                gameID: gameData.gameID
            });
            // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
            controller.checkMoveTurn(gameData);
        });

        // события совершения клика в ячейке одним из игроков
        controller.on('move', (gameData) => {
            console.log('move: ', gameData);
            // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
            controller.checkMoveTurn(gameData);
            //view.displayMove(gameData.lastMove.row, gameData.lastMove.col, gameData.currentTurn);
        });

        // события начала поиска игры
        controller.on('looking for game', () => {
            console.log('looking for game');
        });
        // событие окончания игры
        controller.on('game over', (gameData) => {
            view.displayMove(gameData.lastMove.row, gameData.lastMove.col, gameData.currentTurn);
            //view.off('click', controller.onCellClick);
            controller.setState('game over', gameData);
        });

        // событие при отключении соперника
        controller.on('opponent is disconnected', (gameData) => {
            alert('Your opponent has been disconnected!');
            view.off('click', controller.onCellClick);
            controller.setState('game aborted');
        });

        // событие при отключении соперника
        controller.on('opponent canceled game', (gameData) => {
            alert('Your opponent has canceled the game!');
            view.off('click', controller.onCellClick);
            controller.setState('game aborted');
        });
    }
}

let app = new App();
app.init();