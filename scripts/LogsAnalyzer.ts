/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../t6s-core/core-backend/scripts/server/Server.ts" />
/// <reference path="../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="./database/MongoDBConnection.ts" />

/**
 * Represents PulseTotem's Logs Analyzer.
 *
 * @class LogsAnalyzer
 * @extends Server
 */
class LogsAnalyzer extends Server {

	/**
	 * Constructor.
	 *
	 * @param {number} listeningPort - Server's listening port.
	 * @param {Array<string>} arguments - Server's command line arguments.
	 */
	constructor(listeningPort : number, arguments : Array<string>) {
		super(listeningPort, arguments);

		this.init();
	}

	/**
	 * Method to init the LogsAnalyzer server.
	 *
	 * @method init
	 */
	init() {
		var self = this;

		var success = function () {
			Logger.debug("Success to connect to Database.")
		};

		MongoDBConnection.init(success);
	}
}

/**
 * Server's LogsAnalyzer listening port.
 *
 * @property _LogsAnalyzerListeningPort
 * @type number
 * @private
 */
var _LogsAnalyzerListeningPort : number = process.env.PORT || 14000;

/**
 * Server's LogsAnalyzer command line arguments.
 *
 * @property _LogsAnalyzerArguments
 * @type Array<string>
 * @private
 */
var _LogsAnalyzerArguments : Array<string> = process.argv;

var serverInstance : LogsAnalyzer = new LogsAnalyzer(_LogsAnalyzerListeningPort, _LogsAnalyzerArguments);
serverInstance.run();