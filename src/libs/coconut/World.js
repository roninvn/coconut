/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var cocos  = require('cocos2d'),
    util   = require('util'),
    events = require('events'),
    geo    = require('geometry');

var World = cocos.nodes.Layer.extend(/** @scope coconut.World# */{
    entities: null,
    keyboardObservers: null,
    cameras: null,
    currentCamera: null,
    worldSize: null,

    /**
     * @memberOf coconut
     * @extends cocos.nodes.Layer
     * @constructs
     */
    init: function () {
        World.superclass.init.call(this);

        this.set('isKeyboardEnabled', true);

        this.set('entities', BArray.create());
        this.set('keyboardObservers', BArray.create());
        this.set('cameras', BArray.create());

        events.addListener(this, 'currentcamera_changed', util.callback(this, this.updateCameraTracking));
    },

    addCamera: function (camera) {
        this.get('cameras').push(camera);

        if (!this.get('currentCamera')) {
            this.set('currentCamera', camera);
        }

        this.addEntity(camera);
    },

    addEntity: function (entity) {
        if (!this.get('worldSize')) {
            this.set('worldSize', util.copy(entity.get('contentSize')));
        }
        this.entities.push(entity);
        entity.set('world', this);
        this.addChild(entity);
        return this;
    },
    removeEntity: function (entity) {
        var idx = this.entities.indexOf(entity);
        if (idx == -1) {
            throw "Entity isn't part of this world";
        }
        entity.set('world', null);

        this.entities.splice(idx, 1);
        this.removeChild(entity);
        return this;
    },

    registerKeyboardObserver: function (obj) {
        this.keyboardObservers.push(obj);
    },

    deregisterKeyboardObserver: function (obj) {
        var idx = this.keyboardObservers.indexOf(obj);
        if (idx == -1) {
            throw "Object isn't a keyboard observer";
        }

        this.keyboardObservers.splice(idx, 1);
    },

    keyDown: function (evt) {
        for (var i = 0, len = this.keyboardObservers.length; i < len; i++) {
            var thing = this.keyboardObservers.getAt(i);
            if (thing.keyDown) {
                thing.keyDown.apply(thing, arguments);
            }
        }
    },

    keyUp: function (evt) {
        for (var i = 0, len = this.keyboardObservers.length; i < len; i++) {
            var thing = this.keyboardObservers.getAt(i);
            if (thing.keyUp) {
                thing.keyUp.apply(thing, arguments);
            }
        }
    },

    updateView: function () {
        var cam = this.get('currentCamera'),
            camPos = geo.ccpAdd(cam.get('position'), cam.get('offset')),
            camAnchor = cam.get('anchorPointInPixels'),
            newPos = geo.ccpAdd(geo.ccpNeg(camPos), camAnchor);

        this.set('position', newPos);
    },

    updateCameraTracking: function (oldCamera) {
        if (this.cameraListener_) {
            events.removeListener(this.cameraListener_);
        }

        this.cameraListener_ = events.addListener(this.get('currentCamera'), 'position_changed', util.callback(this, this.updateView));
        this.updateView();
    },

    get_boundingBox: function () {
        var worldSize = this.get('worldSize');
        return geo.rectMake(0, 0, worldSize.width, worldSize.height);
    }

});

exports.World = World;
