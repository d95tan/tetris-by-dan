
/**
* 
**/

/**  
 * References: 
 * General rules, mechanics etc: https://tetris.wiki/Tetris_Guideline
 * Rotation matrix: https://en.wikipedia.org/wiki/Rotation_matrix
*/

//* SHAPE CLASSES
import { Ishape, Jshape, Lshape, Oshape, Sshape, Zshape, Tshape } from "./shape-class";

//* GLOBAL VARIABLES
// Cookies
let HIGHSCORE = [];

// Levels
const LEVELS = {
    easy: 1,
    medium: 5,
    hard: 10,
}

// Size of board
const DIMENSION = [20, 10]; // [height, width]

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
    }]

//* GAME STATE
class GAME {
    constructor(state) {
        this.state = state || "start";
        this.score = 0;
        this.createBoard();
        this.renderBoard = this.renderBoard.bind(this);
        this.next = 0;
        this.hold = 0;
        this.holdEnabled = true;
        this.levelSelector();
        this.levelChoice = 0;
        this.currLevel = 0;
        this.lines = 0;
        this.newPiece();
        this.newPiece();
        this.keydownListener();
    }

    // Adds event listeners to level buttons
    levelSelector() {
        const _this = this;
        easyButton.addEventListener("click", this.setMode(_this, "easy"));
        mediumButton.addEventListener("click", this.setMode(_this, "medium"));
        hardButton.addEventListener("click", this.setMode(_this, "hard"));
    }

    // Sets mode based on button pressed
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

    // Starts an interval based on refresh rate
    run() {
        autofocusOff();
        this.intervalID = setInterval(this.isMoveDownValid.bind(this), this.refreshRate); // ref: https://www.tutorialrepublic.com/faq/how-to-stop-setinterval-call-in-javascript.php
        this.render();
    }

    // Updates this.refreshRate
    updateRefreshRate() {
        this.refreshRate = 1000 / this.currLevel;
    }

    // Creates empty board array based on dimensions (default is 10 X 20)
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
    // it will then "lock-in" the piece to this.board
    updateBoard() {
        for (let yx of this.currPiece.pos) {
            this.board[yx[0]][yx[1]] = this.currPiece.emoji;
        }
    }

    // Checks if piece can move down, and call moveDOWN if possible -
    // if cannot (i.e piece is at bottom or something below), will call updateBoard to include the currPiece, call checkLines,
    // and create new piece.
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
    // once down-key is released, the movement is stopped.
    softDrop() {
        let softDropInterval = setInterval(this.isMoveDownValid.bind(this), 100)
        
        document.addEventListener("keyup", (event) => {
            if (event.key === "s" || event.key === "ArrowDown") {
                clearInterval(softDropInterval);
            }
        })
    }

    // Conceptually similar to softDrop, but instead uses a while loop is used for "instantaneous" drop
    // makes use of return value from isMoveDownValid to break loop
    hardDrop() {
        while (true) {
            let falling = this.isMoveDownValid();
            if (falling === 0 || falling === 1) {
                return;
            }
        }
    }

    // Event listener for the player's keyboard inputs
    // does not validate the movements
    keydownListener() {
        document.addEventListener("keydown", (event) => {
            if (event.key === "a" || event.key === "ArrowLeft") {
                this.isMoveLRValid(-1,true);
            }
            else if (event.key === "d" || event.key === "ArrowRight") {
                this.isMoveLRValid(1,true);
            }
            else if (event.key === "w" || event.key === "ArrowUp") {
                if (event.repeat) {
                    return;
                }
                this.isRotateValid();
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
    
    // If requested move is valid, calls moveLR and returns true
    // else returns false
    isMoveLRValid(x, isCurrPiece) {
        let y;
        let pos = [];

        if (x > 0) {
            y = DIMENSION[1];
        }
        else {
            y = 0;
        }

        if (isCurrPiece) {
            pos = structuredClone(this.currPiece.pos);
        }
        else {
            pos = structuredClone(this.tempPos);
        }

        for (let yx of pos) {
            if (yx[1] === y || this.board[yx[0]][yx[1] + x] !== "⬜") {
                return false;
            }
        }
        this.currPiece.pos = structuredClone(pos);
        this.moveLR(x);
        return true;
    }

    // moves the currPiece in x direction (by x units)
    moveLR(x) {
        for (let yx of this.currPiece.pos) {
            yx[1] += x;
        }
        this.render();
    }

    // only used when currPiece rotated at the base
    isMoveUpValid() {
        let y = 1;
        for (let yx of this.tempPos) {
            if (yx[0] - 1 >= DIMENSION[0] || this.board[yx[0] - 1][yx[1]] !== "⬜") {
                if (yx[0] - 2 >= DIMENSION[0] ||this.board[yx[0] - 2][yx[1]] !== "⬜") {
                    return false;
                }
                else {
                    y = 2;
                }
            }
        }
        this.moveUp(y);
    }

    // moves up by y units
    moveUp(y) {
        for (let yx of this.tempPos) {
            yx[0] -= y;
        }
        this.currPiece.pos = structuredClone(this.tempPos);
        this.render();
    }

    // checks if piece can be rotated
    // added additional logic to move piece left/right/up if piece is rotated while on the border
    isRotateValid() {
        if (this.currPiece.ref) {
            this.rotate();
            let rotate = true;
            for (let yx of this.tempPos) {
                if (yx[0] < 0) {                                // piece is at top (seldom an issue) 
                    return;
                }
                else if (yx[1] < 0) {                           // piece is at left border
                    if (!this.isMoveLRValid(1, false)) {
                        if (!this.isMoveLRValid(2,false)) {
                            return;
                        }
                        return;
                    }
                    return;
                }
                else if (yx[1] >= DIMENSION[1]) {               // piece is at right border
                    if (!this.isMoveLRValid(-1, false)) {
                        if (!this.isMoveLRValid(-2,false)) {
                            return;
                        }
                        return;
                    }
                    return;
                } 
                else if (yx[0] >= DIMENSION[0]) {               // piece is at bottom
                    if (!this.isMoveUpValid()) {
                        return;
                    }
                    return;
                }
                else if (this.board[yx[0]][yx[1]] !== "⬜") {
                    rotate = false;
                }
            }
            if (rotate) {
                this.currPiece.pos = structuredClone(this.tempPos);
                this.render();
            }
        }
    }
    // unlike moveLR and moveDOWN, rotate does not modify the currPiece
    // instead, it stores the rotated coordinates so that isRotateValid can check if the move is valid
    rotate() {
        let refX = this.currPiece.pos[this.currPiece.ref][1];
        let refY = this.currPiece.pos[this.currPiece.ref][0];
        this.tempPos = [];
        for (let i = 0; i < this.currPiece.pos.length; i++) {
            let [y, x] = structuredClone(this.currPiece.pos[i]);

            let newX = refX - (y - refY);
            let newY = refY + (x - refX);
            this.tempPos.push([newY, newX]);
        }
    }
    
    // Adds hold functionality:
    // Resets the pos of hold so that it can spawn at the correct 
    // position when player calls for it.
    // When Hold is used, it is then disabled until newPiece is called.
    storeHold() {
        if (!this.holdEnabled) {
            return false;
        }

        if (this.hold === 0) {
            this.hold = this.currPiece;
            this.hold.pos = structuredClone(this.hold.spawn);
            this.newPiece();
        }
        else {
            let temp = this.currPiece;
            this.currPiece = this.hold;
            this.hold = temp;
            this.hold.pos = structuredClone(this.hold.spawn);
        }
        this.holdEnabled = false;
        this.render();
        return true;
    }

    // whenever the board is updated, checkLines will call the neccessary
    // functions to clear lines and update both score and level
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

    // takes an input row index and clears it, then pushes a new empty line at the top
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
    // True random was chosen over Psuedo random for simplicity
    // also checks if piece is blocked on spawn -> game over
    newPiece() {
        this.currPiece = this.next;
        this.holdEnabled = true;
        switch (this.getRandomInt()) {
            case 0:
                this.next = new Ishape();
                break;
            case 1:
                this.next = new Jshape();
                break;
            case 2:
                this.next = new Lshape();
                break;
            case 3:
                this.next = new Oshape();
                break;
            case 4:
                this.next = new Sshape();
                break;
            case 5:
                this.next = new Zshape();
                break;
            case 6:
                this.next = new Tshape();
                break;
        }
        if (this.currPiece != 0) {
            for (let yx of this.currPiece.pos) {
                if (this.board[yx[0] + 1][yx[1]] !== "⬜") {
                    this.updateBoard();
                    this.checkHighscore();
                    this.render();
                    this.state = "end";
                    return false;
                }
            }
        }
        return true;
    }

    // Returns an integer between 0 and 6 (both inclusive)
    // Used to "choose" the new piece
    getRandomInt() {
        return Math.floor(Math.random() * 7);
    }

    // Uses the score table (global) to calculate and update the score based on n lines cleared.
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

    // Level increases every 10 lines cleared.
    // LevelCalculator also stops the current interval timer and updates it with a new refresh rate.
    levelCalculator() {
        this.currLevel = this.levelChoice + Math.floor(this.lines / 10);
        this.updateRefreshRate();
        clearInterval(this.intervalID);
        this.run();
    }

    // Is called when game is over.
    // Checks if the player's score is better than the 5th place (ie made it to top 5)
    // Does not calculate which position the player is in.
    checkHighscore() {
        if (this.score >= HIGHSCORE[4].score) {
            formName.style.display = "flex";
            endHighscore.style.display = "none";
            this.insertHighscore();
        }
    }
    
    // Logic to insert highscore. 
    // HIGHSCORE should always be a sorted array - O(n) time complexity as the list is only called once.
    insertHighscore() {
        nameButton.addEventListener("click", () => {
            event.preventDefault();
            for (let i = 0; i < HIGHSCORE.length; i++) {
                if (this.score >= HIGHSCORE[i].score) {
                    HIGHSCORE.splice(i, 0, { name: formNameInput.value, score: this.score });
                    HIGHSCORE.pop();
                    formNameInput.value = "";
                    formName.style.display = "none"
                    populateHighScore();
                    endHighscore.style.display = "flex";
                    localStorage.setItem("highscores",JSON.stringify(HIGHSCORE));
                    break;
                }
            }
        })
    }

    //* RENDER FUNCTIONS
    render() {
        this.renderStates();
        this.renderBoard();
        this.renderScore();
        this.renderLevel();
        this.renderNext();
        this.renderHold();
        autofocusOff();
    }

    renderBoard() {
        // let newBoard = this.board.map(row => [...row]);  // initial method of deepcopying an array
        let newBoard = structuredClone(this.board)          // found a better way to deepcopy an array
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
const formName = document.querySelector("#form-name");
const formNameInput = document.querySelector("#form-name-input");
const nameButton = document.querySelector("#name-button");
const endHighscore = document.querySelector("#end-highscores");
const changeLevel = document.querySelector("#change-level");
const formLevel = document.querySelector("#form-level");
const changeLevelOptions = formLevel.children;
const playAgainButton = document.querySelector("#play-again");


//* FUNCTIONS
// Retrieves highscore from localStorage.
// If no highscore found, a new highscore table is created.
function getHighScore() {
    const highscoreStr = localStorage.getItem("highscores");
    if (!highscoreStr) {
        HIGHSCORE = [{ name: ".....", score: 5000 },
        { name: ".....", score: 4000 },
        { name: ".....", score: 3000 },
        { name: ".....", score: 2000 },
        { name: ".....", score: 1000 }];
    }
    else {
        HIGHSCORE = JSON.parse(highscoreStr);
    }
    populateHighScore();
}

// Populates the highscore table
function populateHighScore() {
    for (let i = 0; i < HIGHSCORE.length; i++) {
        document.querySelector(`#name${i + 1}`).innerText = HIGHSCORE[i].name;
        document.querySelector(`#score${i + 1}`).innerText = HIGHSCORE[i].score;
        document.querySelector(`#end-name${i + 1}`).innerText = HIGHSCORE[i].name;
        document.querySelector(`#end-score${i + 1}`).innerText = HIGHSCORE[i].score;
    }
}

function autofocusOff() {
    formNameInput.setAttribute("autofocus", false);
    nameButton.setAttribute("autofocus", false);
    changeLevel.setAttribute("autofocus", false);
    playAgainButton.setAttribute("autofocus", false);
}

function main() {
    getHighScore();
    let tetris = new GAME();

    // play again functionality
    playAgainButton.addEventListener("click", (event) => {
        event.preventDefault();
        autofocusOff();
        tetris = new GAME("game");
        tetris.setMode(tetris, changeLevel.value)();
    })
}

main();