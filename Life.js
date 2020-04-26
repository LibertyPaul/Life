class Life{
	constructor(){
		this.neighboursToBeBornWith = 3;
		this.neighboursToLiveWith = 2;
	}

	setNeighboursToBeBornWith(value){
		if (value < 0 || value > 8){
			throw new Error("Incorrect value.");
		}

		this.neighboursToBeBornWith = value;
	}

	setNeighboursToLiveWith(value){
		if (value < 0 || value > 8){
			throw new Error("Incorrect value.");
		}

		this.neighboursToLiveWith = value;
	}

	getNeighbours(coord, includeSelf = false){
		var neighbourCoords = [];

		for (var currRow = coord.row - 1; currRow <= coord.row + 1; ++currRow){
			for (var currCol = coord.col - 1; currCol <= coord.col + 1; ++currCol){
				if (!includeSelf && currRow === coord.row && currCol === coord.col){
					continue;
				}

				var neighbourCoord = new Coord(
					currRow,
					currCol,
					coord.rowCount,
					coord.colCount
				);

				neighbourCoords.push(neighbourCoord);
			}
		}

		return neighbourCoords;
	}

	countAliveNeighbours(field, coord){
		var aliveNeighbours = 0;

		var neighbourCoords = this.getNeighbours(coord);

		for (const neighbourCoord of neighbourCoords){
			if (field.getCellState(neighbourCoord)){
				aliveNeighbours += 1;
			}
		}

		return aliveNeighbours;
	}

	getNewState(currentState, aliveNeighbours){
		return (
			aliveNeighbours === this.neighboursToBeBornWith ||
			(
				currentState &&
				aliveNeighbours === this.neighboursToLiveWith
			)
		);
	}

	evaluateCell(coord, sourceField, destinationField, delta){
		var currentState = sourceField.getCellState(coord);
		var aliveNeighbours = this.countAliveNeighbours(sourceField, coord);
		var newState = this.getNewState(currentState, aliveNeighbours);
		
		destinationField.setCellState(coord, newState);

		if (currentState !== newState){
			delta.push(
				{
					coord: coord,
					state: newState
				}
			);
		}
	}

	evaluateField(sourceField, destinationField){
		var delta = [];

		for (var row = 0; row < sourceField.rowCount; ++row){
			for (var col = 0; col < sourceField.colCount; ++col){
				var coord = new Coord(
					row,
					col,
					sourceField.rowCount,
					sourceField.colCount
				);

				this.evaluateCell(
					coord,
					sourceField,
					destinationField,
					delta
				);
			}
		}

		return {
			delta: delta,
		};
	}
}
