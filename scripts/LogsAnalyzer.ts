/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../t6s-core/core-backend/scripts/server/Server.ts" />
/// <reference path="../t6s-core/core-backend/scripts/Logger.ts" />
/// <reference path="./database/MongoDBConnection.ts" />
/// <reference path="./mq/MessageQueueConnection.ts" />
/// <reference path="./analyzers/SaveAnalyzer.ts" />

/**
 * Represents PulseTotem's Logs Analyzer.
 *
 * @class LogsAnalyzer
 * @extends Server
 */
class LogsAnalyzer extends Server {

	/**
	 * Save Analyzer.
	 *
	 * @property saveAnalyzer
	 * @type SaveAnalyzer
	 * @static
	 */
	private saveAnalyzer : SaveAnalyzer;

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

		var successMQConnection = function() {
			MessageQueueConnection.consumeMessages(function(msg : string) {

				self.initAnalyzers();

				self.analyzeMessage(msg);
			});
		};

		var successDBConnection = function () {
			Logger.debug("Success to connect to Database.");

			self.addIndexes();

			MessageQueueConnection.init(successMQConnection);
		};

		MongoDBConnection.init(successDBConnection);
	}

	/**
	 * Add some indexes to MongoDB collection.
	 *
	 * @method addIndexes
	 */
	addIndexes() {
		var self = this;

		MongoDBConnection.getCollection().createIndex( { "meta.logDetails.from": 1 } );
		MongoDBConnection.getCollection().createIndex( { "meta.logDetails.timestamp": 1 } );
		MongoDBConnection.getCollection().createIndex( { "meta.logDetails.level": 1 } );
	}

	/**
	 * Init all analyzers.
	 *
	 * @method initAnalyzers
	 */
	initAnalyzers() {
		var self = this;

		this.saveAnalyzer = new SaveAnalyzer();
	}

	/**
	 * Analyze message from MQ.
	 *
	 * @method analyzeMessage
	 * @param {string} message - Message to analyze.
	 */
	analyzeMessage(message : string) {
		var self = this;

		var jsonMessage : any = JSON.parse(message);

		this.saveAnalyzer.performJob(jsonMessage, function(input) {
			//Nothing to do.
			console.log(input);
		}, function() {
			console.debug("SaveAnalyzer - FAIL : Unable to save input in database.");
		});
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