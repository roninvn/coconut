var Component = require('./Component').Component,
    event = require('event'),
    util = require('util'),
    geo = require('geometry'),
    ccp = geo.ccp;

/** @member coconut.components
 * @class
 * @extends coconut.components.Component
 */
var Velocity = Component.extend(/** @scope coconut.components.Velocity# */{
    velocity: null,

    init: function(opts) {
        @super;

        this.set('velocity', ccp(0, 0));

        event.addListener(this, 'entity_changed', util.callback(this, function(oldVal) {
            var ent = this.get('entity');

            // Bind the entities velocity to this
            ent.bindTo('velocity', this);
        }));
    },

    update: function(dt) {
        var entity = this.get('entity'),
            dist   = geo.ccpMult(this.get('velocity'), ccp(dt, dt)),
            oldPos = entity.get('position'),
            newPos = geo.ccpAdd(oldPos, dist);

        entity.set('position', newPos);
    }
});

exports.Velocity = Velocity;
