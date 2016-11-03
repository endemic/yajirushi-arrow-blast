/*jslint sloppy: true, plusplus: true */
/*globals window, Arcadia, LevelSelectScene, CreditsScene, localStorage, LEVELS, Vertex, Edge */

(function (root) {
    'use strict';

    var GameScene = function (options) {
        Arcadia.Scene.call(this, options);
        options = options || {};

        var scene =  this;

        this.color = 'lightgrey';

        this.player = new Arcadia.Shape({
            size: {width: 32, height: 32},
            vertices: 0,
            color: 'yellow',
            border: '2px black',
            speed: 400,
            ticks: 0,
            limit: 750
        });
        this.player.add(new Arcadia.Label({
            color: 'black',
            text: '→',
            font: '32px monospace',
            position: {x: 0, y: -3}
        }));
        this.add(this.player);

        this.player.reset = function () {
            this.position = {x: 0, y: 0};
            this.velocity = {x: 0, y: 0};
        };

        this.player.launch = function () {
            this.velocity = {
                x: Math.cos(this.rotation),
                y: Math.sin(this.rotation)
            };
            scene.particles.startAt(this.position.x, this.position.y);
        };

        this.player.reset();

        this.player.intersectsCircle = function (other) {
            // assumes `other` is a circle, not ellipse
            return Arcadia.distance(this.position, other.position) < this.size.width / 2 + other.size.width / 2;
        };

        // Place a few platforms
        this.platforms = [];

        while (this.platforms.length < 4) {
            var p = new Arcadia.Shape({
                size: {width: 32, height: 32},
                vertices: 0,
                color: 'lime',
                border: '2px black'
            });

            this.platforms.push(p);
            this.add(p);
        }

        this.platforms[0].position = {x: scene.player.position.x + 100, y: scene.player.position.y + 100};
        this.platforms[1].position = {x: scene.player.position.x + 100, y: scene.player.position.y - 100};
        this.platforms[2].position = {x: scene.player.position.x - 100, y: scene.player.position.y + 100};
        this.platforms[3].position = {x: scene.player.position.x - 100, y: scene.player.position.y - 100};

        var particleCount = 50;
        this.particles = new Arcadia.Emitter(function () {
            return new Arcadia.Shape({
                vertices: 0,
                size: {width: 8, height: 8},
                color: 'yellow',
                border: '2px black'
            });
        }, particleCount);
        this.particles.fade = true;
        this.add(this.particles);
    };

    GameScene.prototype = new Arcadia.Scene();

    GameScene.prototype.onPointEnd = function (points) {
        Arcadia.Scene.prototype.onPointEnd.call(this, points);
        this.player.launch();
    };

    GameScene.prototype.onKeyUp = function (key) {
        this.player.launch();
    };

    GameScene.prototype.update = function (delta) {
        Arcadia.Scene.prototype.update.call(this, delta);
        var scene = this;

        // Rotate player based on delta - why is this in seconds again? arghhhh
        scene.player.ticks += delta * 1000;

        if (scene.player.ticks >= scene.player.limit) {
            scene.player.ticks = 0;
            scene.player.rotation += Math.PI / 4;
            if (scene.player.rotation >= Math.PI * 2) {
                scene.player.rotation = 0;
            }
        }

        if (this.player.position.x > scene.size.width / 2 ||
            this.player.position.x < -scene.size.width / 2 ||
            this.player.position.y > scene.size.height / 2 ||
            this.player.position.y < -scene.size.height / 2) {
            this.player.reset();
        }

        this.platforms.forEach(function (platform) {
            if (scene.player.intersectsCircle(platform) &&
                platform !== scene.player.currentPlatform) {
                scene.player.reset();
                scene.player.position.x = platform.position.x;
                scene.player.position.y = platform.position.y;
                scene.player.currentPlatform = platform;
            }
        });
    };

    root.GameScene = GameScene;
}(window));
