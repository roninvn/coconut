var cocos = require('cocos2d'),
    event = require('event'),
    util  = require('util'),
    geo   = require('geometry'),
    components = require('../components');

var Entity = cocos.nodes.Node.extend(/** @lends coconut.entities.Entity# */{
    world: null,
    components: null,
    previousPosition: null,

    /**
     * @member coconut.entities
     * @extends cocos.nodes.Node
     * @constructs
     */
    init: function() {
        @super;

        this.components = [];
        this.scheduleUpdate();

        event.addListener(this, 'position_changed', util.callback(this, function(oldVal) {
            this.set('previousPosition', oldVal);
        }));
    },

    addComponent: function(opts) {
        if (typeof(opts) == 'string') {
            opts = {component: opts};
        }

        var component = opts.component,
            priority = opts.priority || 0;
        
        if (typeof(component) == 'string') {
            var comClass = components[component];
            if (!comClass) {
                throw "Unable to find Component: " + component;
            }
            component = comClass.create();
        }

        var added = false;
        for (var i = 0, len = this.components.length; i < len; i++) {
            var com = this.components[i];
            if (priority < com.priority) {
                this.components.splice(i, 0, component);
                added = true;
                break;
            }
        }
        if (!added) {
            this.components.push(component);
        }

        component.set('entity', this);
        return component;
    },

    removeComponent: function(component) {
        var idx = this.components.indexOf(component);
        if (idx == -1) {
            throw "Component isn't part of this Entity";
        }
        entity.set('entity', null);

        this.components.splice(idx, 1);
        return this;
    },

    update: function(dt) {
        for (var i = 0, len = this.components.length; i < len; i++) {
            this.components[i].update(dt);
        }
    }
});

module.exports.Entity = Entity;
