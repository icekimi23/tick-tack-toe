export default class View{
    constructor(){
        // контейнер для размещения игрового поля
        this._el = document.querySelector('#tick-tack-toe');
        // кнопка поиска игры
        this._findGameBtn =  document.querySelector('#find-game');
    }

    // отрисовывает игровое поле
    render(rowNum, colNum) {

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

    }

    // стирает игровое поле
    destroy() {
        this._el.innerHTML = '';
    }

    // показывает кнопку поиска игры
    showFindGameBtn() {
        this._findGameBtn.style.display = '';
    }

    // скрывает кнопку поиска игры
    hideFindGameBtn() {
        this._findGameBtn.style.display = 'none';
    }

    // меняет текст кнопки
    setFindGameBtnText(text) {
        this._findGameBtn.innerHTML = text;
    }

    // отображает ход крестиков или ноликов в зависимости от параметра turn
    displayMove(row, col, turn) {
        let id = 'cell-' + row + '-' + col;
        let cell = this._el.querySelector('#' + id);

        if (turn === 1) {
            let circle = cell.querySelector('.circle');
            circle.classList.add('drawn');
        } else {
            let cross = cell.querySelector('.cross');
            cross.classList.add('drawn');
        }
    }

    displayResult(resultText) {

        let animateToBJ = document.querySelector('.result-data');
        animateToBJ.classList.toggle('active');
        animateToBJ.addEventListener('transitionend', (event) => {
            // так как событие будет срабатывать на все свойства, а нам важно только любое одно
            if (event.propertyName === 'width') {
                this._showWinnerText(resultText);
            }
        });

    }

    setTurnText(text) {
        let turnText = this._el.querySelector('.turn-text');
        turnText.innerHTML = text;
    }

    _showWinnerText(text) {
        let winnerTextEl = this._el.querySelector('.winner-text');
        winnerTextEl.innerHTML = text;
        winnerTextEl.classList.add('showed');
    }

    on(event, handler) {
        this._el.addEventListener(event, handler);
    }

    off(event, handler) {
        this._el.removeEventListener(event, handler);
    }
}