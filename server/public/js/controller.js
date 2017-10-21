class Controller{
    constructor(){
        // подключаемся к серверу
        this._socket = io();
    }

    // отправка собатия серверу
    trigger(event, data) {
        this._socket.emit(event, data)
    }

    // обработчик клика на ячейку
    onCellClick(event) {
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
        controller.handleMove(row, col);

    }

    // обработчик клика на кнопку поиска игры
    onFindGameBtnClick(event) {
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
    }

    // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
    checkMoveTurn(gameData) {
        // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
        if ((gameData.currentTurn === 1 && controller._socket.id === gameData.playerOne) || (gameData.currentTurn === 2 && controller._socket.id === gameData.playerTwo)) {
            view.on('click', controller.onCellClick);
            view.setTurnText('Your turn');
        } else {
            view.off('click', controller.onCellClick);
            view.setTurnText('Your opponent\'s turn');
        }
    }

    // обработка действий после совершения хода (сразу, а не по событию сервера)
    handleMove(row, col) {
        // блокируем последующие клики пока с сервера не придет переход хода
        view.off('click', controller.onCellClick);
        // рисуем сразу после клика
        view.displayMove(row, col, model.turn);
        // и пишем что очередь перешла к сопернику
        view.setTurnText('Your opponent\'s turn');
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
        view.destroy();
        view.setFindGameBtnText('Find a game');
        model.setState(state);
        model.setGameID(null);
    }

    _setLookingForAGameState(state) {
        view.setFindGameBtnText('Searching for a game...');
        model.setState(state);
        model.setGameID(null);
    }

    _setInProgressState(state, options) {
        view.render(options.rowNum, options.colNum);
        view.setFindGameBtnText('Quit game');
        model.setState(state);
        model.setGameID(options.gameID);
        model._setTurns(options);
    }

    _setGameOverState(state, options) {
        let resultText = this._getResultText(options);
        view.displayResult(resultText);
        view.setFindGameBtnText('Find a game');
        view.setTurnText('Game over');
        model.setState(state);
        model.setGameID(null);
    }

    _setGameAbortedState(state, options) {
        view.setFindGameBtnText('Find a game');
        view.displayResult(':(');
        view.setTurnText('Game has been aborted:(');
        model.setState(state);
        model.setGameID(null);
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