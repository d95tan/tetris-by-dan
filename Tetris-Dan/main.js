//* TESTING STUFF
const dieButton = document.querySelector("#die");

const currentPiece = {
    pos: [[1,1],[1,2],[1,3],[1,4]],
    emoji: "🟩",
}

//* GLOBAL VARIABLES
const LEVELS = {
    easy: 1,
    medium: 5,
    hard: 10,
}

// Size of board
const DIMENSION = [20, 10]; // height, width

// Score table references Original Sega scoring system
const SCORE_TABLE = [ {
    level: [0, 1],
    points: [100, 400, 900, 2000],
}, {
    level: [2, 3],
    points: [200,800,1800,4000],
}, {
    level: [4, 5],
    points: [300,1200,2700,6000],
}, {
    level: [6, 7],
    points: [400,1600,3600,8000],
}, {
    level: [8],
    points: [500,2000,4500,10000],
}
    
]
//* GAME STATE

class GAME {
    constructor() {
        dieButton.addEventListener("click", this.run.bind(this));

        this.state = "start";
        this.score = 0;
        this.createBoard();
        this.renderBoard = this.renderBoard.bind(this); //omg ded
        this.next = 0;
        this.hold = 0;
        this.holdEnabled = true;
        this.levelSelector();
        this.levelChoice = 0;
        this.currLevel = 0;
        this.lines = 0;
        this.currPiece = {};
        this.newPiece(this);

        
    }
    
    run() {
        let i = 0;
        console.log(this.refreshRate)
        setInterval(this.isMoveValid.bind(this), this.refreshRate)

    }

    getRefreshRate() {
        this.refreshRate = 1000 / this.currLevel;
    }

    createBoard() {
        this.board = [];
        for (let i = 0; i < DIMENSION[0]; i++) {
            const line = [];
            for (let j = 0; j < DIMENSION[1]; j++) {
                line.push("⬜");
            }
            this.board.push(line);
        }
    }

    updateBoard() {
        for (let yx of this.currPiece.pos) {
            this.board[yx[0]][yx[1]] = currentPiece.emoji;
        }
        // console.log("updatedBoard", this.board);
    }

    isMoveValid() {
        for (let yx of this.currPiece.pos) {
            if (yx[0] === DIMENSION[0] - 1 || this.board[yx[0]+1][yx[1]] !== "⬜") {
                this.updateBoard();
                this.checkLines();
                this.newPiece(this);
                this.render();
                return;
            }
        }
        this.move();
    }

    move() {
        for (let yx of this.currPiece.pos) {
            yx[0]++;
        }
        this.render();
    }
    
    checkLines() {
        let clearedLines = 0;
        for (let i = 0; i < this.board.length; i++) {
            if (!this.board[i].includes("⬜")) {
                console.log("line",i,"cleared")
                clearLine(i);
                clearedLines++;
            }
        }
        this.scoreCalculator(clearedLines);
        this.levelCalculator;
    }

    //! TODO: implement math.random function to pick piece
    //! also need to check if piece is blocked on spawn -> game over?
    newPiece(_this) {
        _this.currPiece.pos = currentPiece.pos.map(row => [...row]);
        _this.currPiece.emoji = currentPiece.emoji;
        return;
    }

    scoreCalculator(n) {
        let scoreLevel;

        if (this.level > 8) {
            scoreLevel = 8;
        }
        else {
            scoreLevel = this.level;
        }
        for (let tier of SCORE_TABLE) {
            if (scoreLevel in tier.level) {
                this.score += tier.points[n - 1];
                return;
            }
        }
    }

    levelCalculator() {
        this.currLevel = this.levelChoice + Math.floor(this.lines / 10);
        this.getRefreshRate();
    }

    //* RENDER FUNCTIONS
    
    render() {
        this.renderStates();
        this.renderBoard();
        this.renderScore();
        this.renderLevel();
    }

    renderBoard() {
        let newBoard = this.board.map(row => [...row]); //help from chatgpt to find fastest way to deepcopy an array
        for (let yx of this.currPiece.pos) {
            newBoard[yx[0]][yx[1]] = this.currPiece.emoji;
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
            _this.levelChoice = LEVELS[level];
            _this.refreshRate = 1000 / LEVELS[level];
            _this.state = "game";
            _this.render()
        }
    }
}

//* DOCUMENT ELEMENTS
const easyButton = document.querySelector("#easy-button");
const mediumButton = document.querySelector("#medium-button");
const hardButton = document.querySelector("#hard-button");

const boardEl = document.querySelector("#board")
const holdBox = document.querySelector("#hold-shape");
const nextBox = document.querySelector("#next-shape");
const scoreBox = document.querySelector("#game-score");
const levelBox = document.querySelector("#game-level");

//* EVENT LISTENERS


//* FUNCTIONS

function main() {
    const tetris = new GAME();
    tetris.render();
}

main();