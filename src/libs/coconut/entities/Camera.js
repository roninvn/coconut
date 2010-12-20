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
    },

    get_boundingBox: function() {
        var rect = @super;
        rect.origin = geo.ccpAdd(rect.origin, this.get('offset'));

        return rect;
    }


});

var OffsetTo = cocos.actions.ActionInterval.extend({
    dstOffset: null,
    startOffset: null,
    diffOffset: null,

    init: function(opts) {
        @super;

        this.set('dstOffset', util.copy(opts.offset));
    },

    startWithTarget: function(target) {
        @super;

        this.set('startOffset', util.copy(target.get('offset')));
        this.set('diffOffset', geo.ccpSub(this.get('dstOffset'), this.get('startOffset')));
    },

    update: function(t) {
        var start = this.get('startOffset'),
            diff  = this.get('diffOffset');
        this.target.set('offset', geo.ccp(start.x + diff.x * t, start.y + diff.y * t));
    }
});



var PlayerCamera = Camera.extend(/** @lends coconut.entities.PlayerCamera# */{
    trackDirection: 0,
    entityOffset: 32,
    moveTolerance: 64,

    /**
     * Similar to a normal camera but will adjust itself to an optimal position
     * for a 2D side scroller
     * @extends coconut.entities.Camera
     * @constructs
     */
    init: function(opts) {
        @super;
        
        this.set('worldBound', false);
        this.set('trackDirection', PlayerCamera.TRACK_LEFT);
    },

    update: function() {
        var entity = this.get('targetEntity'),
            entityBox = entity.get('boundingBox'),  // Rectangle around the entity
            entityBoxRel = util.copy(entityBox),
            cameraBox = this.get('boundingBox'),    // The camera view area
            entityPrevPosition = this.entityPrevPosition_ || util.copy(entityBox.origin),  // Where the entity was previous frame
            vector = geo.ccpSub(entityBox.origin, entityPrevPosition),      // How the entity moved since last frame
            trackDirection = this.get('trackDirection'),
            entityOffset = this.get('entityOffset'),
            moveTolerance = this.get('moveTolerance'),
            offset = this.get('offset');

        // Adjust entityBox origin so it's relative to the camera
        entityBoxRel.origin = geo.ccpSub(entityBoxRel.origin, cameraBox.origin);

        // Where the camera will move to
        var newPosition = util.copy(entityBox.origin);

        // Update entity's previous position so we can calculate the vector next frame
        this.entityPrevPosition_ = util.copy(entityBox.origin);


        if ((entityBoxRel.origin.x + entityBoxRel.size.width > (cameraBox.size.width/2) + moveTolerance && trackDirection == PlayerCamera.TRACK_LEFT) ||
        (entityBoxRel.origin.x < (cameraBox.size.width/2) - moveTolerance && trackDirection == PlayerCamera.TRACK_RIGHT)) {
            // Swap directions
            trackDirection = -trackDirection;
            this.set('trackDirection', trackDirection);

            var dstOffset = geo.ccp(trackDirection * entityOffset, offset.y);
            if (trackDirection == PlayerCamera.TRACK_RIGHT) {
                dstOffset.x += entityBoxRel.size.width;
            }

            if (this.offsetAction_ && this.actions) {
                cocos.ActionManager.get('sharedManager').removeAction(this.offsetAction_);
            }
            this.offsetAction_ = OffsetTo.create({duration: 0.3, offset: dstOffset});    
            this.runAction(this.offsetAction_);
        }
        
        else if ((vector.x > 0 && trackDirection == PlayerCamera.TRACK_LEFT) || (vector.x < 0 && trackDirection == PlayerCamera.TRACK_RIGHT)) {
            this.set('offset', geo.ccp(offset.x - vector.x, offset.y));
        } else {
        }


        this.set('position', newPosition);

        return;

        // Entity moving it opposite direction that we're tracking, watch if
        // they enter the end 3rd of the screen then change tracking direction
        if ((entityBoxRel.origin.x < cameraBox.size.width * (1/3) && trackDirection == PlayerCamera.TRACK_RIGHT) ||
            (entityBoxRel.origin.x + entityBoxRel.size.width > cameraBox.size.width * (2/3) && trackDirection == PlayerCamera.TRACK_LEFT)) {

            // Swap directions
            trackDirection = -trackDirection;
            this.set('trackDirection', -trackDirection);

            // Move camera but adjust offset to it appears in the original
            // location, then we'll animate the offset to where it should be
            //this.set('offset', geo.ccp(entityBoxRel.origin.x + offset.x, offset.y));

            var dstOffset = geo.ccp(trackDirection * entityOffset, offset.y);
            var action = OffsetTo.create({duration: 3, offset: dstOffset});    
            //this.runAction(action);

            this.set('offset', dstOffset);

        }


        console.log(trackDirection);
        
        // Entity is moving in the direction we're tracking so move camera to follow them
        // Moving RIGHT
        if (vector.x > 0 && trackDirection == PlayerCamera.TRACK_RIGHT){
            //if (Math.round(entityBoxRel.origin.x + entityBoxRel.size.width) >= Math.round(cameraBox.size.width /2) - entityOffset) {
                newPosition.x = Math.round(entityBox.origin.x);
            //}
        }
        
        // Moving LEFT
        else if (vector.x < 0 && trackDirection == PlayerCamera.TRACK_LEFT) {
            //if (Math.round(entityBoxRel.origin.x) <= Math.round((cameraBox.size.width + entityOffset) /2)) {
                newPosition.x = Math.round(entityBox.origin.x);
            //}
        }




        this.set('position', newPosition);
    }
});

PlayerCamera.TRACK_LEFT = -1;
PlayerCamera.TRACK_RIGHT = 1;

exports.Camera = Camera;
exports.PlayerCamera = PlayerCamera;
