var cocos = require('cocos2d'),
    event = require('event'),
    util  = require('util'),
    geo   = require('geometry'),
    Entity = require('./Entity').Entity,
    components = require('../components');

var Camera = Entity.extend(/** @lends coconut.entities.Camera# */{
    /**
     * Prevent camera from leaving edge of the world
     * @type Boolean
     */
    worldBound: true,

    /**
     * Entity for the camera to always focus on
     * @type coconut.entities.Entity
     */
    targetEntity: null,

    /**
     * Position offset when tracking an entity
     * @type geometry.Point
     */
    offset: null,

    /**
     * An invisible entity used to represent the camera location.
     * You can have multiple cameras in game and switch between them at will.
     *
     * @memberOf coconut.entities
     * @extends coconut.entities.Entity
     * @constructs
     */
    init: function() {
        @super;

        /*
        function updateIcon() {
            var s = this.get('contentSize');
            this.icon_.set('position', geo.ccp(s.width/2, s.height/2));
        }
        this.icon_ = cocos.nodes.Sprite.create({file: '/resources/camera-icon.png'});
        this.icon_.set('opacity', 0.5);
        this.addChild(this.icon_);

        // When size changes readjust the icon so it's always centred
        event.addListener(this, 'contentsize_changed', util.callback(this, updateIcon));
        */

        this.set('offset', geo.ccp(0, 0));

        // Camera is always the size of the entire view
        var d = cocos.Director.get('sharedDirector');
        this.bindTo('contentSize', d, 'winSize');


        this.scheduleUpdate();
    },

    get_rect: function() {
        var p = this.get('position'),
            s = this.get('contentSize'),
            a = this.get('anchorPointInPixels');
        return geo.rectMake(p.x - a.x, p.y - a.y, s.width, s.height);
    },

    update: function(dt) {
        var e = this.get('targetEntity'),
            pos = geo.ccpAdd(geo.ccpAdd(e.get('position'), e.get('anchorPointInPixels')), this.get('offset'));



        // Test if moved outside of world bounds
        if (this.get('worldBound')) {
            var anchor = this.get('anchorPointInPixels'),
                worldRect = this.get('world').get('boundingBox'),
                size = this.get('contentSize'),
                winSize = cocos.Director.get('sharedDirector').get('winSize');

            if (pos.x - anchor.x < worldRect.origin.x) {
                pos.x = worldRect.origin.x + anchor.x;
            } else if (pos.x - anchor.x + size.width > worldRect.origin.x + worldRect.size.width) {
                pos.x = worldRect.origin.x + worldRect.size.width - size.width + anchor.x;
            }
            if (pos.y - anchor.y < worldRect.origin.y) {
                pos.y = worldRect.origin.y + anchor.y;
            } else if (pos.y - anchor.y + size.height > worldRect.origin.y + worldRect.size.height) {
                pos.y = worldRect.origin.y + worldRect.size.height - size.height + anchor.y;
            }
        }

        this.set('position', pos);
    }


});


var PlayerCamera = Camera.extend(/** @lends coconut.entities.PlayerCamera# */{
    trackDirection: 0,

    /**
     * Similar to a normal camera but will adjust itself to an optimal position
     * for a 2D side scroller
     * @extends coconut.entities.Camera
     * @constructs
     */
    init: function(opts) {
        @super;
        
        this.set('worldBound', false);
        this.set('trackDirection', PlayerCamera.TRACK_RIGHT);
    },

    update: function() {
        var e = this.get('targetEntity'),
            oldPos = this.get('position');


        // Camera view area
        var camRect = geo.rectMake(0, 0, 0 ,0);
        camRect.origin = geo.ccpSub(oldPos, this.get('anchorPointInPixels'));
        camRect.size = util.copy(this.get('contentSize'));

        var entityPosition = e.get('position');
        // Round off coords to prevent wobbly camera
        entityPosition.x = Math.round(entityPosition.x);
        entityPosition.y = Math.round(entityPosition.y);

        var entityPrevPosition = this.entityPrevPosition_ || entityPosition,
            distance = geo.ccpSub(entityPosition, entityPrevPosition);

        this.entityPrevPosition_ = util.copy(entityPosition);

        var entRect = geo.rectMake(0, 0, 0, 0);
        entRect.origin = geo.ccpSub(entityPosition, e.get('anchorPointInPixels'));
        entRect.size = util.copy(e.get('contentSize'));

        var entCamRect = util.copy(entRect);
        entCamRect.origin = geo.ccpSub(entRect.origin, camRect.origin);


        var tracking = this.get('trackDirection');
        if (distance.x > 0) {
            // Moving right
            if (tracking == PlayerCamera.TRACK_RIGHT) {
                // Already tracking the player moving right so just update the position
                if (this.get('offset').x > camRect.size.width * (0.2/3)) {
                    // Readjust camera if moved left recently
                    this.set('offset', geo.ccp(this.get('offset').x - distance.x, 0));
                }
            } else {
                // Player recently changed direction

                if (entCamRect.origin.x + entCamRect.size.width > camRect.size.width * (2/3)) {
                    // Player has walked enough so now follow player
                    this.set('offset', geo.ccp(camRect.size.width * (0.2/3), 0));
                    this.set('trackDirection', PlayerCamera.TRACK_RIGHT);
                } else {
                    // Adjust offset so camera appears still
                    this.set('offset', geo.ccp(this.get('offset').x - distance.x, 0));
                }
            }
        } else if (distance.x < 0) {
            if (tracking == PlayerCamera.TRACK_LEFT) {
                // Already tracking the player moving left so just update the position
                if (this.get('offset').x < -camRect.size.width * (0.2/3)) {
                    // Readjust camera if moved right recently
                    this.set('offset', geo.ccp(this.get('offset').x - distance.x, 0));
                }
            } else {
                // Player recently changed direction

                if (entCamRect.origin.x < camRect.size.width * (1/3)) {
                    // Player has walked enough so now follow player
                    this.set('offset', geo.ccp(-camRect.size.width * (0.2/3), 0));
                    this.set('trackDirection', PlayerCamera.TRACK_LEFT);
                } else {
                    // Adjust offset so camera appears still
                    this.set('offset', geo.ccp(this.get('offset').x - distance.x, 0));
                }
            }
        }
        


        var newPos = geo.ccpAdd(entityPosition, this.get('offset'));
        this.set('position', newPos);
    }
});

PlayerCamera.TRACK_LEFT = 1;
PlayerCamera.TRACK_RIGHT = 2;

exports.Camera = Camera;
exports.PlayerCamera = PlayerCamera;
