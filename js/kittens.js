// This sectin contains some game constants. It is not super interesting
var audio = new Audio('/audio/Nyan Cat - Uploaded by Yodix (youtube adilsonbankai).mp3');
audio.play();
var GAME_WIDTH = 375;
var GAME_HEIGHT = 700;

var ENEMY_WIDTH = 75;
var ENEMY_HEIGHT = 156;
var MAX_ENEMIES = 3;
var MAX_BONUSES = 1;

var PLAYER_WIDTH = 75;
var PLAYER_HEIGHT = 54;
var lives = 3;
var gracePeriod = 3000;
var bonusGracePeriod = gracePeriod;
var GRACE_PERIOD_LENGTH = 100;

// These two constants keep us from using "magic numbers" in our code
var LEFT_ARROW_CODE = 37;
var RIGHT_ARROW_CODE = 39;

// These two constants allow us to DRY
var MOVE_LEFT = 'left';
var MOVE_RIGHT = 'right';
var counter = 3000;

// Preload game images
var images = {};
['enemy.png', 'bonus.png', 'enemy2.png', 'stars.png', 'player.png', 'heart.png'].forEach(imgName => {
    var img = document.createElement('img');
    img.src = 'images/' + imgName;
    images[imgName] = img;
});

// `input` will be defined elsewhere, it's a means
// for us to capture the state of input from the player

class Entity {
    render(ctx) {
        
        ctx.drawImage(this.sprite, this.x, this.y);
    }
}
class Bonus extends Entity {
    
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -75;
        this.sprite = images['bonus.png'];

        // Each enemy should have a different speed
        this.speed = (Math.random() / 6 + 0.22);
    }
    
    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed; 
    }
}

class Heart extends Entity {
    
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -75;
        this.sprite = images['heart.png'];

        // Each enemy should have a different speed
        this.speed = (Math.random() / 7 + 0.19);
    }
    
    update(timeDiff) {
        this.y = this.y + timeDiff * this.speed; 
    }
}
// This section is where you will be doing most of your coding
class Enemy extends Entity {
   
    constructor(xPos) {
        super();
        this.x = xPos;
        this.y = -ENEMY_HEIGHT;
        this.sprite = images['enemy.png'];

        // Each enemy should have a different speed
        this.speed = (Math.random() / 6 + 0.22);
    }
    
    update(timeDiff) {
        counter++;
        this.y = this.y + timeDiff * this.speed * counter/4500; 
    }
    
    render(ctx) {
        //Enemy animation block
        if (counter % 18 === 0 ) { //animation speed
            if (this.sprite === images['enemy.png']){
                this.sprite = images['enemy2.png'];
            } else {
                this.sprite = images['enemy.png'];
            }
        }
        ctx.drawImage(this.sprite, this.x, this.y);
    }

}

class Player extends Entity {

    constructor() {
        super();
        this.x = 2 * PLAYER_WIDTH;
        this.y = GAME_HEIGHT - PLAYER_HEIGHT - 10;
        this.sprite = images['player.png'];
    }

    // This method is called by the game engine when left/right arrows are pressed
    move(direction) {
        if (direction === MOVE_LEFT && this.x > 0) {
            this.x = this.x - PLAYER_WIDTH;
        }
        else if (direction === MOVE_RIGHT && this.x < GAME_WIDTH - PLAYER_WIDTH) {
            this.x = this.x + PLAYER_WIDTH;
        }
    }

}





/*
This section is a tiny game engine.
This engine will use your Enemy and Player classes to create the behavior of the game.
The engine will try to draw your game at 60 frames per second using the requestAnimationFrame function
*/

class Engine {
    constructor(element) {
        // Setup the player
        this.player = new Player();

        // Setup enemies, making sure there are always three
        this.setupEnemies();
        this.setupBonuses();
        this.setupHearts();

        // Setup the <canvas> element where we will be drawing
        var canvas = document.createElement('canvas');
        canvas.width = GAME_WIDTH;
        canvas.height = GAME_HEIGHT;
        element.appendChild(canvas);

        this.ctx = canvas.getContext('2d');

        // Since gameLoop will be called out of context, bind it once here.
        this.gameLoop = this.gameLoop.bind(this);
    }

    /*
     The game allows for 5 horizontal slots where an enemy can be present.
     At any point in time there can be at most MAX_ENEMIES enemies otherwise the game would be impossible
     */
    setupEnemies() {
        if (!this.enemies) {
            this.enemies = [];
        }

        while (this.enemies.filter(e => !!e).length < MAX_ENEMIES) {
            this.addEnemy();
        }
    }
    setupBonuses() {
        if (!this.bonuses) {
            this.bonuses = [];
        }

        while (this.bonuses.filter(e => !!e).length < MAX_BONUSES) {
            this.addBonus();
        }
    }

    setupHearts() {
        if (!this.hearts) {
            this.hearts = [];
        }

        while (this.hearts.filter(e => !!e).length < MAX_BONUSES) {
            this.addHeart();
        }
    }

    // This method finds a random spot where there is no enemy, and puts one in there
    
    addEnemy() {
        var enemySpots = GAME_WIDTH / ENEMY_WIDTH; 

        var enemySpot;
        // Keep looping until we find a free enemy spot at random
        while (enemySpot === undefined || this.enemies[enemySpot]) {
            enemySpot = Math.floor(Math.random() * enemySpots );
        }

        this.enemies[enemySpot] = new Enemy(enemySpot * ENEMY_WIDTH);
    }
    
    addBonus() {
        var bonusSpots = GAME_WIDTH / ENEMY_WIDTH;

        var bonusSpot;
        // Keep looping until we find a free enemy spot at random
        while (bonusSpot === undefined || this.bonuses[bonusSpot]) {
            bonusSpot = Math.floor(Math.random() * bonusSpots );
        }

        this.bonuses[bonusSpot] = new Bonus(bonusSpot * ENEMY_WIDTH);
    }
    
    addHeart() {
        var heartSpots = GAME_WIDTH / ENEMY_WIDTH; 

        var heartSpot;
        // Keep looping until we find a free enemy spot at random
        while (heartSpot === undefined || this.hearts[heartSpot]) {
            heartSpot = Math.floor(Math.random() * heartSpots );
        }

        this.hearts[heartSpot] = new Heart(heartSpot * ENEMY_WIDTH);
    }

    // This method kicks off the game
    start() {
        this.score = 0;
        this.lastFrame = Date.now();

        // Listen for keyboard left/right and update the player
        document.addEventListener('keydown', e => {
            if (e.keyCode === LEFT_ARROW_CODE) {
                this.player.move(MOVE_LEFT);
            }
            else if (e.keyCode === RIGHT_ARROW_CODE) {
                this.player.move(MOVE_RIGHT);
            }
        });

        this.gameLoop();
    }

    /*
    This is the core of the game engine. The `gameLoop` function gets called ~60 times per second
    During each execution of the function, we will update the positions of all game entities
    It's also at this point that we will check for any collisions between the game entities
    Collisions will often indicate either a player death or an enemy kill

    In order to allow the game objects to self-determine their behaviors, gameLoop will call the `update` method of each entity
    To account for the fact that we don't always have 60 frames per second, gameLoop will send a time delta argument to `update`
    You should use this parameter to scale your update appropriately
     */
    gameLoop() {
        // Check how long it's been since last frame
        var currentFrame = Date.now();
        var timeDiff = currentFrame - this.lastFrame;

        // Increase the score!
        this.score += timeDiff;

        // Call update on all enemies
        this.enemies.forEach(enemy => enemy.update(timeDiff));
        this.bonuses.forEach(bonus => bonus.update(timeDiff));
        this.hearts.forEach(heart => heart.update(timeDiff));

        
        // Draw everything!
        this.ctx.drawImage(images['stars.png'], 0, 0); // draw the star bg
        this.enemies.forEach(enemy => enemy.render(this.ctx)); // draw the enemies
        this.bonuses.forEach(bonus => bonus.render(this.ctx)); // draw the bonuses
        this.hearts.forEach(heart => heart.render(this.ctx)); // draw the hearts
        this.player.render(this.ctx); // draw the player

        // Check if any enemies should die
        this.enemies.forEach((enemy, enemyIdx) => {
            if (enemy.y > GAME_HEIGHT) {
                delete this.enemies[enemyIdx];
            }
        });
        this.bonuses.forEach((bonus, bonusIdx) => {
            if (bonus.y > GAME_HEIGHT) {
                delete this.bonuses[bonusIdx];
            }
        });
        this.hearts.forEach((heart, heartIdx) => {
            if (heart.y > GAME_HEIGHT + 2000) {
                delete this.hearts[heartIdx];
            }
        });
        this.setupEnemies();
        this.setupBonuses();
        this.setupHearts();
        
        
        // Check if heart is claimed
        if (this.isHeartClaimed()){
            lives++;
            var bonusaudio = new Audio('/audio/heal.mp3');
            bonusaudio.play();
        }
        
        // Check if bonus is claimed
        if (this.isBonusClaimed()){
            this.score = Math.floor(this.score * 1.1 + 1500);
            var bonusaudio = new Audio('/audio/eatsound.mp3');
            bonusaudio.play();
        }

        // Check if player is dead
        if (this.isPlayerDead() && lives <= 0) {
            // If they are dead, then it's game over!
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score + '\n GAME OVER', 75, 350);
        }
 
        else {
            // If player is not dead, then draw the score
            this.ctx.font = 'bold 30px Impact';
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillText(this.score, 5, 30);
            this.ctx.fillText("LIVES: "+lives, 280, 30);

            // Set the time marker and redraw
            this.lastFrame = Date.now();
            requestAnimationFrame(this.gameLoop);
        }
    }
    isBonusClaimed() {
            var bonusClaimed = false;
        this.bonuses.forEach((bonus, bonusIdx) => {

           if(counter >= bonusGracePeriod + GRACE_PERIOD_LENGTH) {
                if (bonus.x === this.player.x && bonus.y >= this.player.y - 150 && bonus.y < this.player.y - 100 ) {
                    bonusClaimed = true;
                    bonusGracePeriod = counter;
                }
            }

        });

        return bonusClaimed;
        
        
    }
    
    isHeartClaimed() {
        var heartClaimed = false;
        this.hearts.forEach((heart, heartIdx) => {

           if(counter >= bonusGracePeriod + GRACE_PERIOD_LENGTH) {
                if (heart.x === this.player.x && heart.y >= this.player.y - 150 && heart.y < this.player.y - 100 ) {
                    heartClaimed = true;
                    bonusGracePeriod = counter;
                    var healAudio = new Audio('/audio/heal.mp3');
                    healAudio.play();
                }
            }

        });

        return heartClaimed;
    }

    isPlayerDead() {

        // TODO: fix this function!
        var playerDead = false;
        this.enemies.forEach((enemy, enemyIdx) => {

           if(counter >= gracePeriod + GRACE_PERIOD_LENGTH) {
                if (enemy.x === this.player.x && enemy.y >= this.player.y - 150 && enemy.y < this.player.y - 100 ) {
                    playerDead = true;
                    lives--;
                    gracePeriod = counter;
                    var bonusaudio = new Audio('/audio/catsound.mp3');
            bonusaudio.play();
                }
            }

        });

        return playerDead;
    }

}

// This section will start the game
var gameEngine = new Engine(document.getElementById('app'));
gameEngine.start();