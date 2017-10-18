'use strict';

let view = {
    // контейнер для размещения игрового поля
    _el: document.querySelector('#tick-tack-toe'),

    _findGameBtn: document.querySelector('#find-game'),

    // отрисовывает игровое поле
    render: function (rowNum, colNum) {

        this._el.innerHTML = '';

        let turnText = document.createElement('div');
        turnText.className = 'turn-text';
        this._el.appendChild(turnText);

        let wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'table-wrapper';

        let table = document.createElement('table');
        table.id = 'game-board';
        wrapperDiv.appendChild(table);

        let resultDiv = document.createElement('div');
        resultDiv.className = 'result-data';
        let winnerText = document.createElement('div');
        winnerText.className = 'winner-text';
        resultDiv.appendChild(winnerText);

        wrapperDiv.appendChild(resultDiv);

        for (let i = 0; i < rowNum; i++) {

            let tr = document.createElement('tr');

            for (let j = 0; j < colNum; j++) {
                let td = document.createElement('td');
                td.id = 'cell-' + i + '-' + j;
                td.innerHTML = `<svg class="cross" width="96" height="96" viewBox="4 0 128 128">
                                    <path class="first-line" d="M16,16L112,112"></path>
                                    <path class="second-line" d="M112,16L16,112"></path>
                                </svg>
                                <svg class="circle" width="96" height="96" viewBox="4 0 128 128">
                                    <path d="M64,16A48,48 0 1,0 64,112A48,48 0 1,0 64,16"></path>
                                </svg>`;
                tr.appendChild(td);
            }

            table.appendChild(tr);

        }

        this._el.appendChild(wrapperDiv);

    },

    // стирает игровое поле
    destroy: function () {
        this._el.innerHTML = '';
    },

    // показывает кнопку поиска игры
    showFindGameBtn: function () {
        this._findGameBtn.style.display = '';
    },

    // скрывает кнопку поиска игры
    hideFindGameBtn: function () {
        this._findGameBtn.style.display = 'none';
    },

    // меняет текст кнопки
    setFindGameBtnText: function (text) {
        this._findGameBtn.innerHTML = text;
    },

    // отображает ход крестиков или ноликов в зависимости от параметра turn
    displayMove: function (row, col, turn) {
        let id = 'cell-' + row + '-' + col;
        let cell = this._el.querySelector('#' + id);

        if (turn === 1) {
            let circle = cell.querySelector('.circle');
            circle.classList.add('drawn');
        } else {
            let cross = cell.querySelector('.cross');
            cross.classList.add('drawn');
        }
    },

    displayResult: function (resultText) {

        let animateToBJ = document.querySelector('.result-data');
        animateToBJ.classList.toggle('active');
        animateToBJ.addEventListener('transitionend', (event) => {
            // так как событие будет срабатывать на все свойства, а нам важно только любое одно
            if (event.propertyName === 'width') {
                this._showWinnerText(resultText);
            }
        });

    },

    setTurnText: function (text) {
        let turnText = this._el.querySelector('.turn-text');
        turnText.innerHTML = text;
    },

    _showWinnerText: function (text) {
        let winnerTextEl = this._el.querySelector('.winner-text');
        winnerTextEl.innerHTML = text;
        winnerTextEl.classList.add('showed');
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
    state: 'not in progress',

    setState: function (status) {
        this.state = status;
    },

    getState: function () {
        return this.state;
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

    // отправка собатия серверу
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
    onFindGameBtnClick: function (event) {
        let gameStatus = model.getState();
        // in progress, waiting for a game, not in progress
        switch (gameStatus) {
            case 'in progress':
                controller.trigger('cancel game');
                controller.setState('not in progress');
                break;
            case 'waiting for a game':
                controller.trigger('cancel search');
                controller.setState('not in progress');
                break;
            case 'not in progress':
                controller.trigger('find game');
                controller.setState('looking for game');
                break;
            case 'game over':
                controller.trigger('find game');
                controller.setState('looking for game');
                break;
            case 'game aborted':
                controller.trigger('find game');
                controller.setState('looking for game');
                break;
            default:
                console.log('undefined game status');
        }
    },

    // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
    checkMoveTurn: function (gameData) {
        // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
        if ((gameData.currentTurn === 1 && controller._socket.id === gameData.playerOne) || (gameData.currentTurn === 2 && controller._socket.id === gameData.playerTwo)) {
            view.on('click', controller.onCellClick);
            view.setTurnText('Your turn');
        } else {
            view.off('click', controller.onCellClick);
            view.setTurnText('Your opponent\'s turn');
        }
    },

    // согласованное(model и view) изменение состояния
    setState: function (state, options) {

        switch (state) {
            case 'not in progress':
                this._setNotInProgressState(state);
                break;
            case 'looking for game':
                this._setLookingForAGameState(state);
                break;
            case 'in progress':
                this._setInProgressState(state, options);
                break;
            case 'game over':
                this._setGameOverState(state, options);
                break;
            case 'game aborted':
                this._setGameAbortedState(state, options);
                break;
        }

    },

    _setNotInProgressState: function (state) {
        view.destroy();
        view.setFindGameBtnText('Find a game');
        model.setState(state);
        model.setGameID(null);
    },

    _setLookingForAGameState: function (state) {
        view.setFindGameBtnText('Searching for a game...');
        model.setState(state);
        model.setGameID(null);
    },

    _setInProgressState: function (state, options) {
        view.render(options.rowNum, options.colNum);
        view.setFindGameBtnText('Quit game');
        model.setState(state);
        model.setGameID(options.gameID);
    },

    _setGameOverState: function (state, options) {
        let resultText = this._getResultText(options);
        view.displayResult(resultText);
        view.setFindGameBtnText('Find a game');
        view.setTurnText('Game over');
        model.setState(state);
        model.setGameID(null);
    },

    _setGameAbortedState: function (state, options) {
        view.setFindGameBtnText('Find a game');
        view.displayResult(':(');
        view.setTurnText('Game has been aborted:(');
        model.setState(state);
        model.setGameID(null);
    },

    _getResultText(options) {
        let resultText = '';
        if (options.winnerID === 'draw') {
            resultText = 'Draw!';
        } else if (options.winnerID === this._socket.id) {
            resultText = 'You win:)';
        } else {
            resultText = 'You lose:(';
        }
        return resultText;
    },

    on: function (event, handler) {
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
                view.displayMove(gameData.lastMove.row, gameData.lastMove.col, gameData.currentTurn);
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

    };

    app.init();

}());