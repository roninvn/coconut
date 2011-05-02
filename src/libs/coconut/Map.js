/*globals module exports resource require BObject BArray*/
/*jslint undef: true, strict: true, white: true, newcap: true, browser: true, indent: 4 */
"use strict";

var cocos   = require('cocos2d'),
    geo     = require('geometry');

var Map = cocos.nodes.TMXTiledMap.extend(/** @scope coconut.Map# */{
    /**
     * @memberOf coconut
     * @extends cocos.nodes.TMXTiledMap
     * @constructs
     */
    init: function (opts) {
        Map.superclass.init.call(this, opts);
    },

    isSolidTile: function (point) {
        var layer = this.children[1];
        var pos = point.x + layer.get('layerSize').width * point.y;
        var tile = layer.tiles[pos];

        return (tile !== 0);
    }
});

exports.Map = Map;
