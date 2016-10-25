var mongoose     = require('mongoose');
var Schema       = mongoose.Scema;
 
var RelationShipSchema   = new mongoose.Schema({
    relationMap: Array
});
 
module.exports = mongoose.model('RelationShip', RelationShipSchema);