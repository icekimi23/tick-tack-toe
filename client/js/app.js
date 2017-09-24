'use strict';

let view = {
    // контейнер для размещения игрового поля
    _el: document.querySelector('#tick-tack-toe'),

    // отрисовывает игровое поле
    render: function (rowNum, colNum) {

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

    displayResult : function (turn) {
        let resultEl = document.querySelector('#result-text');

        if (turn === 1) {
            resultEl.innerHTML = 'Крестики победили!';
        } else {
            resultEl.innerHTML = 'Нолики победили!';
        }

    }

};

let model = {
    colNum: 3,
    rowNum: 3,
    cellsToWin: 3,
    currentTurn: 1, // 1 - крестики, 2 нолики, 0 - пустое поле
    gameBoard: [],
    gameOver: false, // флаг окончания игры

    // основная процедура хода
    makeMove: function (row, col) {

        let result = 'ok';

        if (!this.checkMovePos(row, col)) return 'bad move';

        this.gameBoard[row][col] = this.currentTurn;

        if (this.checkResult(row, col)) {
            result = 'game over';
        }

        return result;

    },

    // проверка на вохможность хода
    checkMovePos: function (row, col) {

        let result = false;

        if (!this.gameSummary && this.gameBoard[row][col] === 0) {
            result = true;
        }

        return result;

    },

    // проверка на завершение игры
    checkResult: function (row, col) {

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


    },

    // меняет очередность хода
    changeTurn: function () {
        if (this.currentTurn === 1) {
            this.currentTurn = 2; // передаем ход ноликам
        } else {
            this.currentTurn = 1; // передаем ход крестикам
        }
    },

    // инициализируем игровое поле
    initGameBoard: function () {

        this.gameBoard = [];

        let arrOfCells = [];
        for (let i = 0; i < this.colNum; i++) {
            arrOfCells.push(0);
        }

        for (let i = 0; i < this.colNum; i++) {
            this.gameBoard.push(arrOfCells.slice());
        }

        this.startGame();

    },

    // установить флаг конца игры
    endGame: function () {
        this.gameSummary = true;
    },

    // снять флаг конца игры
    startGame: function () {
        this.gameSummary = false;
    }
};

let controller = {

    // обработчик клика на ячейку
    onCellClick: function (event) {
        let target = event.target.closest('td');

        if (target.tagName !== 'TD') return;

        let arr = target.id.split('-');
        let row = arr[1];
        let col = arr[2];

        let moveStatus = model.makeMove(row, col);

        if (moveStatus !== 'bad move') {
            view.displayMove(row, col, model.currentTurn);
            if (moveStatus !== 'game over') {
                model.changeTurn();
            } else {
                // обрабатываем завершение игры
                view.displayResult(model.currentTurn);
            }
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
            model.initGameBoard();
            view.render(model.rowNum, model.colNum);
        },

        setEventHandlers: function () {
            view._el.addEventListener('click', controller.onCellClick);
        }

    };

    app.init();

}());