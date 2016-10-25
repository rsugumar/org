var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AndroidAppUpdatesSchema  = new Schema ({

   androidVersion: String,
   androidAppVersion : String,
   androidAppUrl: String,
   timeStamp : { type : Date, default: Date.now }
   }, { collection: 'AndroidAppUpdates' } );

module.exports = mongoose.model ( 'AndroidAppUpdates', AndroidAppUpdatesSchema);