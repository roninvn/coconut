var Component = require('./Component').Component,
    event = require('event'),
    util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp;

/** @member coconut.components
 * @class
 * @extends coconut.components.Component
 */
var Collides = Component.extend(/** @scope coconut.components.Collides# */{
    collisionMap: null,

    init: function(opts) {
        @super;

        event.addListener(this, 'entity_changed', util.callback(this, this.updateBindings));
    },

    updateBindings: function() {
        // If entity changed remove the previous listener
        if (this._entityWorldListener) {
            event.removeListener(this._entityWorldListener);
            delete this._entityWorldListener;
        }

        var e = this.get('entity');
        if (!e) {
            return;
        }

        // Listen for world changes on entity
        this._entityWorldListener = event.addListener(e, 'world_changed', util.callback(this, this.updateBindings));

        // Reference to the velocity of the entity
        this.bindTo('velocity', e);

        var w = e.get('world');

        if (!w) {
            return;
        }


        // FIXME - HACK! Assuming first entity is the map
        this.set('collisionMap', w.entities.getAt(0));
    },

    update: function(dt) {

        var ent = this.entity,
            pos = ent.get('position'),
            prevPos = ent.get('previousPosition'),
            distance = geo.ccpSub(pos, prevPos);

        var newPos = ccp(prevPos.x, prevPos.y);

        var tileSize = 16; // FIXME get from map

        var grounded = false;
        function checkCollisionStep(dist, newPos) {
            // Get velocity so we can reduce it on collision
            var velocity = this.get('velocity');

            if (dist.x > 0) {
                // Walking right
                var tileX = false;

                var newX = newPos.x + dist.x;
                if ((tileX = this.collisionYEdge(ccp(newX + ent.contentSize.width +1, newPos.y))) !== false) {
                    dist.x = 0;
                    newPos.x = (tileX * tileSize) - ent.contentSize.width; // Move to the edge of the tile
                    velocity.x = 0;
                } else {
                    newPos.x = newX;
                }

            } else if (dist.x < 0) {
                // Walking left
                var tileX = false;

                var newX = newPos.x + dist.x;
                if ((tileX = this.collisionYEdge(ccp(newX, newPos.y))) !== false) {
                    dist.x = 0;
                    newPos.x = (tileX +1) * tileSize; // Move to the edge of the tile
                    velocity.x = 0;
                } else {
                    newPos.x = newX;
                }
            }


            if (dist.y > 0) {
                // Falling down
                var tileY = false;

                var newY = newPos.y + dist.y;
                if ((tileY = this.collisionXEdge(ccp(newPos.x, newY + ent.contentSize.height +1))) !== false) {
                    grounded = true;
                    newPos.y = (tileY * tileSize) - ent.contentSize.height; // Move to the edge of the tile
                    velocity.y = 0;
                } else {
                    newPos.y = newY;
                }
            } else if (dist.y < 0) {
                // Jumping up
                var tileY = false;

                var newY = newPos.y + dist.y;
                // Hit head?
                if ((tileY = this.collisionXEdge(ccp(newPos.x, newY))) !== false) {
                    newPos.y = (tileY +1) * tileSize; // Move to the edge of the tile
                    velocity.y = 0;
                } else {
                    newPos.y = newY;
                }
            }

            ent.set('grounded', grounded);

            // Update velocity which is bound to the entity
            this.set('velocity', velocity);
        }


        // Do mulitple collision checks if moving at a high speed
        var d = ccp(0, 0),
            step = tileSize /1.5;
        while (distance.x != 0 || distance.y != 0) {

            if (distance.x > 0) {
                d.x = (distance.x > step) ? step : distance.x;
            } else if (distance.x < 0) {
                d.x = (distance.x < -step) ? -step : distance.x;
            } else {
                d.x = 0;
            }
            distance.x -= d.x;

            if (distance.y > 0) {
                d.y = (distance.y > step) ? step : distance.y;
            } else if (distance.y < 0) {
                d.y = (distance.y < -step) ? -step : distance.y;
            } else {
                d.y = 0;
            }
            distance.y -= d.y;

            checkCollisionStep.call(this, d, newPos);
            ent.set('position', newPos);
        }

    },

    collisionYEdge: function(point) {
        var ent = this.entity,
            x = point.x,
            y = point.y,
            w = ent.contentSize.width,
            h = ent.contentSize.height;

        var tileSize = 16; // TODO get from map

        var tilePixelsY = y - (y % tileSize);   // Find tile Y position in pixels
        var bottomEdge = y + h -1;      // How far to measure to


        // Coordinates in map space
        var tileX = Math.floor(x / tileSize);
        var tileY = Math.floor(tilePixelsY / tileSize);

        while (tilePixelsY <= bottomEdge){
            if(this.get('collisionMap').isSolidTile(ccp(tileX, tileY))) {
                return tileX;
            }

            tileY++;
            tilePixelsY += tileSize;
        }

        return false;
    },

    collisionXEdge: function(point) {
        var ent = this.entity,
            x = point.x,
            y = point.y,
            w = ent.contentSize.width,
            h = ent.contentSize.height;

        var tileSize = 16; // TODO get from map

        var tilePixelsX = x - (x % tileSize);   // Find tile X position in pixels
        var rightEdge = x + w -1;      // How far to measure to

        // Coordinates in map space
        var tileX = Math.floor(tilePixelsX / tileSize);
        var tileY = Math.floor(y / tileSize);


        while(tilePixelsX <= rightEdge){
            if(this.collisionMap.isSolidTile(ccp(tileX, tileY))) {
                return tileY;
            }

            tileX++;
            tilePixelsX += tileSize;
        }

        return false;
    },
});

exports.Collides = Collides;
