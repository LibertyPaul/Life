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

		this.rowCount = Math.ceil(
			(maxHeightPx - cellPadding) / (cellSize + cellPadding)
		);
		this.colCount = Math.ceil(
			(maxWidthPx - cellPadding) / (cellSize + cellPadding)
		);

		this.cellSize = cellSize;
		this.cellPadding = cellPadding;

		this.controllerFlipCell = controllerFlipCell;

		this.aliveColor = '#0F0';
		this.deadColor = '#030';
		this.backgroundColor = '#000';

		this.initCanvas();
	}

	initCanvas(){
		var heightPx = this.rowCount * (this.cellSize + this.cellPadding) + this.cellPadding;
		var widthPx  = this.colCount * (this.cellSize + this.cellPadding) + this.cellPadding;

		this.canvas.height = heightPx;
		this.canvas.width  = widthPx;

		this.context.fillStyle = this.backgroundColor;
		this.context.fillRect(0, 0, widthPx, heightPx);

		this.canvas.addEventListener(
			'mousedown',
			function(event){
				event.stopImmediatePropagation();

				var x = event.pageX - this.canvas.offsetLeft;
				var y = event.pageY - this.canvas.offsetTop;

				var isOnVerticalEdge = (
					x % (this.cellSize + this.cellPadding) < this.cellPadding
				);

				var isOnHorizontalEdge = (
					y % (this.cellSize + this.cellPadding) < this.cellPadding
				);
		 
				if(isOnVerticalEdge || isOnHorizontalEdge){
					return;
				}
				
				var coord = new Coord(
					Math.floor(y / (this.cellSize + this.cellPadding)),
					Math.floor(x / (this.cellSize + this.cellPadding)),
					this.rowCount,
					this.colCount
				);
				
				this.controllerFlipCell(coord);
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
		
		this.context.fillRect(
			this.cellPadding + coord.col * (this.cellSize + this.cellPadding),
			this.cellPadding + coord.row * (this.cellSize + this.cellPadding),
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
		for (let change of delta){
			this.drawCell(change.coord, change.state);
		}
	}
}
