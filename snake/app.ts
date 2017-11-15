/// <reference path="phaser.d.ts"/>
// 0 - black | 1 - gray | 2 - dark red | 3 - red | 4 - orange | 5 - yellow | 6 - green | 7 - lite blue | 8 - blue | 9 - purple
const gameWidth: number = 89;
const gameHeight: number = 47;
const finalGameWidth: number = gameWidth * 16;
const finalGameHeight: number = gameHeight * 16;
const gameBackground: number = 0;
const snakeLength: number = 2;
const snakeColor: number = 6;
const appleColor: number = 3;
let gameSpeed: number = 10;

class SimpleGame {
    constructor() {
        this.game = new Phaser.Game(finalGameWidth, finalGameHeight, Phaser.CANVAS, 'content', {
            preload: this.preload,
            create: this.create,
            update: this.update,
            generateApple: this.generateApple,
            appleCollision: this.appleCollision,
            selfCollision: this.selfCollision,
            wallCollision: this.wallCollision,
            gameOver: this.gameOver,
            newGame: this.newGame,
            newDirectionPicker: this.newDirectionPicker,
            findApple: this.findApple
        });
    }

    game: Phaser.Game;
    snake: any[];
    apple: any;
    squareSize: number;
    score: number;
    size: number;
    speed: number;
    updateDelay: number;
    direction: String;
    newDirection: String;
    addNew: any;
    cursors: any;
    cursorsCustom: any;
    scoreTextValue: any;
    speedTextValue: any;
    keyboard: any;
    enter: any;
    isAlive: boolean;
    xTextValue: any;
    yTextValue: any;
    xAppleTextValue: any;
    yAppleTextValue: any;
    directionTextValue: any;

    preload() {
        this.game.load.spritesheet('sprite', 'assets/sprite.png', 24, 24);
        this.game.load.spritesheet('sprite-hollow', 'assets/sprite-hollow.png', 24, 24);
        this.game.load.image('button', 'assets/platform.png');
    }

    create() {
        this.snake = [];
        this.apple = {};
        this.squareSize = 16;
        this.score = 0;
        this.speed = 0;
        this.updateDelay = 0;
        this.direction = 'right';
        this.newDirection = null;
        this.addNew = null;

        this.keyboard = this.game.input.keyboard;
        this.cursors = this.keyboard.createCursorKeys();
        this.enter = this.keyboard.addKey(Phaser.KeyCode.ENTER);

        this.cursors.up.enabled = true;
        this.cursors.down.enabled = true;
        this.cursors.left.enabled = true;
        this.cursors.right.enabled = true;

        this.game.add.tileSprite(0, 0, finalGameWidth, finalGameHeight, 'sprite', gameBackground);

        this.isAlive = true;

        for (let i = 0; i < snakeLength; i++) {
            const sprite = this.game.add.sprite(i * this.squareSize, 128, 'sprite-hollow', snakeColor);

            sprite.smoothed = false;
            sprite.width = this.squareSize;
            sprite.height = this.squareSize;

            this.snake[i] = sprite;
        }

        this.generateApple();

        const STYLE = { font: 'bold 14px sans-serif', fill: '#fff' };
        const SNAKE_HEAD = this.snake[this.snake.length - 1];
        const APPLE = this.apple;

        this.game.add.text(30, 20, 'SCORE', STYLE);
        this.scoreTextValue = this.game.add.text(130, 20, this.score.toString(), STYLE);
        this.game.add.text(30, 40, 'SPEED', STYLE);
        this.speedTextValue = this.game.add.text(130, 40, this.speed.toString(), STYLE);
        this.game.add.text(30, 60, 'DIRECTION', STYLE)
        this.directionTextValue = this.game.add.text(130, 60, this.direction.toUpperCase().toString(), STYLE);
        this.game.add.text(30, 80, 'X - GREEN', STYLE);
        this.xTextValue = this.game.add.text(130, 80, SNAKE_HEAD.x.toString(), STYLE);
        this.game.add.text(30, 100, 'Y - GREEN', STYLE);
        this.yTextValue = this.game.add.text(130, 100, SNAKE_HEAD.y.toString(), STYLE);
        this.game.add.text(30, 120, 'X - RED', STYLE);
        this.xAppleTextValue = this.game.add.text(130, 120, APPLE.x.toString(), STYLE);
        this.game.add.text(30, 140, 'Y - RED', STYLE);
        this.yAppleTextValue = this.game.add.text(130, 140, APPLE.y.toString(), STYLE);

    }

    update() {
        if (this.cursors.right.isDown && this.direction != 'left') {
            this.newDirection = 'right';
        } else if (this.cursors.left.isDown && this.direction != 'right') {
            this.newDirection = 'left';
        } else if (this.cursors.up.isDown && this.direction != 'down') {
            this.newDirection = 'up';
        } else if (this.cursors.down.isDown && this.direction != 'up') {
            this.newDirection = 'down';
        }

        this.speed = gameSpeed;
        this.speedTextValue.text = this.speed.toString();

        this.updateDelay++;

        if (this.updateDelay % (11 - this.speed) == 0) {
            let firstCell = this.snake[this.snake.length - 1];
            let lastCell = this.snake.shift();

            let oldLastCellX = lastCell.x;
            let oldLastCellY = lastCell.y;

            if (this.newDirection) {
                this.direction = this.newDirection;
                this.newDirection = null;
            }

            if (this.direction == 'right') {
                lastCell.x = firstCell.x + this.squareSize;
                lastCell.y = firstCell.y;
            } else if (this.direction == 'left') {
                lastCell.x = firstCell.x - this.squareSize;
                lastCell.y = firstCell.y;
            } else if (this.direction == 'up') {
                lastCell.x = firstCell.x;
                lastCell.y = firstCell.y - this.squareSize;
            } else if (this.direction == 'down') {
                lastCell.x = firstCell.x;
                lastCell.y = firstCell.y + this.squareSize;
            }

            this.snake.push(lastCell);
            firstCell = lastCell;

            if (this.addNew) {
                const newPart = this.game.add.sprite(oldLastCellX, oldLastCellY, 'sprite-hollow', snakeColor);

                newPart.height = this.squareSize;
                newPart.width = this.squareSize;
                this.snake.unshift(newPart);
                this.addNew = false;
            }

            this.appleCollision();
            this.findApple(firstCell);
            this.selfCollision(firstCell);
            this.wallCollision(firstCell);

            this.xTextValue.text = firstCell.x.toString();
            this.yTextValue.text = firstCell.y.toString();
            this.xAppleTextValue.text = this.apple.x.toString();
            this.yAppleTextValue.text = this.apple.y.toString();
            this.directionTextValue.text = this.direction.toUpperCase().toString();
        }
    }

    generateApple() {
        const randomX = Math.floor(Math.random() * gameWidth) * this.squareSize;
        const randomY = Math.floor(Math.random() * gameHeight) * this.squareSize;
        this.apple = this.game.add.sprite(randomX, randomY, 'sprite-hollow', appleColor);
        this.apple.width = this.squareSize;
        this.apple.height = this.squareSize;
        this.apple.smoothed = false;
    }

    appleCollision() {
        this.snake.forEach(part => {
            if (part.x == this.apple.x && part.y == this.apple.y) {
                this.addNew = true;
                this.apple.destroy();
                this.generateApple();
                this.score++;
                this.scoreTextValue.text = this.score.toString();
            }
        });
    }

    selfCollision(head) {
        for (let i = 0; i < this.snake.length - 1; i++) {
            if (head.x == this.snake[i].x && head.y == this.snake[i].y) {
                // this.gameOver();
            }
        }
    }

    wallCollision(head) {
        let topWall: boolean = head.y <= 0;
        let rightWall: boolean = head.x >= finalGameWidth - this.squareSize;
        let bottomWall: boolean = head.y >= finalGameHeight - this.squareSize;
        let leftWall: boolean = head.x <= 0;
        // if (this.isAlive) {
        if (topWall || rightWall || bottomWall || leftWall) {
            if (this.direction == 'up' && topWall) {
                this.newDirectionPicker(head, this.direction);
            } else if (this.direction == 'right' && rightWall) {
                this.newDirectionPicker(head, this.direction);
            } else if (this.direction == 'down' && bottomWall) {
                this.newDirectionPicker(head, this.direction);
            } else if (this.direction == 'left' && leftWall) {
                this.newDirectionPicker(head, this.direction);
            }
            // this.isAlive = false;
            // this.gameOver();
        }
        // }
    }

    findApple(head) {
        let headTop: boolean = head.y > this.apple.y;
        let headRight: boolean = head.x < this.apple.x;
        let headBottom: boolean = head.y < this.apple.y;
        let headLeft: boolean = head.x > this.apple.x;
        if (headTop && this.direction != 'down') {
            this.direction = 'up';
        } else if (headRight && this.direction != 'left') {
            this.direction = 'right';
        } else if (headBottom && this.direction != 'up') {
            this.direction = 'down';
        } else if (headLeft && this.direction != 'right') {
            this.direction = 'left';
        }
    }

    newDirectionPicker(head, direction) {
        let directionRandomizer: number = Math.round(Math.random());
        let topWall: boolean = head.y <= 0;
        let rightWall: boolean = head.x >= finalGameWidth - this.squareSize;
        let bottomWall: boolean = head.y >= finalGameHeight - this.squareSize;
        let leftWall: boolean = head.x <= 0;

        if (direction == 'left') {
            if (directionRandomizer) {
                if (topWall) {
                    this.direction = 'down';
                } else {
                    this.direction = 'up';
                }
            } else {
                if (bottomWall) {
                    this.direction = 'up';
                } else {
                    this.direction = 'down';
                }
            }
        } else if (direction == 'right') {
            if (directionRandomizer) {
                if (bottomWall) {
                    this.direction = 'up';
                } else {
                    this.direction = 'down';
                }
            } else {
                if (topWall) {
                    this.direction = 'down';
                } else {
                    this.direction = 'up';
                }
            }
        } else if (direction == 'down') {
            if (directionRandomizer) {
                if (leftWall) {
                    this.direction = 'right';
                } else {
                    this.direction = 'left';
                }
            } else {
                if (rightWall) {
                    this.direction = 'left';
                } else {
                    this.direction = 'right';
                }
            }
        } else if (direction == 'up') {
            if (directionRandomizer) {
                if (rightWall) {
                    this.direction = 'left';
                } else {
                    this.direction = 'right';
                }
            } else {
                if (leftWall) {
                    this.direction = 'right';
                } else {
                    this.direction = 'left';
                }
            }
        }
    };

    gameOver() {
        this.cursors.up.enabled = false;
        this.cursors.down.enabled = false;
        this.cursors.left.enabled = false;
        this.cursors.right.enabled = false;
        this.direction = null;

        const style = { font: 'bold 64px sans-serif', fill: '#fff' };
        const labelStyle = { font: '22px sans-serif', fill: '#fff' };

        this.game.add.text(540, 250, 'Game Over', style);
        this.game.add.text(540, 400, 'Press \'ENTER\' to Start a New Game', labelStyle);

        this.enter.enabled = true;
        this.enter.onDown.add(this.newGame, this)
    }

    newGame() {
        this.enter.enabled = false;
        this.apple.destroy();

        for (let i = 0; i < this.snake.length; i++) {
            this.snake[i].destroy();
        }

        this.create();
    }
}

window.onload = () => {
    var game = new SimpleGame();
};