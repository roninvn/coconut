/** @member coconut.components
 * @class
 * @extends Thing
 */
var Component = BObject.extend(/** @scope coconut.components.Component# */{
    entity: null,

    init: function(opts) {
        @super;
    },

    update: function(dt) {
    }
});

exports.Component = Component;
