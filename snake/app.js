/// <reference path="phaser.d.ts"/>
// 0 - black | 1 - gray | 2 - dark red | 3 - red | 4 - orange | 5 - yellow | 6 - green | 7 - lite blue | 8 - blue | 9 - purple
var gameWidth = 89;
var gameHeight = 47;
var finalGameWidth = gameWidth * 16;
var finalGameHeight = gameHeight * 16;
var gameBackground = 0;
var snakeLength = 2;
var snakeColor = 6;
var appleColor = 3;
var gameSpeed = 10;
var SimpleGame = (function () {
    function SimpleGame() {
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
    SimpleGame.prototype.preload = function () {
        this.game.load.spritesheet('sprite', 'assets/sprite.png', 24, 24);
        this.game.load.spritesheet('sprite-hollow', 'assets/sprite-hollow.png', 24, 24);
        this.game.load.image('button', 'assets/platform.png');
    };
    SimpleGame.prototype.create = function () {
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
        for (var i = 0; i < snakeLength; i++) {
            var sprite = this.game.add.sprite(i * this.squareSize, 128, 'sprite-hollow', snakeColor);
            sprite.smoothed = false;
            sprite.width = this.squareSize;
            sprite.height = this.squareSize;
            this.snake[i] = sprite;
        }
        this.generateApple();
        var STYLE = { font: 'bold 14px sans-serif', fill: '#fff' };
        var SNAKE_HEAD = this.snake[this.snake.length - 1];
        var APPLE = this.apple;
        this.game.add.text(30, 20, 'SCORE', STYLE);
        this.scoreTextValue = this.game.add.text(130, 20, this.score.toString(), STYLE);
        this.game.add.text(30, 40, 'SPEED', STYLE);
        this.speedTextValue = this.game.add.text(130, 40, this.speed.toString(), STYLE);
        this.game.add.text(30, 60, 'DIRECTION', STYLE);
        this.directionTextValue = this.game.add.text(130, 60, this.direction.toUpperCase().toString(), STYLE);
        this.game.add.text(30, 80, 'X - GREEN', STYLE);
        this.xTextValue = this.game.add.text(130, 80, SNAKE_HEAD.x.toString(), STYLE);
        this.game.add.text(30, 100, 'Y - GREEN', STYLE);
        this.yTextValue = this.game.add.text(130, 100, SNAKE_HEAD.y.toString(), STYLE);
        this.game.add.text(30, 120, 'X - RED', STYLE);
        this.xAppleTextValue = this.game.add.text(130, 120, APPLE.x.toString(), STYLE);
        this.game.add.text(30, 140, 'Y - RED', STYLE);
        this.yAppleTextValue = this.game.add.text(130, 140, APPLE.y.toString(), STYLE);
    };
    SimpleGame.prototype.update = function () {
        if (this.cursors.right.isDown && this.direction != 'left') {
            this.newDirection = 'right';
        }
        else if (this.cursors.left.isDown && this.direction != 'right') {
            this.newDirection = 'left';
        }
        else if (this.cursors.up.isDown && this.direction != 'down') {
            this.newDirection = 'up';
        }
        else if (this.cursors.down.isDown && this.direction != 'up') {
            this.newDirection = 'down';
        }
        this.speed = gameSpeed;
        this.speedTextValue.text = this.speed.toString();
        this.updateDelay++;
        if (this.updateDelay % (11 - this.speed) == 0) {
            var firstCell = this.snake[this.snake.length - 1];
            var lastCell = this.snake.shift();
            var oldLastCellX = lastCell.x;
            var oldLastCellY = lastCell.y;
            if (this.newDirection) {
                this.direction = this.newDirection;
                this.newDirection = null;
            }
            if (this.direction == 'right') {
                lastCell.x = firstCell.x + this.squareSize;
                lastCell.y = firstCell.y;
            }
            else if (this.direction == 'left') {
                lastCell.x = firstCell.x - this.squareSize;
                lastCell.y = firstCell.y;
            }
            else if (this.direction == 'up') {
                lastCell.x = firstCell.x;
                lastCell.y = firstCell.y - this.squareSize;
            }
            else if (this.direction == 'down') {
                lastCell.x = firstCell.x;
                lastCell.y = firstCell.y + this.squareSize;
            }
            this.snake.push(lastCell);
            firstCell = lastCell;
            if (this.addNew) {
                var newPart = this.game.add.sprite(oldLastCellX, oldLastCellY, 'sprite-hollow', snakeColor);
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
    };
    SimpleGame.prototype.generateApple = function () {
        var randomX = Math.floor(Math.random() * gameWidth) * this.squareSize;
        var randomY = Math.floor(Math.random() * gameHeight) * this.squareSize;
        this.apple = this.game.add.sprite(randomX, randomY, 'sprite-hollow', appleColor);
        this.apple.width = this.squareSize;
        this.apple.height = this.squareSize;
        this.apple.smoothed = false;
    };
    SimpleGame.prototype.appleCollision = function () {
        var _this = this;
        this.snake.forEach(function (part) {
            if (part.x == _this.apple.x && part.y == _this.apple.y) {
                _this.addNew = true;
                _this.apple.destroy();
                _this.generateApple();
                _this.score++;
                _this.scoreTextValue.text = _this.score.toString();
            }
        });
    };
    SimpleGame.prototype.selfCollision = function (head) {
        for (var i = 0; i < this.snake.length - 1; i++) {
            if (head.x == this.snake[i].x && head.y == this.snake[i].y) {
            }
        }
    };
    SimpleGame.prototype.wallCollision = function (head) {
        var topWall = head.y <= 0;
        var rightWall = head.x >= finalGameWidth - this.squareSize;
        var bottomWall = head.y >= finalGameHeight - this.squareSize;
        var leftWall = head.x <= 0;
        // if (this.isAlive) {
        if (topWall || rightWall || bottomWall || leftWall) {
            if (this.direction == 'up' && topWall) {
                this.newDirectionPicker(head, this.direction);
            }
            else if (this.direction == 'right' && rightWall) {
                this.newDirectionPicker(head, this.direction);
            }
            else if (this.direction == 'down' && bottomWall) {
                this.newDirectionPicker(head, this.direction);
            }
            else if (this.direction == 'left' && leftWall) {
                this.newDirectionPicker(head, this.direction);
            }
        }
        // }
    };
    SimpleGame.prototype.findApple = function (head) {
        var headTop = head.y > this.apple.y;
        var headRight = head.x < this.apple.x;
        var headBottom = head.y < this.apple.y;
        var headLeft = head.x > this.apple.x;
        if (headTop && this.direction != 'down') {
            this.direction = 'up';
        }
        else if (headRight && this.direction != 'left') {
            this.direction = 'right';
        }
        else if (headBottom && this.direction != 'up') {
            this.direction = 'down';
        }
        else if (headLeft && this.direction != 'right') {
            this.direction = 'left';
        }
    };
    SimpleGame.prototype.newDirectionPicker = function (head, direction) {
        var directionRandomizer = Math.round(Math.random());
        var topWall = head.y <= 0;
        var rightWall = head.x >= finalGameWidth - this.squareSize;
        var bottomWall = head.y >= finalGameHeight - this.squareSize;
        var leftWall = head.x <= 0;
        if (direction == 'left') {
            if (directionRandomizer) {
                if (topWall) {
                    this.direction = 'down';
                }
                else {
                    this.direction = 'up';
                }
            }
            else {
                if (bottomWall) {
                    this.direction = 'up';
                }
                else {
                    this.direction = 'down';
                }
            }
        }
        else if (direction == 'right') {
            if (directionRandomizer) {
                if (bottomWall) {
                    this.direction = 'up';
                }
                else {
                    this.direction = 'down';
                }
            }
            else {
                if (topWall) {
                    this.direction = 'down';
                }
                else {
                    this.direction = 'up';
                }
            }
        }
        else if (direction == 'down') {
            if (directionRandomizer) {
                if (leftWall) {
                    this.direction = 'right';
                }
                else {
                    this.direction = 'left';
                }
            }
            else {
                if (rightWall) {
                    this.direction = 'left';
                }
                else {
                    this.direction = 'right';
                }
            }
        }
        else if (direction == 'up') {
            if (directionRandomizer) {
                if (rightWall) {
                    this.direction = 'left';
                }
                else {
                    this.direction = 'right';
                }
            }
            else {
                if (leftWall) {
                    this.direction = 'right';
                }
                else {
                    this.direction = 'left';
                }
            }
        }
    };
    ;
    SimpleGame.prototype.gameOver = function () {
        this.cursors.up.enabled = false;
        this.cursors.down.enabled = false;
        this.cursors.left.enabled = false;
        this.cursors.right.enabled = false;
        this.direction = null;
        var style = { font: 'bold 64px sans-serif', fill: '#fff' };
        var labelStyle = { font: '22px sans-serif', fill: '#fff' };
        this.game.add.text(540, 250, 'Game Over', style);
        this.game.add.text(540, 400, 'Press \'ENTER\' to Start a New Game', labelStyle);
        this.enter.enabled = true;
        this.enter.onDown.add(this.newGame, this);
    };
    SimpleGame.prototype.newGame = function () {
        this.enter.enabled = false;
        this.apple.destroy();
        for (var i = 0; i < this.snake.length; i++) {
            this.snake[i].destroy();
        }
        this.create();
    };
    return SimpleGame;
}());
window.onload = function () {
    var game = new SimpleGame();
};
