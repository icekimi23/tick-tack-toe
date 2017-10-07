let Game = require('./game');
let uuid = require('uuid');

/**
 * Объект игровой очереди для поиска и создания игр
 */
class GamesManager{
    constructor(){
        // очередь игроков для вступления в игру (обычно здесь должен быть только один)
        this.queue = [];
        // объект с текущими играми
        this.games = {};
    }

    /**
     * Проверяет возможность начала новой игры
     */
    checkForNewGame() {
        let result = false;
        // в очереди есть игроки, поэтому возможно создать игру
        if (this.queue.length) result = true;
        return result;
    }

    /**
     * Получает игрока для новой игры
     */
    getPlayerForNewGame(){
        // берем првого игрока из очереди
        let id = this.queue[0];
        // и удаляем его из очереди
        this.deletePlayerFromQueue(id);
        return id;
    }

    /**
     * Добавляет игрока с идентификатором id в очередь ожидания игры
     * @param id
     */
    addPlayerToQueue(id){
        if (this.queue.indexOf(id) === -1) {
            this.queue.push(id);
        }
    }

    /**
     * Удаляет игрока с идентификатором id из очереди ожидания игры
     * @param id
     */
    deletePlayerFromQueue(id){
        this.queue = this.queue.filter((playerID)=>{
            return playerID !== id;
        });
    }

    /**
     * Создает новую партию
     * @param options - опции используемые в конструкторе класса Game
     */
    startGame(options){
        let id = this._createGameID();
        options.gameID = id;
        let game = new Game(options);
        game.initGameBoard();
        this.games[id] = game;
        return game;
    }

    /**
     * Удаляет партию с укзанным идентификатором
     * @param id
     */
    deleteGame(id){
        delete this.games[id];
    }

    /**
     *  Получает игру по id
     */
    getGame(id){
        return this.games[id];
    }

    /**
     * Находим активную игру, в которой участвует игрок с данным id
     * @param id
     */
    getGameByPlayerID(id){
        for (let gameId in this.games){
            let game = this.games[gameId];
            let playerOneID = game.getPlayerOne();
            let playerTwoID = game.getPlayerTwo();
            if (id === playerOneID || id === playerTwoID){
                return game;
            }
        }
        return null;
    }

    /**
     * Создает уникальный идентификатор партии
     * @returns {*}
     * @private
     */
    _createGameID(){
        let id = uuid.v4();
        return id;
    }


}



module.exports = GamesManager;