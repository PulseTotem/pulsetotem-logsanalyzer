/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="./Analyzer.ts" />
/// <reference path="../database/MongoDBConnection.ts" />

/**
 * SaveAnalyzer insert input in database.
 *
 * @class SaveAnalyzer
 * @implements Analyzer
 */
class SaveAnalyzer implements Analyzer {

	/**
	 * Constructor.
	 */
	constructor() {

	}

	/**
	 * Method to perform job of Analyzer.
	 *
	 * @method performJob
	 * @param {any} input - Input to manipulate
	 * @param {Function} successCB - Callback when Analyzer ended its job with success.
	 * @param {Function} failCB - Callback when Analyzer ended its job with fail.
	 */
	performJob(input : any, successCB : Function, failCB : Function) {
		var self = this;

		MongoDBConnection.getCollection().insertOne(input, function(err, result) {
			if(err) {
				failCB(err);
				return;
			}

			input["_id"] = result.insertedId;

			successCB(input)
		});
	}
}