const Spinner = require('cli-spinner').Spinner;

class ExtendedSpinner extends Spinner {
	startSpinner(title) {
		this.setSpinnerTitle(title);
		this.start();
	}
}

module.exports = ExtendedSpinner;