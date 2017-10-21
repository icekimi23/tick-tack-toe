class Model{
    constructor(){
        this.gameID = null;
        this.turn = null;
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
}