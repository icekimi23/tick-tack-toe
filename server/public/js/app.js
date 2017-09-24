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
        controller.trigger('find game');
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

            controller._socket.on('hodor', () => {
                console.log('we have recieved hodor event from the server!');
            });

            // событие начала игры
            controller._socket.on('game started', (gameData) => {
                console.log('game started: ', gameData);
                model.setGameID(gameData.gameID);
                // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
                controller.checkMoveTurn(gameData);
                view.render(gameData.rowNum, gameData.colNum);

            });

            // события совершения клика в ячейке одним из игроков
            controller._socket.on('move', (gameData) => {
                console.log('move: ', gameData);
                // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
                controller.checkMoveTurn(gameData);
                view.displayMove(gameData.lastMove.row, gameData.lastMove.col, gameData.currentTurn);
            });

            controller._socket.on('looking for game', () => {
                console.log('looking for game');
            });
            // событие окончания игры
            controller._socket.on('game over', (gameData) => {
                view.displayMove(gameData.lastMove.row, gameData.lastMove.col, gameData.currentTurn);
                view.off('click',controller.onCellClick)
            });
        }

    };

    app.init();

}());