/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../../t6s-core/core-backend/scripts/Logger.ts" />

var amqplib : any = require('amqplib/callback_api');

/**
 * Message Queue Connection to RabbitMQ.
 *
 * @class MessageQueueConnection
 */
class MessageQueueConnection {

	/**
	 * Exchange's name.
	 *
	 * @property exchange_name
	 * @type string
	 * @static
	 */
	static exchange_name : string = "pulsetotem.winston";

	/**
	 * Message Channel.
	 *
	 * @property channel
	 * @type any
	 * @static
	 */
	static channel : any = null;

	/**
	 * Message Queue.
	 *
	 * @property queue
	 * @type any
	 * @static
	 */
	static queue : any = null;

	/**
	 * Consume messages from channel.
	 *
	 * @method consumeMessages
	 * @param {Function} callback - Callback to consume each message.
	 * @static
	 */
	static consumeMessages(callback : Function) {
		MessageQueueConnection.channel.consume(MessageQueueConnection.queue, function(msg) {
		 	callback(msg.content.toString());
		 }, {noAck: true});
	}

	/**
	 * Initialize connection with RabbitMQ server.
	 *
	 * @method init
	 * @param {Function} callback - Callback after initialization.
	 * @static
	 */
	static init(callback : Function) {
		if (MessageQueueConnection.queue != null) {
			callback();
		}

		amqplib.connect('amqp://localhost', function(err, conn) {
			if (err) {
				Logger.error("Error while connecting message queue server :", {"error" : err});
				return;
			}

			conn.createChannel(function(errCh, ch) {
				if (errCh) {
					Logger.error("Error while creating channel :", {"error" : errCh});
					return;
				}

				MessageQueueConnection.channel = ch;

				//Manage exchange
				MessageQueueConnection.channel.assertExchange(MessageQueueConnection.exchange_name, 'fanout', {durable: false});

				//Manage queue, connecting to exchange
				MessageQueueConnection.channel.assertQueue('', {exclusive: true}, function(errQ, q) {
					if (errQ) {
						Logger.error("Error while creating queue :", {"error" : errQ});
						return;
					}

					MessageQueueConnection.queue = q.queue;

					MessageQueueConnection.channel.bindQueue(q.queue, MessageQueueConnection.exchange_name, '#');
					callback();
				});
			});
		});
	}
}