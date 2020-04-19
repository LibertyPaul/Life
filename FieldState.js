class FieldState{
	constructor(rowCount, colCount){
		this.rowCount = rowCount;
		this.colCount = colCount;

		this.fieldState = new Array(rowCount);

		for (var row = 0; row < rowCount; ++row){
			this.fieldState[row] = new Array(colCount);
		}

		this.reset()
	}

	toShrinked(){
		var minRow = this.rowCount - 1;
		var maxRow = 0;
		var minCol = this.colCount - 1;
		var maxCol = 0;

		for (var row = 0; row < this.rowCount; ++row){
			for (var col = 0; col < this.colCount; ++row){
				if (this.fieldState[row][col]){
					if (minRow > row){
						minRow = row;
					}

					if (maxRow < row){
						maxRow = row;
					}

					if (minCol > col){
						minCol = col;
					}

					if (maxCol < col){
						maxCol = col;
					}
				}
			}
		}

		if (minRow > maxRow || minCol > maxCol){
			newRowCount = 0;
			newColCount = 0;
		}
		else{
			newRowCount = maxRow - minRow + 1;
			newColCount = maxCol - minCol + 1;
		}

		var newFieldState = new FieldState(newRowCount, newColCount);

		for (var row = minRow; row <= maxRow; ++row){
			for (var col = minCol; col <= maxCol; ++col){
				newFieldState[row - minRow][col - minCol] = this.fieldState[row][col];
			}
		}

		return newFieldState;
	}

	fillFrom(fieldState){
		if (
			this.rowCount < fieldState.rowCount ||
			this.colCount < fieldState.colCount
		){
			throw new Error("RHS field is larger.");
		}

		var rowDiff = this.rowCount - fieldState.rowCount;
		var colDiff = this.colCount - fieldState.colCount;

		var rowStartFrom = Math.floor(rowDiff / 2);
		var colStartFrom = Math.floor(colDiff / 2);

		this.reset();

		for (var row = 0; row < fieldState.rowCount; ++row){
			for (var col = 0; col < fieldState.colCount; ++col){
				this.fieldState[row + rowStartFrom][col + colStartFrom] = fieldState.fieldState[row][col];
			}
		}
	}

	serialize(){
		return JSON.stringify(
			{
				rowCount: this.rowCount,
				colCount: this.colCount,
				fieldState: this.fieldState
			}
		);
	}

	static deserialize(data){
		var model = JSON.parse(data);
		if (
			! 'rowCount' in model ||
			! 'colCount' in model ||
			! 'fieldState' in model
		){
			throw new Error('Failed to parse FieldState.');
		}

		var fieldState = new FieldState(model.rowCount, model.colCount);
		fieldState.fieldState = model.fieldState;
	}

	getCellCount(){
		return this.rowCount * this.colCount;
	}

	clone(){
		var newState = new FieldState(this.rowCount, this.colCount);
		
		for (var row = 0; row < this.rowCount; ++row){
			for (var col = 0; col < this.colCount; ++col){
				newState.fieldState[row][col] = this.fieldState[row][col];
			}
		}

		return newState;
	}

	reset(){
		for (var row = 0; row < this.rowCount; ++row){
			for (var col = 0; col < this.colCount; ++col){
				this.fieldState[row][col] = false;
			}
		}
	}

	randomize(probability){
		for (var row = 0; row < this.rowCount; ++row){
			for (var col = 0; col < this.colCount; ++col){
				var dice = Math.random();
				this.fieldState[row][col] = dice < probability;
			}
		}
	}

	getCellState(coord){
		return this.fieldState[coord.row][coord.col];
	}

	setCellState(coord, state){
		this.fieldState[coord.row][coord.col] = state;
	}

	flipCell(coord){
		var newState = !this.getCellState(coord);

		this.setCellState(coord, newState);

		return newState;
	}
}


