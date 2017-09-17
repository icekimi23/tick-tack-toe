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
    }
};

let model = {
    colNum: 3,
    rowNum: 3,
    cellsToWin: 3,
    currentTurn: 1, // 1 - крестики, 2 нолики, 0 - пустое поле
    gameBoard: [],

    // основная процедура хода
    makeMove: function (row, col) {

        let result = 'ok';

        if (!this.checkMovePos(row, col)) return 'bad move';

        if (this.checkResult()) {
            result = 'game over';
        }

        return result;

    },

    // проверка на вохможность хода
    checkMovePos: function (row, col) {

        let result = false;

        if (this.gameBoard[row][col] === 0) {
            result = true;
        }

        return result;

    },

    // проверка на завершение игры
    checkResult: function () {

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

        let arrOfCells = [];
        for (let i = 0; i < this.colNum; i++) {
            arrOfCells.push(0);
        }

        for (let i = 0; i < this.colNum; i++) {
            this.gameBoard.push(arrOfCells.slice());
        }

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

        if (moveStatus !== 'bad move'){
            view.displayMove(row, col, model.currentTurn);
            if (moveStatus !== 'game over'){
                model.changeTurn();
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

        main : function () {
            model.initGameBoard();
            view.render(model.rowNum, model.colNum);
        },

        setEventHandlers: function () {
            view._el.addEventListener('click',controller.onCellClick);
        }

    };

    app.init();

}());