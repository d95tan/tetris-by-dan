//? ⬜ BOARD
//? 🟦 I
//? 🟫 J
//? 🟧 L
//? 🟨 O
//? 🟩 S
//? 🟥 Z
//? 🟪 T
//? coordinates [y][x]

export class Ishape {
    constructor() {
        this.x = 4;
        this.y = 0;
        let x = this.x;
        let y = this.y;
        this.pos = [[y,x-1],[y,x],[y,x+1],[y,x+2]];
        this.spawn = structuredClone(this.pos);
        this.ref = 1;
        this.emoji = "🟦";
        this.string = "🟦🟦🟦🟦";
    }
}

export class Jshape {
    constructor() {
        this.x = 4;
        this.y = 1;
        let x = this.x;
        let y = this.y;
        this.pos = [[y-1,x-1],[y,x-1],[y,x],[y,x+1]];
        this.spawn = structuredClone(this.pos);
        this.ref = 2;
        this.emoji = "🟫";
        this.string = "🟫⬜⬜<br/>🟫🟫🟫";
    }
}

export class Lshape {
    constructor() {
        this.x = 4;
        this.y = 1;
        let x = this.x;
        let y = this.y;
        this.pos = [[y - 1, x + 1], [y, x - 1], [y, x], [y, x + 1]];
        this.spawn = structuredClone(this.pos);
        this.ref = 2;
        this.emoji = "🟧";
        this.string = "⬜⬜🟧<br/>🟧🟧🟧";
    }
}

export class Oshape {
    constructor() {
        this.x = 4;
        this.y = 0;
        let x = this.x;
        let y = this.y;
        this.pos = [[y,x],[y,x+1],[y+1,x],[y+1,x+1]];
        this.spawn = structuredClone(this.pos);
        this.ref = false;   //O Shape has no rotation
        this.emoji = "🟨";
        this.string = "🟨🟨<br/>🟨🟨";
    }
}

export class Sshape {
    constructor() {
        this.x = 4;
        this.y = 1;
        let x = this.x;
        let y = this.y;
        this.pos = [[y-1,x],[y-1,x+1],[y,x-1],[y,x]];
        this.spawn = structuredClone(this.pos);
        this.ref = 3;
        this.emoji = "🟩";
        this.string = "⬜🟩🟩</br>🟩🟩⬜";
    }
}

export class Zshape {
    constructor() {
        this.x = 4;
        this.y = 1;
        let x = this.x;
        let y = this.y;
        this.pos = [[y-1,x-1],[y-1,x],[y,x],[y,x+1]];
        this.spawn = structuredClone(this.pos);
        this.ref = 2;
        this.emoji = "🟥";
        this.string = "🟥🟥⬜<br/>⬜🟥🟥";
    }
}

export class Tshape {
    constructor() {
        this.x = 4;
        this.y = 1;
        let x = this.x;
        let y = this.y;
        this.pos = [[y-1,x],[y,x-1],[y,x],[y,x+1]];
        this.spawn = structuredClone(this.pos);
        this.ref = 2;
        this.emoji = "🟪";
        this.string = "⬜🟪⬜<br/>🟪🟪🟪";
    }
}