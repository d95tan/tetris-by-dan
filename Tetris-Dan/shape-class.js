//? 🟦 I
//? 🟫 J
//? 🟧 L
//? 🟨 O
//? 🟩 S
//? 🟥 Z
//? 🟪 T
//? coordinates [y][x]

const y = 0;

export class Ishape {
    constructor() {
        this.pos = [[y,3],[y,4],[y,5],[y,6]];
        this.emoji = "🟦";
    }
}

export class Jshape {
    constructor() {
        this.pos = [[y,3],[1,3],[1,4],[1,5]];
        this.emoji = "🟫";
    }
}

export class Lshape {
    constructor() {
        this.pos = [[y,5],[1,3],[1,4],[1,5]];
        this.emoji = "🟧";
    }
}

export class Oshape {
    constructor() {
        this.pos = [[y,4],[y,5],[1,4],[1,5]];
        this.emoji = "🟨";
    }
}

export class Sshape {
    constructor() {
        this.pos = [[y,5],[y,6],[1,4],[1,5]];
        this.emoji = "🟩";
    }
}

export class Zshape {
    constructor() {
        this.pos = [[y,4],[y,5],[1,5],[1,6]];
        this.emoji = "🟥";
    }
}

export class Tshape {
    constructor() {
        this.pos = [[y,5],[1,4],[1,5],[1,6]];
        this.emoji = "🟪";
    }
}

function rotate(piece) {
    matrix = piece.pos;
    //! TODO
}