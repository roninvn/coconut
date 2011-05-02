/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Component = require('./Component').Component,
    geo = require('geometry'),
    ccp = geo.ccp;

/** @member coconut.components
 * @class
 * @extends coconut.components.Component
 */
var Gravitate = Component.extend(/** @scope coconut.components.Gravitate# */{
	gravitation: 640,  // pixels per second per second (Approx. Earth gravity assuming 64 pixels = 1 metre)
	terminalVelocity: 1000, // maximum pixels per second

	init: function () {
		Gravitate.superclass.init.call(this);
	},

	update: function (dt) {
        var ent = this.get('entity'),
            vel = ent.get('velocity');

		if (vel.y > this.terminalVelocity) {
			return;
		}

		vel.y += this.gravitation * dt;

		if (vel.y > this.terminalVelocity) {
			vel.y = this.terminalVelocity;
		}

		ent.set('velocity', vel);
	}

});

exports.Gravitate = Gravitate;
