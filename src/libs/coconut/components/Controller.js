/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Component = require('./Component').Component,
    events = require('events'),
    geo = require('geometry'),
    util = require('util'),
    ccp = geo.ccp;

var STATES = require('./Actor').Actor.STATES;

/** @member coconut.components
 * @class
 * @extends coconut.components.Component
 */
var Controller = Component.extend(/** @scope coconut.components.Controller# */{
	states: STATES.idle,

    init: function () {
        Controller.superclass.init.call(this);

        events.addListener(this, 'entity_changed', util.callback(this, function (oldVal) {
            if (oldVal && oldVal.get('controller') == this) {
                oldVal.set('controller', null);
            }

            var e = this.get('entity');
            if (e) {
                e.set('controller', this);
            }
        }));
    },

    update: function (dt) {
    },

    initEntity: function (self, key, entity) {
		entity.controller = this;
    },

	addState: function (state) {
		this.states |= state;
	},

	removeState: function (state) {
		this.states ^= state;
	},

	hasState: function (state) {
		return this.states & state;
	}
});

var keyMap = {
    87 : STATES.up,     // W
    65 : STATES.left,   // A
    83 : STATES.down,   // S
    68 : STATES.right,  // D
    32 : STATES.fire,   // SPACE

    // ARROWS
    38 : STATES.up,     // W
    37 : STATES.left,   // A
    40 : STATES.down,   // S
    39 : STATES.right   // D
};

/** @member coconut.components
 * @class
 * @extends coconut.components.Controller
 */
var KeyboardController = Controller.extend(/** @scope coconut.components.KeyboardController# */{

	init: function () {
        KeyboardController.superclass.init.call(this);

        // Bind to the world of the entity
        events.addListener(this, 'entity_changed', util.callback(this, function (oldVal) {

            if (this.entity) {
                this.bindTo('world', this.entity);
            } else {
                this.unbind('world');
            }
        }));

        // Register with world's keyboard handler
        events.addListener(this, 'world_changed', util.callback(this, function (oldVal) {
            if (oldVal) {
                oldVal.deregisterKeyboardObserver(this);
            }

            var w = this.get('world');
            if (w) {
                w.registerKeyboardObserver(this);
            }
        }));
	},

	keyDown: function (evt) {
		var key = keyMap[evt.keyCode];
		if (!key) {
			return;
		}

		this.addState(key);
	},

	keyUp: function (evt) {
		var key = keyMap[evt.keyCode];
		if (!key) {
			return;
		}

		this.removeState(key);
	}

});


exports.Controller = Controller;
exports.KeyboardController = KeyboardController;
