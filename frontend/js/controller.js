export default class Controller {
    constructor(view, model) {
        // подключаемся к серверу
        this._socket = io();
        this.view = view;
        this.model = model;
        this.onCellClick = this.onCellClick.bind(this);
    }

    // отправка собатия серверу
    trigger(event, data) {
        this._socket.emit(event, data)
    }

    // обработчик клика на ячейку
    onCellClick(event) {
        let target = event.target.closest('td');
        if (target.tagName !== 'TD') return;

        this._makeMove(target);
    }

    _makeMove(target) {
        let arr = target.id.split('-');
        let row = arr[1];
        let col = arr[2];

        if (!this.model.checkMovePos(row, col)) return;

        let moveData = {
            gameID: this.model.getGameID(),
            row: row,
            col: col
        };

        this.trigger('move', moveData);
        this.handleMove(row, col);
    }

    // обработчик клика на кнопку поиска игры
    onFindGameBtnClick(event) {
        let gameStatus = this.model.getState();
        // in progress, waiting for a game, not in progress
        switch (gameStatus) {
            case 'in progress':
                this.trigger('cancel game');
                this.setState('not in progress');
                break;
            case 'waiting for a game':
                this.trigger('cancel search');
                this.setState('not in progress');
                break;
            case 'not in progress':
                this.trigger('find game');
                this.setState('looking for game');
                break;
            case 'game over':
                this.trigger('find game');
                this.setState('looking for game');
                break;
            case 'game aborted':
                this.trigger('find game');
                this.setState('looking for game');
                break;
            default:
                console.log('undefined game status');
        }
    }

    // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
    checkMoveTurn(gameData) {
        // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
        if ((gameData.currentTurn === 1 && this._socket.id === gameData.playerOne) || (gameData.currentTurn === 2 && this._socket.id === gameData.playerTwo)) {
            this.view.on('click', this.onCellClick);
            this.view.setTurnText('Your turn');
        } else {
            this.view.off('click', this.onCellClick);
            this.view.setTurnText('Your opponent\'s turn');
        }
    }

    // обработка действий после совершения хода (сразу, а не по событию сервера)
    handleMove(row, col) {
        // блокируем последующие клики пока с сервера не придет переход хода
        this.view.off('click', this.onCellClick);
        // рисуем сразу после клика
        this.view.displayMove(row, col, this.model.turn);
        // и пишем что очередь перешла к сопернику
        this.view.setTurnText('Your opponent\'s turn');
    }

    // согласованное(model и view) изменение состояния
    setState(state, options) {

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

    }

    _setNotInProgressState(state) {
        this.view.destroy();
        this.view.setFindGameBtnText('Find a game');
        this.model.setState(state);
        this.model.setGameID(null);
    }

    _setLookingForAGameState(state) {
        this.view.setFindGameBtnText('Searching for a game...');
        this.model.setState(state);
        this.model.setGameID(null);
    }

    _setInProgressState(state, options) {
        this.view.render(options.rowNum, options.colNum);
        this.view.setFindGameBtnText('Quit game');
        this.model.initGameBoard(options.colNum);
        this.model.setState(state);
        this.model.setGameID(options.gameID);
        this.model.setTurns(options);
    }

    _setGameOverState(state, options) {
        let resultText = this._getResultText(options);
        this.view.displayResult(resultText);
        this.view.setFindGameBtnText('Find a game');
        this.view.setTurnText('Game over');
        this.model.setState(state);
        this.model.setGameID(null);
    }

    _setGameAbortedState(state, options) {
        this.view.setFindGameBtnText('Find a game');
        this.view.displayResult(':(');
        this.view.setTurnText('Game has been aborted:(');
        this.model.setState(state);
        this.model.setGameID(null);
    }

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
    }

    on(event, handler) {
        this._socket.on(event, handler);
    }

}