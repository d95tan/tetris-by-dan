//* TESTING STUFF
const dieButton = document.querySelector("#die");

// const currentPiece = {
//     pos: [[1,1],[1,2],[1,3],[1,4]],
//     emoji: "🟩",
// }

// let currentPiece = new Oshape;

//* SHAPE CLASSES
import { Ishape, Jshape, Lshape, Oshape, Sshape, Zshape, Tshape } from "./shape-class";

//* GLOBAL VARIABLES
// Interval ID
let intervalID; //https://www.tutorialrepublic.com/faq/how-to-stop-setinterval-call-in-javascript.php

// Levels
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
} ]
//* GAME STATE

class GAME {
    constructor() {
        dieButton.addEventListener("click", () => {console.log(this)});
        this.state = "start";
        this.score = 0;
        this.createBoard();
        this.renderBoard = this.renderBoard.bind(this); //omg ded
        this.next = 0;
        this.hold = 0;
        this.holdEnabled = false;
        this.levelSelector();
        this.levelChoice = 0;
        this.currLevel = 0;
        this.lines = 0;
        this.currPiece = {};
        this.newPiece(this);
        this.isActionValid();
        this.softDrop();
        this.hardDrop();
    }
    
    run() {
        // console.log(this.refreshRate);
        intervalID = setInterval(this.isMoveDownValid.bind(this), this.refreshRate);
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
            this.board[yx[0]][yx[1]] = this.currPiece.emoji;
        }
        // console.log("updatedBoard", this.board);
    }

    // Checks if piece can move down - 
    // if cannot, will update this.board to include the currPiece
    isMoveDownValid() {
        for (let yx of this.currPiece.pos) {
            if (yx[0] === DIMENSION[0] - 1 || this.board[yx[0]+1][yx[1]] !== "⬜") {
                this.updateBoard();
                this.checkLines();
                if (this.newPiece(this)) {
                    this.newPiece(this);
                }
                else {
                    clearInterval(intervalID);
                    this.render();
                    return;
                }
                this.render();
                return;
            }
        }
        this.moveDOWN();
    }

    moveDOWN() {
        for (let yx of this.currPiece.pos) {
            yx[0]++;
        }
        this.render();
    }
    
    softDrop() {

    }

    hardDrop() {

    }

    isActionValid() {
        document.addEventListener("keydown", (event) => {
            if (event.key === "a" || event.key === "ArrowLeft") {
                for (let yx of this.currPiece.pos) {
                    if (yx[1] === 0 || this.board[yx[0]][yx[1] - 1] !== "⬜") {
                        return;
                    }
                }
                this.moveLR(-1);
            }
            else if (event.key === "d" || event.key === "ArrowRight") {
                for (let yx of this.currPiece.pos) {
                    if (yx[1] === DIMENSION[1] - 1 || this.board[yx[0]][yx[1] + 1] !== "⬜") {
                        return;
                    }    
                }
                this.moveLR(1);
            }
            else if (event.key === "w" || event.key === "ArrowUp") {
                let newPos = this.rotate();
                for (let yx of newPos) {
                    if (this.board[yx[0]][yx[1] - 1] !== "⬜" ||
                        yx[0] < 0 ||
                        yx[0] >= DIMENSION[0] ||
                        yx[1] < 0 ||
                        yx[1] >= DIMENSION[1]) {
                        return;
                    }
                }
                this.currPiece.pos = newPos;
            }
        });
    }

    moveLR(x) {
        for (let yx of this.currPiece.pos) {
            yx[1] += x;
        }
    }

    rotate() {
        if (this.currPiece.ref) {
            let refX = this.currPiece.pos[this.currPiece.ref][1];
            let refY = this.currPiece.pos[this.currPiece.ref][0];
            const pos = [];
            for (let i = 0; i < this.currPiece.pos.length; i++) {
                let [y, x] = this.currPiece.pos[i];

                let newX = refX - (y - refY);
                let newY = refY + (x - refX);

                pos.push([newY, newX]);
            }
            return pos;
        }
    }

    checkLines() {
        let clearedLines = 0;
        for (let i = 0; i < this.board.length; i++) {
            if (!this.board[i].includes("⬜")) {
                this.clearLine(i);
                clearedLines++;
            }
        }
        
        if (clearedLines > 0) {
            this.scoreCalculator(clearedLines);
            this.levelCalculator();
        }
    }

    clearLine(i) {
        this.board.splice(i,1);
        const newLine = [];
        for (let i = 0; i < DIMENSION[1]; i++) {
            newLine.push("⬜");
        }
        this.board.unshift(newLine);
        this.lines++;
    }

    // Uses math.random to pick piece create new piece
    // also checks if piece is blocked on spawn -> game over
    newPiece(_this) {
        switch (this.getRandomInt()) {
            case 0:
                this.currPiece = new Ishape;
                break;
            case 1:
                this.currPiece = new Jshape;
                break;
            case 2:
                this.currPiece = new Lshape;
                break;
            case 3:
                this.currPiece = new Oshape;
                break;
            case 4:
                this.currPiece = new Sshape;
                break;
            case 5:
                this.currPiece = new Zshape;
                break;
            case 6:
                this.currPiece = new Tshape;
                break;
        }
        // _this.currPiece.pos = currentPiece.pos.map(row => [...row]);
        // _this.currPiece.emoji = currentPiece.emoji;
        for (let yx of this.currPiece.pos) {
            if (this.board[yx[0]+1][yx[1]] !== "⬜") {
                console.log("Ded");
                this.state = "end";
                return false;
            }
        }
        return true;
    }

    // returns an integer between 0 and 6 (inclusive)
    getRandomInt() {
        return Math.floor(Math.random() * 7);
    }

    scoreCalculator(n) {
        let scoreLevel = this.currLevel;
        if (scoreLevel > 8) {
            scoreLevel = 8;
        }
        else {
            scoreLevel = this.currLevel;
        }
        for (let tier of SCORE_TABLE) {
            if (tier["level"].includes(scoreLevel)) {
                console.log(tier.points[n-1]);
                this.score += tier.points[n - 1];
                return;
            }
        }
    }

    levelCalculator() {
        console.log("levelCalc", this);
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
        hardButton.addEventListener("click", this.setMode(_this, "hard"));
    }

    setMode = (_this, level) => {
        return function () {
            event.preventDefault();
            _this.currLevel = LEVELS[level];
            _this.levelChoice = LEVELS[level];
            _this.refreshRate = 1000 / LEVELS[level];
            _this.state = "game";
            _this.run();
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