class GAME {
    constructor(level) {
        this.state = "start";
        this.score = 0;
        this.board = this.board();
        this.next = 0;
        this.hold = 0;
        this.levelChoice = level;
        this.currLevel = level;
        this.holdEnabled = true;
    }
    
    refreshDelay(level) {
        return 1 / level;
    }

    isMoveValid(futurePiece) {
        // if board[futurepiece] not empty
        // return false
        // else return true
        return true;
    }

    renderBoard(currentPiece) {

    }
}

const LEVELS = {
    easy: 10,
    medium: 20,
    hard: 25,
}

