class FieldView{

	constructor(
		canvasObject,
		maxHeightPx,
		maxWidthPx,
		cellSize,
		cellPadding,
		controllerFlipCell
	){
		this.canvas = canvasObject;
		this.context = this.canvas.getContext('2d');

		this.widthPx = maxWidthPx;

		this.cellSize = cellSize;
		this.cellPadding = cellPadding;

		this.rowCount = Math.floor(
			(maxHeightPx - cellPadding) / (cellSize + cellPadding)
		);

		this.colCount = Math.floor(
			(this.widthPx - cellPadding) / (cellSize + cellPadding)
		);

		this.heightPx = this.rowCount * (cellSize + cellPadding) + cellPadding;

		this.marginLeft = Math.floor(
			(this.widthPx - cellPadding - this.colCount * (cellSize + cellPadding)) / 2
		);

		this.marginTop = 0;

		this.controllerFlipCell = controllerFlipCell;

		this.aliveColor = '#0F0';
		this.deadColor = '#030';
		this.backgroundColor = '#000';

		this.initCanvas();
	}

	getCanvasCoord(fieldCoord){
		return {
			x: this.marginLeft + this.cellPadding + fieldCoord.col * (this.cellSize + this.cellPadding),
			y: this.marginTop  + this.cellPadding + fieldCoord.row * (this.cellSize + this.cellPadding)
		};
	}

	getFieldCoord(canvasCoord){
		var isOnVerticalEdge = (
			(
				(canvasCoord.x - this.marginLeft)
				%
				(this.cellSize + this.cellPadding)
			)
			<=
			this.cellPadding
		);

		var isOnHorizontalEdge = (
			(
				(canvasCoord.y - this.marginTop)
				%
				(this.cellSize + this.cellPadding)
			)
			<=
			this.cellPadding
		);
 
		if(isOnVerticalEdge || isOnHorizontalEdge){
			return null;
		}
		
		var fieldCoord = new Coord(
			Math.floor(
				(canvasCoord.y - this.marginTop) / (this.cellSize + this.cellPadding)
			),
			Math.floor(
				(canvasCoord.x - this.marginLeft) / (this.cellSize + this.cellPadding)
			),
			this.rowCount,
			this.colCount
		);
		
		return fieldCoord;
	}

	initCanvas(){
		this.canvas.height = this.heightPx;
		this.canvas.width  = this.widthPx;

		this.context.fillStyle = this.backgroundColor;
		this.context.fillRect(0, 0, this.widthPx, this.heightPx);

		this.canvas.addEventListener(
			'mousedown',
			function(event){
				event.stopImmediatePropagation();

				var canvasCoord = {
					x: event.pageX - this.canvas.offsetLeft,
					y: event.pageY - this.canvas.offsetTop
				};

				var fieldCoord = this.getFieldCoord(canvasCoord);
				if (fieldCoord === null){
					return;
				}

				this.controllerFlipCell(fieldCoord);
			}.bind(this),
			false
		);
	}

	drawCell(coord, state){
		if (state){
			this.context.fillStyle = this.aliveColor;
		}
		else{
			this.context.fillStyle = this.deadColor;
		}

		var upperLeftCorner = this.getCanvasCoord(coord);
		
		this.context.fillRect(
			upperLeftCorner.x,
			upperLeftCorner.y,
			this.cellSize,
			this.cellSize
		);
	}

	drawField(fieldState){
		for (var row = 0; row < this.rowCount; ++row){
			for (var col = 0; col < this.colCount; ++col){
				var coord = new Coord(row, col, this.rowCount, this.colCount);
				var state = fieldState.getCellState(coord);
				this.drawCell(coord, state);
			}
		}
	}

	drawDelta(delta){
		for (const change of delta){
			this.drawCell(change.coord, change.state);
		}
	}
}
