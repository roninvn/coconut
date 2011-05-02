/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var Component = require('./Component').Component,
    events = require('events'),
    util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp;

var Velocity = Component.extend(/** @lends coconut.components.Velocity# */{
    velocity: null,

    /**
     * @memberOf coconut.components
     * @extends coconut.components.Component
     * @constructs
     */
    init: function () {
        Velocity.superclass.init.call(this);

        this.set('velocity', ccp(0, 0));

        events.addListener(this, 'entity_changed', util.callback(this, function (oldVal) {
            var ent = this.get('entity');

            // Bind the entities velocity to this
            ent.bindTo('velocity', this);
        }));
    },

    update: function (dt) {
        var entity = this.get('entity'),
            dist   = geo.ccpMult(this.get('velocity'), ccp(dt, dt)),
            oldPos = entity.get('position'),
            newPos = geo.ccpAdd(oldPos, dist);

        entity.set('position', newPos);
    }
});

exports.Velocity = Velocity;
