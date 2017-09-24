/**
 * Класс реализующий логику партии
 */
class Game{
    constructor(options){
        this.gameID = options.gameID;
        this.playerOne = options.playerOne;
        this.playerTwo = options.playerTwo;
        this.colNum = options.colNum || 3;
        this.rowNum = options.rowNum || 3;
        this.cellsToWin = options.cellsToWin || 3;
        this.currentTurn = 1; // 1 - крестики, 2 нолики, 0 - пустое поле
        this.gameBoard = [];
        this.lastMove = null;
        this.gameOver = false; // флаг окончания игры
    }

    // основная процедура хода
    makeMove(row, col) {

        let result = 'ok';

        if (!this.checkMovePos(row, col)) return 'bad move';

        this.gameBoard[row][col] = this.currentTurn;
        this.lastMove = {
            row : row,
            col : col
        };
        this.changeTurn();

        if (this.checkResult(row, col)) {
            result = 'game over';
        }

        return result;

    }

    // проверка на вохможность хода
    checkMovePos(row, col) {

        let result = false;

        if (!this.gameOver && this.gameBoard[row][col] === 0) {
            result = true;
        }

        return result;

    }

    // проверка на завершение игры
    checkResult(row, col) {

        // TODO вариант в основном для классической игры на поле 3 на 3, не подойдет для более сложного варианта, когда
        // количество символов подряд для победы меньше чем длина поля (поле 10*10 играем до 5 в ряд)

        let currentSymbol = this.gameBoard[row][col];
        let gameOver = false;

        if (checkHorizontal.call(this) || checkVertical.call(this) || checkDiagonal.call(this)) {
            gameOver = true;
            this.endGame();
        }

        return gameOver;

        function checkHorizontal() {

            let result = false;

            result = this.gameBoard[row].every((item) => {
                return item === currentSymbol;
            });

            return result;

        }

        function checkVertical() {

            let result = true;

            for (let i = 0; i < this.rowNum; i++) {
                if (this.gameBoard[i][col] !== currentSymbol) {
                    result = false;
                    break;
                }
            }

            return result;

        }

        function checkDiagonal() {

            let resultTop = true; // диагональ из левого верхнего угла
            let resultBottom = true; // диагональ из левого нижнего угла

            for (let i = 0; i < this.rowNum; i++) {
                if (this.gameBoard[i][i] !== currentSymbol) {
                    resultTop = false;
                    break;
                }
            }
            // если нашли на одной диагонали - дальше не идем
            if (resultTop) return resultTop;

            let j = 0;

            for (let i = this.rowNum - 1; i >= 0; i--) {
                if (this.gameBoard[i][j] !== currentSymbol) {
                    resultBottom = false;
                    break;
                }
                j++;
            }
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

    // установить флаг конца игры
    endGame() {
        this.gameOver = true;
    }

    // снять флаг конца игры
    startGame() {
        this.gameOver = false;
    }

    getPlayerOne(){
        return this.playerOne;
    }

    getPlayerTwo(){
        return this.playerTwo;
    }

    getCurrentTurn(){
        return this.currentTurn;
    }

    getGameID(){
        return this.gameID;
    }

    getLastMove(){
        return this.lastMove;
    }

    getGameOver(){
        return this.gameOver;
    }

    getRowNum(){
        return this.rowNum;
    }

    getColNum(){
        return this.colNum;
    }

    // сформировать данные для клиентов
    getGameData(){
        let data = {
            playerOne : this.getPlayerOne(),
            playerTwo : this.getPlayerTwo(),
            currentTurn : this.getCurrentTurn(),
            rowNum : this.getRowNum(),
            colNum : this.getColNum(),
            gameID : this.getGameID(),
            lastMove : this.getLastMove()
        };

        return data;
    }

}

module.exports = Game;