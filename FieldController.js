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
			5,
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

		this.life = new Life(this.fieldView.rowCount, this.fieldView.colCount);
		this.FPSTracker = new FPSTracker();

		this.fieldBackupAccess = new FieldBackupAccess();

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

	refreshSavedFieldsList(){
		var savedFields = document.getElementById('savedFields');
		while(savedFields.lastElementChild){
			savedFields.removeChild(savedFields.lastElementChild);
		}

		for (const savedFieldTitle of this.fieldBackupAccess.getFieldWrapperList()){
			var option = document.createElement('option');
			option.textContent = savedFieldTitle;
			savedFields.appendChild(option);
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

		
		this.refreshSavedFieldsList();

		var saveFieldButton = document.getElementById('saveFieldButton');
		saveFieldButton.onclick = function(){
			var backupNameInput = document.getElementById('backupNameInput');
			var newTitle = backupNameInput.value;
			if (!newTitle){
				alert('Please enter the name for the save.');
				return;
			}

			var wrapper = new FieldBackupWrapper(this.displayState, newTitle);

			try{
				this.fieldBackupAccess.addFieldWrapper(wrapper);
			}
			catch(ex){
				alert(ex);
				throw ex;
			}

			this.refreshSavedFieldsList();
		}.bind(this);

		var loadFieldButton = document.getElementById('loadFieldButton');
		loadFieldButton.onclick = function(){
			var savedFieldsList = document.getElementById('savedFieldsList');
			var title = savedFieldsList.value;
			var fieldWrapper = this.fieldBackupAccess.getFieldWrapper(title);

			this.workingState.fillFrom(fieldWrapper.fieldState);
			this.commitWorkingState();
			this.fieldView.drawField(this.displayState);
		}.bind(this);

		var deleteFieldButton = document.getElementById('deleteFieldButton');
		deleteFieldButton.onclick = function(){
			var savedFieldsList = document.getElementById('savedFieldsList');
			var title = savedFieldsList.value;

			this.fieldBackupAccess.deleteFieldWrapper(title);
			this.refreshSavedFieldsList();
		}.bind(this);

		if (this.fieldBackupAccess.getFieldWrapperList.length === 0){
			var examplesRequest = new XMLHttpRequest();
			examplesRequest.onreadystatechange = function(){
				if (
					examplesRequest.readyState == 4 &&
					examplesRequest.status == 200
				){
			 		this.fieldBackupAccess.resetFromRaw(examplesRequest.responseText);
					this.refreshSavedFieldsList();
				}
			}.bind(this);

			examplesRequest.open("GET", "Examples.json", true);
			examplesRequest.send();
		}
	}

	restoreWorkingState(){
		this.workingState = this.displayState.clone();
	}

	flipCell(coord){
		this.restoreWorkingState();
		var newState = this.workingState.flipCell(coord);
		this.commitWorkingState();

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
			this.workingState
		);

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
