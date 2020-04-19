class FPSTracker{
	constructor(){
		this.previousIterations = [];
		this.windowSec = 5;
	}

	logFrame(){
		var now = new Date();
		this.previousIterations.push(now);
	}

	getFPS(){
		var lowerBound = new Date();
		lowerBound.setSeconds(lowerBound.getSeconds() - this.windowSec);

		while (
			this.previousIterations.length > 0 &&
			this.previousIterations[0] < lowerBound
		){
			this.previousIterations.shift();
		}

		return this.previousIterations.length / this.windowSec;
	}

	reset(){
		this.previousIterations = [];
	}
}
