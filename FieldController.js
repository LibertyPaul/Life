class FieldController{
	constructor(){
		this.running = false;
		this.mainLoopDelay = 0;
		this.inactiveDelay = 100;
		this.ramdomProb = 0.5;

		const controlsHeightPx = 100;
		this.fieldView = new FieldView(
			document.getElementById('mainField'),
			Math.max(window.innerHeight - controlsHeightPx, 100),
			Math.max(window.innerWidth - 30, 100),
			7,
			1,
			this.flipCell.bind(this)
		);

		this.fieldView.initCanvas();

		this.displayState = new FieldState(
			this.fieldView.rowCount,
			this.fieldView.colCount
		);

		this.workingState = new FieldState(
			this.fieldView.rowCount,
			this.fieldView.colCount
		);

		this.fieldView.drawField(this.displayState);

		this.currentAlive = null;

		this.life = new Life(this.fieldView.rowCount, this.fieldView.colCount);
		this.FPSTracker = new FPSTracker();

		this.attachControls();
	}

	updateAndLogFPS(){
		this.FPSTracker.logFrame();

		var FPSWrapper = document.getElementById("FPSWrapper");
		FPSWrapper.textContent = this.FPSTracker.getFPS() + ' FPS';
	}

	toggleStartStop(){
		this.running = !this.running;

		if (this.running){
			startStopButton.textContent = 'Stop'
		}
		else{
			startStopButton.textContent = 'Run';
		}
	}

	attachControls(){
		var delayBar = document.getElementById('delayBar');
		delayBar.value = this.mainLoopDelay;
		delayBar.onchange = function(){
			this.mainLoopDelay = delayBar.value;
		}.bind(this);
		
		var randomBar = document.getElementById('randomBar');
		randomBar.value = this.ramdomProb * randomBar.max;

		var startStopButton = document.getElementById('startStopButton');
		startStopButton.textContent = 'Run';
		startStopButton.onclick = function(){
			this.toggleStartStop();
		}.bind(this);

		var stepButton = document.getElementById('stepButton');
		stepButton.onclick = function(){
			if (this.running === false){
				this.step();
			}
		}.bind(this);

		var clearButton = document.getElementById('clearButton');
		clearButton.onclick = function(){
			if (this.running){
				this.toggleStartStop();
			}

			this.workingState.reset();
			this.currentAlive = null;
			this.commitWorkingState();
			this.fieldView.drawField(this.displayState);
		}.bind(this);

		var randomizeButton = document.getElementById('randomizeButton');
		randomizeButton.onclick = function(){
			var randomBar = document.getElementById('randomBar');
			var probability = randomBar.value / randomBar.max;
			this.workingState.randomize(probability);
			this.commitWorkingState();
			this.fieldView.drawField(this.displayState);
		}.bind(this);

	}

	restoreWorkingState(){
		this.workingState = this.displayState.clone();
	}

	flipCell(coord){
		this.restoreWorkingState();
		var newState = this.workingState.flipCell(coord);
		this.commitWorkingState();

		if (newState && this.currentAlive !== null){
			this.currentAlive.push(coord);
		}

		this.fieldView.drawField(this.displayState);
	}

	commitWorkingState(){
		var tmp = this.displayState;
		this.displayState = this.workingState;
		this.workingState = tmp;
	}

	step(){
		var lastStepSummary = this.life.evaluateField(
			this.displayState,
			this.workingState,
			this.currentAlive
		);

		this.currentAlive = lastStepSummary.alive;

		this.commitWorkingState();

		this.fieldView.drawDelta(lastStepSummary.delta);

		this.updateAndLogFPS();
	}

	mainLoop(){
		var delay = this.mainLoopDelay;

		if(this.running){
			this.step();
		}
		else if(this.mainLoopDelay === 0){
			delay = this.inactiveDelay;
		}
		
		setTimeout(this.mainLoop.bind(this), delay);
	}
}


window.onload = function(){
	var controller = new FieldController();
	controller.mainLoop();
}
