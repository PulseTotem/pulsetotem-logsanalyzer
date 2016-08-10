/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../../t6s-core/core-backend/scripts/Logger.ts" />

var fs : any = require('fs');
var MongoClient : any = require('mongodb').MongoClient;

/**
 * Manage connection to Mongo DB.
 *
 * @class MongoDBConnection
 */
class MongoDBConnection {

    /**
     * Host.
     *
     * @property host
     * @type string
     * @static
     */
    static host : string = null;

    /**
     * Port.
     *
     * @property port
     * @type number
     * @static
     */
    static port : number = null;

	/**
	 * Database.
	 *
	 * @property database
	 * @type string
	 * @static
	 */
	static database : string = null;

	/**
	 * Login.
	 *
	 * @property login
	 * @type string
	 * @static
	 */
	static login : string = null;

	/**
	 * Password.
	 *
	 * @property password
	 * @type string
	 * @static
	 */
	static password : string = null;

	/**
	 * Collection's name.
	 *
	 * @property collection_name
	 * @type string
	 * @static
	 */
	static collection_name : string = "logs";

	/**
	 * MongoDB Collection.
	 *
	 * @property collection
	 * @type any
	 * @static
	 */
	static collection : any = null;

    /**
     * Retrieve connection information from file description.
     *
     * @method retrieveConnectionInformation
     * @static
     */
    static retrieveConnectionInformation() {
        if(MongoDBConnection.host == null
			&& MongoDBConnection.port == null
			&& MongoDBConnection.database == null
			&& MongoDBConnection.login == null
			&& MongoDBConnection.password == null) {
				var file = __dirname + '/connection_infos.json';
				try {
					var connectionInfos = JSON.parse(fs.readFileSync(file, 'utf8'));
					MongoDBConnection.host = connectionInfos.host;
					MongoDBConnection.port = connectionInfos.port;
					MongoDBConnection.database = connectionInfos.database;
					MongoDBConnection.login = connectionInfos.login;
					MongoDBConnection.password = connectionInfos.password;
				} catch (e) {
					Logger.error("Connection configuration file can't be read.", { "error" : e});
				}
        }
    }

	/**
	 * Return MongoDB collection.
	 *
	 * @method getCollection
	 * @static
	 */
	static getCollection() {
		if(MongoDBConnection.collection == null) {
			throw new Error("MongoDB connection must be initialized before to perform actions on collection.");
		} else {
			return MongoDBConnection.collection;
		}
	}

	/**
	 * Initialize connection with MongoDB database and retrieve MongoDB collection.
	 *
	 * @method init
	 * @param {Function} callback - Callback after initialization.
	 * @static
	 */
    static init(callback : Function) {
		if (MongoDBConnection.collection != null) {
			callback();
		}

		MongoDBConnection.retrieveConnectionInformation();
		var mongoUrl = "mongodb://";

		if (MongoDBConnection.login != "") {
			mongoUrl += MongoDBConnection.login+":"+MongoDBConnection.password+"@";
		}
		mongoUrl += MongoDBConnection.host+":"+MongoDBConnection.port+"/"+MongoDBConnection.database;

		MongoClient.connect(mongoUrl, function(err, db) {
			if (err != null) {
				Logger.error("Error while connecting database :", {"error" : err});
				return;
			}

			MongoDBConnection.collection = db.collection(MongoDBConnection.collection_name);
			callback();
		});
	}
}