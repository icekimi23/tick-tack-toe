'use strict';

let view = {
    // контейнер для размещения игрового поля
    _el: document.querySelector('#tick-tack-toe'),

    _findGameBtn : document.querySelector('#find-game'),

    // отрисовывает игровое поле
    render: function (rowNum, colNum) {

        this._el.innerHTML = '';

        let table = document.createElement('table');
        table.id = 'game-board';

        for (let i = 0; i < rowNum; i++) {

            let tr = document.createElement('tr');

            for (let j = 0; j < colNum; j++) {
                let td = document.createElement('td');
                td.id = 'cell-' + i + '-' + j;
                tr.appendChild(td);
            }

            table.appendChild(tr);

        }

        this._el.appendChild(table);

    },

    // показывает кнопку поиска игры
    showFindGameBtn: function(){
        this._findGameBtn.style.display = '';
    },

    // скрывает кнопку поиска игры
    hideFindGameBtn: function(){
        this._findGameBtn.style.display = 'none';
    },

    // меняет текст кнопки
    setFindGameBtnText: function(text){
        this._findGameBtn.innerHTML = text;
    },

    // отображает ход крестиков или ноликов в зависимости от параметра turn
    displayMove: function (row, col, turn) {
        let id = 'cell-' + row + '-' + col;
        let cell = this._el.querySelector('#' + id);

        if (turn === 1) {
            cell.style.background = 'red';
        } else {
            cell.style.background = 'blue';
        }
    },

    displayResult: function (turn) {
        let resultEl = document.querySelector('#result-text');

        if (turn === 1) {
            resultEl.innerHTML = 'Крестики победили!';
        } else {
            resultEl.innerHTML = 'Нолики победили!';
        }

    },

    on: function (event, handler) {
        this._el.addEventListener(event, handler);
    },

    off: function (event, handler) {
        this._el.removeEventListener(event, handler);
    }

};

// модель теперь на сервере
let model = {

    gameID: null,
    gameStatus: 'not in progress', // in progress, waiting for a game, not in progress

    setDefault : function () {
        this.setGameID(null);
        this.setGameStatus('not in progress');
    },

    setGameStatus : function (status) {
        this.gameStatus = status;
    },

    getGameStatus : function () {
        return this.gameStatus;
    },

    setGameID: function (id) {
        this.gameID = id;
    },

    getGameID: function () {
        return this.gameID;
    }
};

let controller = {

    // подключаемся к серверу
    _socket: io(),

    trigger: function (event, data) {
        this._socket.emit(event, data)
    },

    // обработчик клика на ячейку
    onCellClick: function (event) {

        let target = event.target.closest('td');

        if (target.tagName !== 'TD') return;

        let arr = target.id.split('-');
        let row = arr[1];
        let col = arr[2];

        let moveData = {
            gameID: model.getGameID(),
            row: row,
            col: col
        };

        controller.trigger('move', moveData);

    },

    // обработчик клика на кнопку поиска игры
    onFindGameBtnClick : function(event){
        let gameStatus = model.getGameStatus();
        // in progress, waiting for a game, not in progress
        switch (gameStatus) {
            case 'in progress':
                controller.trigger('cancel game');
                model.setGameStatus('not in progress');
                model.setDefault();
                view.setFindGameBtnText('Find a game!');
                break;
            case 'waiting for a game':
                controller.trigger('cancel search');
                view.setFindGameBtnText('Find a game!');
                break;
            case 'not in progress':
                controller.trigger('find game');
                break;
            default:
                console.log('undefined game status');
        }
    },

    // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
    checkMoveTurn(gameData) {
        // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
        if ((gameData.currentTurn === 1 && controller._socket.id === gameData.playerOne) || (gameData.currentTurn === 2 && controller._socket.id === gameData.playerTwo)) {
            view.on('click', controller.onCellClick);
            console.log('your turn');
        } else {
            view.off('click', controller.onCellClick);
            console.log('your opponent turn');
        }
    },

    on : function (event, handler) {
        this._socket.on(event, handler);
    }

};

(function () {

    let app = {

        init: function () {
            this.main();
            this.setEventHandlers();
        },

        main: function () {
            //model.initGameBoard();
            //view.render(model.rowNum, model.colNum);
        },

        setEventHandlers: function () {
            //view._el.addEventListener('click', controller.onCellClick);
            view._findGameBtn.addEventListener('click',controller.onFindGameBtnClick);

            // событие начала игры
            controller.on('game started', (gameData) => {
                console.log('game started: ', gameData);
                model.setGameID(gameData.gameID);
                // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
                controller.checkMoveTurn(gameData);
                view.render(gameData.rowNum, gameData.colNum);
                model.setGameStatus('in progress');
                view.setFindGameBtnText('Quit game');
            });

            // события совершения клика в ячейке одним из игроков
            controller.on('move', (gameData) => {
                console.log('move: ', gameData);
                // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
                controller.checkMoveTurn(gameData);
                view.displayMove(gameData.lastMove.row, gameData.lastMove.col, gameData.currentTurn);
            });

            // события начала поиска игры
            controller.on('looking for game', () => {
                console.log('looking for game');
                model.setGameStatus('waiting for a game');
                model.setDefault();
                view.setFindGameBtnText('Looking for a game...');
            });
            // событие окончания игры
            controller.on('game over', (gameData) => {
                view.displayMove(gameData.lastMove.row, gameData.lastMove.col, gameData.currentTurn);
                view.off('click',controller.onCellClick);
                model.setGameStatus('not in progress');
                model.setDefault();
                view.setFindGameBtnText('Find a game!');
            });

            // событие при отключении соперника
            controller.on('opponent is disconnected', (gameData) => {
                alert('Your opponent has been disconnected!');
                view.off('click',controller.onCellClick);
                model.setGameStatus('not in progress');
                model.setDefault();
                view.setFindGameBtnText('Find a game!');
            });

            // событие при отключении соперника
            controller.on('opponent canceled game', (gameData) => {
                alert('Your opponent has canceled the game!');
                view.off('click',controller.onCellClick);
                model.setGameStatus('not in progress');
                model.setDefault();
                view.setFindGameBtnText('Find a game!');
            });
        }

    };

    app.init();

}());