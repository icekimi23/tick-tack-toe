'use strict';

let view = {
    _el: document.querySelector('#tick-tack-toe'),
    render: function(colNum, rowNum){

        let table = document.createElement('table');
        table.id = 'game-board';

        for (let i = 1; i <= rowNum; i++) {

            let tr = document.createElement('tr');

            for (let j = 1; j <= colNum; j++) {
                let td = document.createElement('td');
                td.id = 'cell-' + i + '-' + j;
                tr.appendChild(td);
            }

            table.appendChild(tr);

        }

        this._el.appendChild(table);

    }
};

let model = {
    colNum: 3,
    rowNum: 3
};

let controller = {

};

(function () {

    let app = {

        init: function() {
            view.render(model.colNum,model.rowNum);
        }

    };

    app.init();

}());