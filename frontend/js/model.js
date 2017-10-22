export default class Model {
    constructor() {
        this.gameID = null;
        this.mark = null;
        this.opponentMark = null;
        this.state = 'not in progress';
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

    setTurns(playerID, playerToMove) {
        // определяем за какие фигуры играет игрок
        if (playerID === playerToMove) {
            this.mark = 'cross';
            this.opponentMark = 'circle';
        } else {
            this.mark = 'circle';
            this.opponentMark = 'cross';
        }
    }
}