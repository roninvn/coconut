var Component = require('./Component').Component,
    geo = require('geometry'),
    ccp = geo.ccp;

var STATES = {
	idle:  1 << 0,
	left:  1 << 1,
	right: 1 << 2,
	up:    1 << 3,
	down:  1 << 4,
	jump:  1 << 5,
	fire:  1 << 6
};

/** @member coconut.components
 * @class
 * @extends coconut.components.Component
 */
var Actor = Component.extend(/** @scope coconut.components.Actor# */{
    _jumpHeldFor: 0,
    maxJumpTime: 0.25,
    jumpVelocity: 200,

    init: function(opts) {
        @super;
    },

    update: function(dt) {
        var entity = this.get('entity'),
            // Entity's controller class
            controller = entity.get('controller'),
            // Speed of entity
            velocity = entity.get('velocity'),
            // Entity is on the ground
            grounded = entity.get('grounded'),
            // Entity's speed adjustments
            acceleration = entity.get('acceleration'),
            deceleration = entity.get('deceleration'),
            // Maximum walking speed
            maxSpeed = entity.get('maximumSpeed');

		if (controller === undefined) {
			return;
		}

        // UP key pressed -- jump
		if (controller.hasState(STATES.up)) {

            // Just taking off
            if (grounded) {
                controller.addState(STATES.jump);
                this._jumpHeldFor = 0;
                velocity.y = -this.get('jumpVelocity');
            }
            
            // Still in the air
            else {
                this._jumpHeldFor += dt;
                // Add some more height while holding the button
                if (this._jumpHeldFor < this.get('maxJumpTime')) {
                    velocity.y = -this.get('jumpVelocity');
                }
            }
        }
        
        else {
            // Prevent pressing the key again while in the air to add more height
            this._jumpHeldFor = this.get('maxJumpTime');

            // Just landed on the ground remove jump state
            if (grounded) {
                controller.removeState(STATES.jump);
            }
        }


        // Moving on the ground
        if (grounded) {
            // Walking left
            if (controller.hasState(STATES.left)) {
                velocity.x -= acceleration * dt;
                if (velocity.x < -maxSpeed) {
                    velocity.x = -maxSpeed;
                }
            }
            
            // Friction - Slow down if moving left but not pressing left button
            else if (velocity.x < 0) {
                velocity.x += deceleration * dt;
                if (velocity.x > 0) {
                    velocity.x = 0;
                }
            }

            // Walking right
            if (controller.hasState(STATES.right)) {
                velocity.x += acceleration * dt;
                if (velocity.x > maxSpeed) {
                    velocity.x = maxSpeed;
                }
            }
            
            // Friction - Slow down if moving right but not pressing right button
            else if (velocity.x > 0) {
                velocity.x -= deceleration * dt;
                if (velocity.x < 0) {
                    velocity.x = 0;
                }
            }
        }
        
        // Moving in the air
        else {
            // Speed change is reduced while in the air
            if (controller.hasState(STATES.right)) {
                velocity.x += (acceleration / 1.5) *dt;
                if (velocity.x > maxSpeed) {
                    velocity.x = maxSpeed;
                }
            } else if (controller.hasState(STATES.left)) {
                velocity.x -= (acceleration / 1.5) *dt;
                if (velocity.x < -maxSpeed) {
                    velocity.x = -maxSpeed;
                }
            }

            // Velocity goes down due to air resistence
            if (velocity.x > 0) {
                velocity.x -= (deceleration / 2) * dt;
                if (velocity.x < 0) {
                    velocity.x = 0;
                }
            } else if (velocity.x < 0) {
                velocity.x += (deceleration / 2) * dt;
                if (velocity.x > 0) {
                    velocity.x = 0;
                }
            }
        }


		// Set new velocity
		entity.set('velocity', velocity);

    }
});
Actor.STATES = STATES;

exports.Actor = Actor;
