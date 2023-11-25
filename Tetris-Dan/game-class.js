export class GAME {
    constructor(level) {
        this.state = "start";
        this.score = 0;
        this.createBoard();
        this.renderBoard = this.renderBoard.bind(this); //omg ded
        this.next = 0;
        this.hold = 0;
        this.levelChoice = level;
        this.currLevel = level;
        this.lines = 0;
        this.holdEnabled = true;
    }
    
    refreshDelay() {
        return 1 / this.currLevel;
    }

    createBoard() {
        this.board = [];
        for (let i = 0; i < HEIGHT; i++) {
            const line = [];
            for (let j = 0; j < WIDTH; j++) {
                line.push("⬜");
            }
            this.board.push(line);
        }
    }

    isMoveValid(futurePiece) {
        // if board[futurepiece] not empty
        // return false
        // else return true
        return true;
    }

    
    checkLines() {
        // for line in board (start from bottom)
        // for piece in line
        // if piece === whitespace, break
        // clearLine()
        // scoreCalculator(number of lines cleared)
    }

    scoreCalculator(n) {
        if (this.level > 8) {
            scoreLevel = 8;
        }
        else {
            scoreLevel = this.level;
        }
        for (tier of SCORE_TABLE) {
            if (scoreLevel in tier.level) {
                this.score += tier.points[n - 1];
                return;
            }
        }
    }

    //* RENDER FUNCTIONS
    
    render() {
        this.renderStates();
        // this.renderBoard()      //! need to insert argument here
        this.renderScore();
        this.renderLevel();
        
    }

    renderBoard() {
        let newBoard = this.board.map(row => [...row]); //help from chatgpt to find fastest way to deepcopy an array
        for (let coord of currentPiece.pos) {
            newBoard[coord[0]][coord[1]] = currentPiece.emoji;
        }
        for (let i = 0; i < newBoard.length;  i++) {
            newBoard[i].push("<br/>");
            newBoard[i] = newBoard[i].join("");
        }
        newBoard = newBoard.join("");
        boardEl.innerHTML = newBoard;
    }

    renderStates() {
        document.querySelector("#start").style.display = "none";
        document.querySelector("#game").style.display = "none";
        document.querySelector("#end").style.display = "none";

        document.querySelector(`#${this.state}`).style.display = "flex";
    }

    renderScore() {
        scoreBox.innerHTML = `SCORE <br/> ${this.score}`;
    }

    renderLevel() {
        levelBox.innerHTML = `LEVEL <br/> ${this.currLevel}`;
    }
    
    levelSelector() {
        const _this = this;
        easyButton.addEventListener("click", this.setMode(_this, "easy"));
        mediumButton.addEventListener("click", this.setMode(_this, "medium"));
        hardButton.addEventListener("click", this.setMode(_this, "hard"))
    }

    setMode = (_this, level) => {
        return function () {
            event.preventDefault();
            _this.currLevel = LEVELS[level];
            _this.state = "game";
            _this.render()
        }
    }
}