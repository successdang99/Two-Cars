var GAME_HEIGHT = document.body.clientHeight;
var GAME_WIDTH = document.body.clientWidth;
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
canvas.height = GAME_HEIGHT;
canvas.width = GAME_WIDTH;

var carMoving = new Audio('mp3/moving.mp3');
var carPassing = new Audio('mp3/passing.mp3');
var carCrash = new Audio('mp3/crash.mp3');
var point = new Audio('mp3/point.mp3');

var gameStatus = false;
var highscore = 0;
var car1, car2, timer, objTimer,
    obstacles = [],
    score = 0;

function Car(type) {
    this.y = 3 * GAME_HEIGHT / 4;
    this.type = type;
    this.status = 'playing';
    this.width = GAME_WIDTH/12;
    this.height = GAME_WIDTH/6;

    var img = document.createElement('img');
    if (type === 'red') img.src = 'img/redcar.png';
    else if (type === 'blue') img.src = 'img/bluecar.png';
    this.image = img;

    var startX;
    if (type === 'blue') startX = 0;
    else startX = GAME_WIDTH / 2;
    var r = randomBool();
    if (r) {
        this.x = startX;
        this.lane = 'left';
    } else {
        this.x = startX + GAME_WIDTH / 4;
        this.lane = 'right';
    }

    var offSet = GAME_WIDTH / 8 - this.width / 2;
    this.x += offSet;
}

Car.prototype.draw = function () {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
}

Car.prototype.swipePos = function () {
    var iX = this.x;
    var fX;
    var finalLane;
    var offSet = 0;

    if (this.lane === 'right') {
        fX = iX - GAME_WIDTH / 4;
        finalLane = 'left';
        offSet = -1;
    } else {
        fX = iX + GAME_WIDTH / 4;
        finalLane = 'right';
        offSet = 1;
    }

    var self = this;
    var swipeTimer = setInterval(function () {
        if (self.x !== fX) {
            if (Math.abs(fX - self.x)<=1) self.x = fX;
            else self.x += offSet; 
            self.status = 'moving';
        } else {
            clearInterval(swipeTimer);
            self.lane = finalLane;
            self.status = 'playing';
        }
    }, 1);
}

function Obj() {
    var r = randomBool();
    var startX;

    if (r) {
        this.color = 'red';
        startX = GAME_WIDTH / 2;
    } else {
        this.color = 'blue';
        startX = 0;
    }

    r = randomBool();
    if (r) {
        this.lane = 'right';
        this.x = startX + GAME_WIDTH / 4;
    } else {
        this.lane = 'left';
        this.x = startX;
    }

    r = randomBool();
    if (r) {
        this.type = 'circle';
        this.radius = GAME_WIDTH / 12;
        var offSet = GAME_WIDTH / 8;
        this.x += offSet;
    } else {
        this.type = 'rect';
        this.width = GAME_WIDTH / 6;
        this.height = GAME_WIDTH / 6;
        var offSet = GAME_WIDTH / 8 - this.width / 2;
        this.x += offSet;
    }
    this.y = getRandom(-GAME_WIDTH/4, -GAME_WIDTH);
    this.speed = GAME_WIDTH/60 + score/50;
    this.status = 'active';
    obstacles.push(this);
}

Obj.prototype.draw = function () {

    var self = this;
    if (self.status !== 'dead') {

        if (self.type === 'circle') {
    
            ctx.fillStyle = self.color;
            ctx.beginPath();
            ctx.arc(self.x, self.y, self.radius, 0, 2 * Math.PI);
            ctx.fill();
   
            ctx.fillStyle = 'whitesmoke';
            ctx.beginPath();
            ctx.arc(self.x, self.y, self.radius - GAME_WIDTH/60, 0, 2 * Math.PI);
            ctx.fill();
    
            ctx.fillStyle = self.color;
            ctx.beginPath();
            ctx.arc(self.x, self.y, self.radius - GAME_WIDTH/20, 0, 2 * Math.PI);
            ctx.fill();

            var car;
            if (self.color === 'red') car = car1;
            else car = car2;

        } else if (self.type === 'rect') {
            ctx.fillStyle = self.color;
            ctx.fillRect(self.x, self.y, self.width, self.height);
    
            ctx.fillStyle = 'whitesmoke';
            var offSet = GAME_WIDTH/60;
            ctx.fillRect(self.x + offSet, self.y + offSet, self.width - 2 * offSet, self.height - 2 * offSet);
 
            ctx.fillStyle = self.color;
            var offSet = GAME_WIDTH/20;
            ctx.fillRect(self.x + offSet, self.y + offSet, self.width - 2 * offSet, self.height - 2 * offSet);
  
            if (self.y > GAME_HEIGHT) delete self;   
        }
    }
}

Obj.prototype.move = function () {
    var self = this;
    self.y += self.speed;
}

function init() {
    clear();
    score = 0;
    obstacles = [];
    $("#canvas").css('opacity', 1);
    car1 = new Car('blue');
    car2 = new Car('red');

    timer = setInterval(function () {
        GAME_HEIGHT = document.body.clientHeight;
        GAME_WIDTH = document.body.clientWidth;
        canvas.height = GAME_HEIGHT;
        canvas.width = GAME_WIDTH;
        clear();
        drawRoad();
        drawObstacles();
        car1.draw();
        car2.draw();
        if (gameStatus) {
            drawScore();
        }
    }, 20);

    carMoving.play();
    audioGame = setInterval(function () {
        carMoving.play();
    }, 6000);

    objTimer = setInterval(function () {
        if (gameStatus) var o = new Obj();
    }, 1000);
}

function stop() {
    clearInterval(timer);
    clearInterval(objTimer);
    clearInterval(audioGame);
    carMoving.pause();
    carCrash.play();
    gameStatus = false;
    loop();
    $("#highscore").text("Highscore: " + highscore);
    $("#score").text("Score: " + score);
    $("#board").fadeIn(500);
}

function drawRoad() {
    ctx.fillStyle = 'black';
    ctx.fillRect(GAME_WIDTH / 2, 0, 3, GAME_HEIGHT);
    ctx.fillStyle = 'white';
    ctx.fillRect(GAME_WIDTH / 4, 0, 2, GAME_HEIGHT);
    ctx.fillRect(3 * GAME_WIDTH / 4, 0, 2, GAME_HEIGHT);
}

function drawObstacles() {
    for (var i = 0; i < obstacles.length; i++) {
        obstacles[i].move();
        obstacles[i].draw();
        checkCollission(obstacles[i]);
    }
}

function drawScore(params) {
    ctx.fillStyle = 'white';
    ctx.font = `${GAME_WIDTH/10}`+'px Nova Square';
    ctx.fillText(score, GAME_WIDTH/10, GAME_WIDTH/10);
}

function checkCollission(obstacle) {
    var isGameOver = false;
    var car;
    if (obstacle.color === 'red') car = car2;
    else car = car1;

    if (obstacle.type === 'rect') {
        if (car.x > obstacle.x && car.x + car.width < obstacle.x + obstacle.width && car.y > obstacle.y && car.y < obstacle.y + obstacle.height)
            isGameOver = true;
        if (obstacle.status === 'active' && !isGameOver && obstacles.lane!=car.lane && car.y < obstacle.y+obstacle.height) {
            obstacle.status = 'passed';
            carPassing.currentTime = 0;
            carPassing.play(); 
        }
    } else if (obstacle.type === 'circle') {
        if (car.x > obstacle.x - obstacle.radius && car.x + car.width < obstacle.x + obstacle.radius && car.y > obstacle.y - obstacle.radius && car.y < obstacle.y + obstacle.radius) {
            if (obstacle.status === 'active') {
                score++;
                point.currentTime = 0;
                point.play();
            }
            $("#score").text("Score: " + score);
            obstacle.status = 'dead';
        }
        if (obstacle.status === 'active' && !isGameOver && obstacles.lane!=car.lane && car.y<obstacle.y+obstacle.radius) {
            obstacle.status = 'passed';
            carPassing.currentTime = 0; 
            carPassing.play(); 
        }
    }

    highscore = (score > highscore) ? score : highscore;
    if (isGameOver) stop();
}

function getRandom(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function randomBool() {
    return (getRandom(1, 100) % 2 === 0);
}

function randBinaryNum() {
    if (randomBool()) return 1;
    else return 0;
}

function clear() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

$("#canvas").click(function (e) {
    var rect = canvas.getBoundingClientRect();
    var x = e.clientX - rect.left;

    var carFind;
    if (x < GAME_WIDTH / 2) carFind = car1;
    else carFind = car2;

    if (carFind.status === 'playing') {
        carFind.swipePos();
    }
});

$("#btnStart").click(function (e) {
    gameStatus = true;
    init();
    $("#board").fadeOut(500);
})

function loop() {
    drawRoad();
    car1 = new Car('blue');
    car2 = new Car('red');
    var img = new Image();
    img.src = 'img/logo.png';
    img.onload = function () {
        ctx.drawImage(img, 0, GAME_HEIGHT/10, GAME_WIDTH, GAME_HEIGHT/3);
        car1.draw();
        car2.draw();
        $("#canvas").css('opacity', 0.9);
    }
}

loop();