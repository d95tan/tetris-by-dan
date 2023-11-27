//! TODO:
/* 
Storage of highscores (potentially use browser cookies?)
Pieces are instantly updated once there's a piece below them. Is there a way to not update them until the next tick?
*/

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
    constructor(state) {
        this.state = state || "start";
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
        this.newPiece();
        this.newPiece();
        this.isActionValid();
    }
    
    // Starts an interval based on refresh rate
    run() {
        this.intervalID = setInterval(this.isMoveDownValid.bind(this), this.refreshRate);
        this.render();
    }

    // Updates this.refreshRate
    updateRefreshRate() {
        this.refreshRate = 1000 / this.currLevel;
    }

    // Creates empty board array based on dimensions
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

    // updateBoard is only called when the current piece reaches its bottom position
    // it will then update the existing board to include the current piece
    updateBoard() {
        for (let yx of this.currPiece.pos) {
            this.board[yx[0]][yx[1]] = this.currPiece.emoji;
        }
    }

    // Checks if piece can move down, and call moveDOWN if possible -
    // if cannot, will call updateBoard to include the currPiece, call checkLines, and
    // create new piece.
    // if dead, then will render the end screen.
    // returns 0 when dead, 1 for piece locked, 2 for piece moving
    isMoveDownValid() {
        for (let yx of this.currPiece.pos) {
            if (yx[0] === DIMENSION[0] - 1 || this.board[yx[0]+1][yx[1]] !== "⬜") {
                this.updateBoard();
                this.checkLines();
                if (!this.newPiece()) { //dead
                    clearInterval(this.intervalID);
                    this.render();
                    return 0;
                }
                this.render();
                return 1;
            }
        }
        this.moveDOWN();
        return 2;
    }

    // Moves current piece downwards by 1 row
    moveDOWN() {
        for (let yx of this.currPiece.pos) {
            yx[0]++;
        }
        this.render();
    }
    
    // keeps moving the currPiece down 1 row every 0.1s
    // once down is released, the previous timer is stopped.
    softDrop() {
        let softDropInterval = setInterval(this.isMoveDownValid.bind(this), 100)
        
        document.addEventListener("keyup", (event) => {
            if (event.key === "s" || event.key === "ArrowDown") {
                clearInterval(softDropInterval);
            }
        })
    }

    // essentially same as above, just that a while loop is used for "instantaneous" drop
    // makes use of return value from isMoveDownValid to break loop
    hardDrop() {
        while (true) {
            let falling = this.isMoveDownValid();
            if (falling === 0 || falling === 1) {
                return;
            }
        }
    }

    // adds hold functionality -
    // resets the pos of hold so that it can spawn at the correct
    // location when player re-spawns it.
    storeHold() {
        if (!this.holdEnabled) {
            return false;
        }

        if (this.hold === 0) {
            this.hold = this.currPiece;
            this.hold.pos = structuredClone(this.hold.spawn);
            this.newPiece();
            this.holdEnabled = false;
            this.render();
            return true;
        }
        else {
            let temp = this.currPiece;
            this.currPiece = this.hold;
            this.hold = temp;
            this.hold.pos = structuredClone(this.hold.spawn);
            this.holdEnabled = false;
            this.render();
            return true;
        }
    }

    // event listener for the player's keyboard inputs
    // does the checking for left, right and rotation

    isActionValid() {
        document.addEventListener("keydown", (event) => {
            if (event.key === "a" || event.key === "ArrowLeft") {
                if (event.repeat) {
                    return;
                }
                for (let yx of this.currPiece.pos) {
                    if (yx[1] === 0 || this.board[yx[0]][yx[1] - 1] !== "⬜") {
                        return;
                    }
                }
                this.moveLR(-1);
            }
            else if (event.key === "d" || event.key === "ArrowRight") {
                if (event.repeat) {
                    return;
                }
                for (let yx of this.currPiece.pos) {
                    if (yx[1] === DIMENSION[1] - 1 || this.board[yx[0]][yx[1] + 1] !== "⬜") {
                        return;
                    }    
                }
                this.moveLR(1);
            }
            else if (event.key === "w" || event.key === "ArrowUp") {
                if (event.repeat) {
                    return;
                }
                if (this.currPiece.ref) {
                    let newPos = this.rotate();
                    for (let yx of newPos) {
                        if (yx[0] < 0 ||
                            yx[0] >= DIMENSION[0] ||
                            yx[1] < 0 ||
                            yx[1] >= DIMENSION[1] ||
                            this.board[yx[0]][yx[1] - 1] !== "⬜") {
                            return;
                        }
                    }
                    this.currPiece.pos = newPos;
                }
            }
            else if (event.key === " ") {
                this.hardDrop();
            }
            else if (event.key === "s" || event.key === "ArrowDown") {
                if (event.repeat) {
                    return;
                }
                this.softDrop();
            }
            else if (event.key === "c") {
                if (event.repeat) {
                    return;
                }
                this.storeHold();
            }
        });
    }

    // moves the currPiece in x direction
    moveLR(x) {
        for (let yx of this.currPiece.pos) {
            yx[1] += x;
        }
        this.render();
    }

    // unlike moveLR and moveDOWN, rotate does not modify the currPiece
    // instead, it returns the rotated coordinates so that isActionValid can check if the move is valid
    rotate() {
        let refX = this.currPiece.pos[this.currPiece.ref][1];
        let refY = this.currPiece.pos[this.currPiece.ref][0];
        const pos = [];
        for (let i = 0; i < this.currPiece.pos.length; i++) {
            let [y, x] = this.currPiece.pos[i];

            let newX = refX - (y - refY);
            let newY = refY + (x - refX);

            pos.push([newY, newX]);
        }
        this.render();
        return pos;
        
    }

    // whenever the board is updated, checkLines will call the neccessary functions
    // to clear lines and update both score and level
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

    // takes an input row index and clears it, then pushes a new blank line at the top
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
    newPiece() {
        this.currPiece = this.next;
        this.holdEnabled = true;
        switch (this.getRandomInt()) {
            case 0:
                this.next = new Ishape;
                break;
            case 1:
                this.next = new Jshape;
                break;
            case 2:
                this.next = new Lshape;
                break;
            case 3:
                this.next = new Oshape;
                break;
            case 4:
                this.next = new Sshape;
                break;
            case 5:
                this.next = new Zshape;
                break;
            case 6:
                this.next = new Tshape;
                break;
        }
        if (this.currPiece != 0) {
            for (let yx of this.currPiece.pos) {
                if (this.board[yx[0] + 1][yx[1]] !== "⬜") {
                    this.updateBoard();
                    this.render();
                    this.state = "end";
                    return false;
                }
            }
        }
        return true;
    }

    // returns an integer between 0 and 6 (inclusive)
    getRandomInt() {
        return Math.floor(Math.random() * 7);
    }

    // uses the score table to calculate and update the score.
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
                this.score += tier.points[n - 1];
                return;
            }
        }
    }

    // level increases every 10 lines cleared.
    // levelCalculator also stops the current interval timer and updates it with a new refresh rate.
    levelCalculator() {
        this.currLevel = this.levelChoice + Math.floor(this.lines / 10);
        this.updateRefreshRate();
        clearInterval(this.intervalID);
        this.run();
    }

    //* RENDER FUNCTIONS
    
    render() {
        this.renderStates();
        this.renderBoard();
        this.renderScore();
        this.renderLevel();
        this.renderNext();
        this.renderHold();
    }

    renderBoard() {
        // let newBoard = this.board.map(row => [...row]); //help from chatgpt to find fastest way to deepcopy an array
        let newBoard = structuredClone(this.board)
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
        scoreEnd.innerText = this.score;
    }

    renderLevel() {
        levelBox.innerHTML = `LEVEL <br/> ${this.currLevel}`;
    }

    renderNext() {  
        nextBox.innerHTML = this.next.string;
    }
    
    renderHold() {
        if (this.hold === 0) {
            holdBox.innerHTML = "";
        }
        else {
            holdBox.innerHTML = this.hold.string;
        }
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

            for (let option of changeLevelOptions) {
                option.setAttribute("selected", false);
            }

            document.querySelector(`#end-${level}`).setAttribute("selected", true);

            _this.run();
        }
    }
}


//* DOCUMENT ELEMENTS
//* Start elements
const easyButton = document.querySelector("#easy-button");
const mediumButton = document.querySelector("#medium-button");
const hardButton = document.querySelector("#hard-button");
//* Game elements
const boardEl = document.querySelector("#board")
const holdBox = document.querySelector("#hold-shape");
const nextBox = document.querySelector("#next-shape");
const scoreBox = document.querySelector("#game-score");
const levelBox = document.querySelector("#game-level");
//* End elements
const scoreEnd = document.querySelector("#score");
const formName = document.querySelector("form-name");
const formNameInput = document.querySelector("#form-name-input");
const changeLevel = document.querySelector("#change-level");
const formLevel = document.querySelector("#form-level");
const changeLevelOptions = formLevel.children;
const playAgainButton = document.querySelector("#play-again");


//* FUNCTIONS
function main() {
    let tetris = new GAME();
    playAgainButton.addEventListener("click", (event) => {
        event.preventDefault();
        tetris = new GAME("game");
        tetris.setMode(tetris, changeLevel.value)();

    })
}

main();