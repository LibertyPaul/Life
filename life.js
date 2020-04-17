const cellSize = 5, padding = 1;
var fieldWidth = null, fieldHeight = null;
const trueColor = '#0F0', falseColor = '#030', bgColor = '#000';
var delay = 0;
var randomProb = 0.5;
var fieldData;
var workingField = [];
var displayField = [];
var currentBuffer = 0;
var pauseFlag = true;

var previousIterations = [];


function mod(n, maxValue){
	if (n < 0){
		return maxValue - (-n % maxValue)
	}
	else{
		return n % maxValue;
	}
}

function getDisplayCell(x, y){
	return displayField[mod(y, fieldHeight)][mod(x, fieldWidth)];
}

function setWorkingCell(x, y, val){
	workingField[mod(y, fieldHeight)][mod(x, fieldWidth)] = val;
}

function swapBuffers(){
	var tmp = displayField;
	displayField = workingField;
	workingField = tmp;
}

function run_stop(){
	var btn = document.getElementById("run_stop");
	pauseFlag = !pauseFlag;
	if(pauseFlag)
		btn.textContent = 'Run';
	else
		btn.textContent = 'Stop';
}

function clearField(){
	workingField = getDeadField();
	displayField = getDeadField();

	draw();
}



function randomize(){
	for(var y = 0; y < fieldHeight; ++y)
		for(var x = 0; x < fieldWidth; ++x)
			setWorkingCell(x, y, Math.random() < randomProb);

	swapBuffers();
	draw();
}

function position1(){
	clearField();

	var cntrX = Math.floor(fieldWidth / 2);
	var cntrY = Math.floor(fieldHeight / 2);

	setWorkingCell(cntrX,		cntrY - 2,	true);
	setWorkingCell(cntrX - 1,	cntrY - 1,	true);
	setWorkingCell(cntrX - 1,	cntrY,		true);
	setWorkingCell(cntrX,		cntrY + 1,	true);
	setWorkingCell(cntrX + 1,	cntrY - 1,	true);
	setWorkingCell(cntrX + 1,	cntrY,		true);
	setWorkingCell(cntrX + 1,	cntrY + 1,	true);

	swapBuffers();
	draw();
}

function getAdjacentCoords(x, y){
	var neighbours = [];
	
	for(var i = x - 1; i <= x + 1; ++i){
		neighbours.push([i, y - 1]);
	}

	for(var i = x - 1; i <= x + 1; ++i){
		neighbours.push([i, y + 1]);
	}

	neighbours.push([x - 1, y]);
	neighbours.push([x + 1, y]);


	for (let coord of neighbours){
		coord[0] = mod(coord[0], fieldWidth);
		coord[1] = mod(coord[1], fieldHeight);
	}

	return neighbours;
}

function getAction(x, y){
	var neighbours = getAdjacentCoords(x, y);
	var neighbourCount = 0;

	for (var i = 0; i < 8; ++i){
		if(getDisplayCell(neighbours[i][0], neighbours[i][1])){
			++neighbourCount;
		}
	}
	
	var current = getDisplayCell(x, y);
	if(!current && neighbourCount === 3)
		return true;
	
	if(current && (neighbourCount >= 2 && neighbourCount <= 3))
		return true;
						
	return false;
}

function toScalar(x, y){
	return y * fieldWidth + x;
}

function fromScalar(scalar){
	return [scalar % fieldWidth, Math.floor(scalar / fieldWidth)];
}
	

function calcNextStep(){
	for(var y = 0; y < fieldHeight; ++y){
		for(var x = 0; x < fieldWidth; ++x){
			var newState = getAction(x, y);
			setWorkingCell(x, y, newState);
		}
	}
}

function draw(){
	var field = document.getElementById("mainField");
	var ctx = field.getContext('2d');
	for(var y = 0; y < fieldHeight; ++y)
		for(var x = 0; x < fieldWidth; ++x){
			if(getDisplayCell(x, y))
				ctx.fillStyle = trueColor;
			else
				ctx.fillStyle = falseColor;
			
			ctx.fillRect(padding + x * (cellSize + padding), padding + y * (cellSize + padding), cellSize, cellSize);
		}
	
}

function step(){
	calcNextStep();
	swapBuffers();
	draw();

	logIteration();
	var fps = calcFPS();
	updateFPS(fps);
}



function init(){
	if(pauseFlag){
		setTimeout(init, delay);
		return;
	}
	
	step();
	setTimeout(init, delay);
}

function logIteration(){
	var now = new Date();
	previousIterations.push(now);
}

function calcFPS(){
	const velocityWindowSizeSec = 5;
	var lowerBound = new Date();
	lowerBound.setSeconds(lowerBound.getSeconds() - velocityWindowSizeSec);

	while (previousIterations.length > 0 && previousIterations[0] < lowerBound){
		previousIterations.shift();
	}

	return previousIterations.length / velocityWindowSizeSec;
}

function updateFPS(val){
	var w = document.getElementById("FPS_wrapper");
	w.textContent = val + ' FPS';
}			


function getDeadField(){
	fieldData = new Array(fieldHeight);
	for(var i = 0; i < fieldHeight; ++i){
		fieldData[i] = new Array(fieldWidth);
		for(var j = 0; j < fieldWidth; ++j){
			fieldData[i][j] = false;
		}
	}

	return fieldData;
}


window.onload = function(){
	var controlsHeightPx = 100;

	var fieldHeightPx = Math.max(window.innerHeight - controlsHeightPx, 500);
	var fieldWidthPx = Math.max(window.innerWidth - 30, 500);

	fieldHeight = Math.ceil(fieldHeightPx / (cellSize + padding));
	fieldWidth = Math.ceil(fieldWidthPx / (cellSize + padding));

	var field = document.getElementById("mainField");
	field.height = fieldHeight * (cellSize + padding) + padding;
	field.width = fieldWidth * (cellSize + padding) + padding;
	
	var elemLeft = field.offsetLeft, elemTop = field.offsetTop;
	
	field.addEventListener('mousedown', function(event){
		if (pauseFlag === false){
			return;
		}

		var x = event.pageX - elemLeft;
		var y = event.pageY - elemTop;
		
		var x_pos = Math.floor(x / (cellSize + padding));
		var y_pos = Math.floor(y / (cellSize + padding));
		
		if(x_pos < fieldWidth && y_pos < fieldHeight)
			if((x % (cellSize + padding) > padding) && (y % (cellSize + padding) > padding)){
				workingField = Array.from(displayField);
				setWorkingCell(x_pos, y_pos, !getDisplayCell(x_pos, y_pos));
				swapBuffers();
				draw();
			}
	}, false);
	
	
	var speedBar = document.getElementById('speed');
	speedBar.value = delay;
	speedBar.onchange = function(){
		delay = speedBar.value;
	};
	
	var randomBar = document.getElementById('randomProb');
	randomBar.value = randomProb * randomBar.max;
	randomBar.onchange = function(){
		randomProb = randomBar.value / randomBar.max;
	};

	ctx = field.getContext('2d');
	ctx.fillStyle = bgColor;
	ctx.fillRect(0, 0, field.width, field.height);
	
	clearField();
	init();				
};		


