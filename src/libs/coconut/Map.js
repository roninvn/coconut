var cocos   = require('cocos2d'),
    geo     = require('geometry');

/**
 * @class
 * @extends cocos.nodes.TMXTiledMap
 */
var Map = cocos.nodes.TMXTiledMap.extend(/** @scope Map# */{
    init: function(opts) {
        @super;
    },

    isSolidTile: function(point) {
        var layer = this.children[1];
        var pos = point.x + layer.get('layerSize').width * point.y;
        var tile = layer.tiles[pos];

        return (tile != 0);
    },
});

exports.Map = Map;
