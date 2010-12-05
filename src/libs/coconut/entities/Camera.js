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


        // Camera is always the size of the entire view
        var d = cocos.Director.get('sharedDirector');
        this.bindTo('contentSize', d, 'winSize');

        // When target changes update tracking
        event.addListener(this, 'targetentity_changed', util.callback(this, this.updateEntityListener));
    },

    updateEntityListener: function(oldEntity) {
        if (this.targetEntityListener_) { 
            event.removeListener(this.targetEntityListener_);
        }

        var e = this.get('targetEntity');
        if (e) {
            this.targetEntityListener_ = event.addListener(e, 'position_changed', util.callback(this, this.updateEntityTracking));
        }
    },

    get_rect: function() {
        var p = this.get('position'),
            s = this.get('contentSize'),
            a = this.get('anchorPointInPixels');
        return geo.rectMake(p.x - a.x, p.y - a.y, s.width, s.height);
    },

    updateEntityTracking: function(oldPos) {
        var e = this.get('targetEntity'),
            pos = geo.ccpAdd(e.get('position'), e.get('anchorPointInPixels')),
            anchor = this.get('anchorPointInPixels'),
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

        /*
        if (size.height < worldSize.height) {
            if (pos.y > top) {
                pos.y = top;
            } else if (pos.y < bottom) {
                pos.y = bottom;
            }
        }
        */


        this.set('position', pos);
    }


});

exports.Camera = Camera;
