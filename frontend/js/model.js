export default class Model {
    constructor() {
        this.gameID = null;
        this.turn = null;
        this.state = 'not in progress';
        this.gameBoard = [];
    }

    setState(status) {
        this.state = status;
    }

    getState() {
        return this.state;
    }

    setGameID(id) {
        this.gameID = id;
    }

    getGameID() {
        return this.gameID;
    }

    // проверка на вохможность хода
    checkMovePos(row, col) {
        let result = false;

        if (this.gameBoard[row][col] === 0) {
            result = true;
        }
        return result;
    }

    // инициализируем игровое поле
    initGameBoard(colNum) {

        this.gameBoard = [];

        let arrOfCells = [];
        for (let i = 0; i < colNum; i++) {
            arrOfCells.push(0);
        }

        for (let i = 0; i < colNum; i++) {
            this.gameBoard.push(arrOfCells.slice());
        }
    }

    updateGameBoard(row, col) {
        // значение нам не важно главное, чтобы был не 0
        this.gameBoard[row][col] = 1;
    }

    setTurns(gameData) {
        // разрешаем или запрещаем клик по ячейке в зависимости от очередности хода
        if (gameData.currentTurn === 1 && this._socket.id === gameData.playerOne) {
            this.turn = 1;
        } else if (gameData.currentTurn === 2 && this._socket.id === gameData.playerTwo) {
            this.turn = 2;
        }
    }
}