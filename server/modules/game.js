/**
 * Класс реализующий логику партии
 */
class Game {
    constructor(options) {
        this.gameID = options.gameID;
        this.playerOne = options.playerOne;
        this.playerTwo = options.playerTwo;
        this.colNum = options.colNum || 3;
        this.rowNum = options.rowNum || 3;
        this.cellsToWin = options.cellsToWin || 3;
        this.currentTurn = 1; // 1 - крестики, 2 нолики, 0 - пустое поле
        this.gameBoard = [];
        this.lastMove = null;
        this.gameSummary = ''; // кто выиграл или ничья
        this.winnerCoords = false; // либо массив с выигрышными координатами
    }

    // основная процедура хода, возвращает статус хода и выигрышные координаты если они есть
    makeMove(row, col, id) {

        let result = 'ok';

        if (!this.checkMovePos(row, col) || !this.checkMoveInTurn(id)) return 'bad move';

        this.gameBoard[row][col] = this.currentTurn;
        this.lastMove = {
            row: row,
            col: col
        };
        this.changeTurn();

        let winnerCoords = this.checkResult(row, col);

        if (winnerCoords) {
            result = 'game over';
        }

        return result;

    }

    // проверка на вохможность хода
    checkMovePos(row, col) {

        let result = false;

        if (!this.gameSummary && this.gameBoard[row][col] === 0) {
            result = true;
        }

        return result;

    }

    // проверка не нарушает ли ход очередность ходов (быстрый клик и т.д.)
    checkMoveInTurn(id) {

        let result = false;
        let currentTurn = this.getCurrentTurn();
        let PlayerOneID = this.getPlayerOne();
        let PlayerTwoID = this.getPlayerTwo();

        if ((currentTurn === 1 && id === PlayerOneID) || (currentTurn === 2 && id === PlayerTwoID)) {
            // очередность хода соблюдается
            result = true;
        }
        return result;
    }

    // проверка на завершение игры
    checkResult(row, col) {

        // TODO вариант в основном для классической игры на поле 3 на 3, не подойдет для более сложного варианта, когда
        // количество символов подряд для победы меньше чем длина поля (поле 10*10 играем до 5 в ряд)

        let currentSymbol = this.gameBoard[row][col];
        let winnerCoord = false;

        // тут либо массив с выигрышными координатами, либо false
        winnerCoord = checkHorizontal.call(this) || checkVertical.call(this) || checkDiagonal.call(this);

        if (winnerCoord) {
            this.endGame(currentSymbol, winnerCoord);
        } else if (checkEmtyCells.call(this)) {
            this.endGame('draw');
        }

        return winnerCoord;

        // проверка на ничью
        function checkEmtyCells() {
            for (let i = 0; i < this.gameBoard.length; i++) {
                for (let j = 0; j < this.gameBoard[i].length; j++) {
                    if (this.gameBoard[i][j] == 0) {
                        return false;
                    }
                }
            }
            return true;
        }

        function checkHorizontal() {

            let result = false;

            result = this.gameBoard[row].every((item) => {
                return item === currentSymbol;
            });

            if (result) {
                let winnerCoords = [];
                for (let col = 0; col < this.colNum; col++) {
                    winnerCoords.push([row, col])
                }
                result = winnerCoords;
            }

            return result;

        }

        function checkVertical() {

            let result = true;
            let winnerCoords = [];

            for (let i = 0; i < this.rowNum; i++) {
                if (this.gameBoard[i][col] !== currentSymbol) {
                    result = false;
                    break;
                } else {
                    winnerCoords.push([i,col]);
                }
            }

            if (result) result = winnerCoords;

            return result;

        }

        function checkDiagonal() {

            let resultTop = true; // диагональ из левого верхнего угла
            let resultBottom = true; // диагональ из левого нижнего угла
            let winnerCoords = [];

            for (let i = 0; i < this.rowNum; i++) {
                if (this.gameBoard[i][i] !== currentSymbol) {
                    resultTop = false;
                    break;
                } else {
                    winnerCoords.push([i,i]);
                }
            }
            // если нашли на одной диагонали - дальше не идем
            if (resultTop) {
                resultTop = winnerCoords;
                return resultTop;
            }


            let j = 0;
            winnerCoords = [];

            for (let i = this.rowNum - 1; i >= 0; i--) {
                if (this.gameBoard[i][j] !== currentSymbol) {
                    resultBottom = false;
                    break;
                } else {
                    winnerCoords.push([i,j]);
                }
                j++;
            }
            if (resultBottom) resultBottom = winnerCoords;
            return resultBottom;

        }


    }

    // меняет очередность хода
    changeTurn() {
        if (this.currentTurn === 1) {
            this.currentTurn = 2; // передаем ход ноликам
        } else {
            this.currentTurn = 1; // передаем ход крестикам
        }
    }

    // инициализируем игровое поле
    initGameBoard() {

        this.gameBoard = [];

        let arrOfCells = [];
        for (let i = 0; i < this.colNum; i++) {
            arrOfCells.push(0);
        }

        for (let i = 0; i < this.colNum; i++) {
            this.gameBoard.push(arrOfCells.slice());
        }

        this.startGame();

    }

    // установить состояние конца игры (допустимые значения 1,2 или draw)
    endGame(result, winnerCoord) {
        if (result == 1) {
            this.gameSummary = 'Player One Win';
            this.winnerCoords = winnerCoord;
        } else if (result == 2) {
            this.gameSummary = 'Player Two Win';
            this.winnerCoords = winnerCoord;
        } else {
            this.gameSummary = result;
        }

    }

    // снять флаг конца игры
    startGame() {
        this.gameSummary = '';
    }

    getPlayerOne() {
        return this.playerOne;
    }

    getPlayerTwo() {
        return this.playerTwo;
    }

    getCurrentTurn() {
        return this.currentTurn;
    }

    getGameID() {
        return this.gameID;
    }

    getLastMove() {
        return this.lastMove;
    }

    getGameSummary() {
        return this.gameSummary;
    }

    getRowNum() {
        return this.rowNum;
    }

    getColNum() {
        return this.colNum;
    }

    getWinnerCoords() {
        return this.winnerCoords;
    }

    // сформировать данные для клиентов
    getGameData() {
        let data = {
            playerOne: this.getPlayerOne(),
            playerTwo: this.getPlayerTwo(),
            currentTurn: this.getCurrentTurn(),
            rowNum: this.getRowNum(),
            colNum: this.getColNum(),
            gameID: this.getGameID(),
            lastMove: this.getLastMove(),
            gameSummary: this.getGameSummary(),
            winnerCoords: this.getWinnerCoords()
        };

        return data;
    }

}

module.exports = Game;