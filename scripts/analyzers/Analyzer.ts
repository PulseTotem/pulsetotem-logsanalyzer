/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/**
 * Represents Analyzer Interface.
 *
 * @interface Analyzer
 */
interface Analyzer {

	/**
	 * Method to perform job of Analyzer.
	 *
	 * @method performJob
	 * @param {any} input - Input to manipulate
	 * @param {Function} successCB - Callback when Analyzer ended its job with success.
	 * @param {Function} failCB - Callback when Analyzer ended its job with fail.
	 */
	performJob(input : any, successCB : Function, failCB : Function);
}