var Game = require('./game');
var GameManager = require('./games-manager');
var gamesManager = new GameManager();
var playersOnline = 0;

module.exports = function (server) {
    var io = require('socket.io')(server);

    io.on('connection', function (socket) {
        console.log('we have a connection! id = ' + socket.id);
        playersOnline++;
        // текущий онлайн отправим сразу же
        socket.emit('current online', playersOnline);
        // и обновляем каждые 5 секунд
        var timerID  = setInterval(function () {
            socket.emit('current online', playersOnline);
        }, 3000);
        socket.on('find game', function () {
            // проверить возможность создания новой игры
            let newGameIsPossible = gamesManager.checkForNewGame();
            if (newGameIsPossible) { // если возможно то создать новую игру
                let playerTwoID = gamesManager.getPlayerForNewGame();
                let game = gamesManager.startGame({
                    playerOne: socket.id,
                    playerTwo: playerTwoID
                });

                // отправляем события о начале игры только 2 игрокам
                io.to(socket.id).to(playerTwoID).emit('game started', game.getGameData());

            } else { // если нет то поставить игрока в очередь
                gamesManager.addPlayerToQueue(socket.id);
                io.to(socket.id).emit('looking for game');
            }
        });

        // обработчик хода
        socket.on('move', function (moveData) {
            let game = gamesManager.getGame(moveData.gameID);
            if (game) {
                let result = game.makeMove(moveData.row, moveData.col, socket.id);
                if (result === 'ok') {
                    let opponentID = game.getOpponentID(socket.id);
                    io.to(opponentID).emit('move', game.getGameData());
                } else if (result === 'bad move') {
                    io.to(socket.id).emit('bad move');
                } else if (result === 'game over') {
                    game.setLastMovePlayerID(socket.id);
                    io.to(game.getPlayerOne()).to(game.getPlayerTwo()).emit('game over', game.getGameData());
                    // завершаем игру
                    gamesManager.deleteGame(game.getGameID());
                }
            } else {
                // TODO добавить обработку ошибки
            }
        });

        socket.on('cancel game', function () {
            console.log('user canceled game');
            let playerID = socket.id;
            // удаляем игрока из очереди, если он там был
            gamesManager.deletePlayerFromQueue(playerID);
            // если была игра с этим игроком
            let game = gamesManager.getGameByPlayerID(playerID);
            // оповещаем 2-го игрока о дисконекте 1-го
            if (game) {
                let playerOneID = game.getPlayerOne();
                let playerTwoID = game.getPlayerTwo();
                if (playerID === playerOneID) {
                    io.to(playerTwoID).emit('opponent canceled game');
                } else {
                    io.to(playerOneID).emit('opponent canceled game');
                }
                // и завершаем игру
                gamesManager.deleteGame(game.getGameID());
            }
        });

        socket.on('cancel search', function () {
            let playerID = socket.id;
            // удаляем игрока из очереди, если он там был
            gamesManager.deletePlayerFromQueue(playerID);
        });

        socket.on('disconnect', function () {
            console.log('user disconnected');
            playersOnline--;
            clearInterval(timerID);
            let playerID = socket.id;
            // удаляем игрока из очереди, если он там был
            gamesManager.deletePlayerFromQueue(playerID);
            // если была игра с этим игроком
            let game = gamesManager.getGameByPlayerID(playerID);
            // оповещаем 2-го игрока о дисконекте 1-го
            if (game) {
                let playerOneID = game.getPlayerOne();
                let playerTwoID = game.getPlayerTwo();
                if (playerID === playerOneID) {
                    io.to(playerTwoID).emit('opponent is disconnected');
                    console.log('opponent with ID = ' + playerID + ' was diconected!');
                    console.log('opponent with ID = ' + playerTwoID + ' was informed!');
                } else {
                    io.to(playerOneID).emit('opponent is disconnected');
                    console.log('opponent with ID = ' + playerID + ' was diconected!');
                    console.log('opponent with ID = ' + playerOneID + ' was informed!');
                }
                // и завершаем игру
                gamesManager.deleteGame(game.getGameID());
            }
        });
    });

};