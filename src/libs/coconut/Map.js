var cocos   = require('cocos2d'),
    geo     = require('geometry');

var Map = cocos.nodes.TMXTiledMap.extend(/** @scope coconut.Map# */{
    /**
     * @memberOf coconut
     * @extends cocos.nodes.TMXTiledMap
     * @constructs
     */
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
