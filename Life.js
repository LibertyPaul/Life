class Life{
	constructor(){
	
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

		for (let neighbourCoord of neighbourCoords){
			if (field.getCellState(neighbourCoord)){
				aliveNeighbours += 1;
			}
		}

		return aliveNeighbours;
	}

	getNewState(currentState, aliveNeighbours){
		return (
			aliveNeighbours === 3 || (aliveNeighbours === 2 && currentState)
		);
	}

	evaluateCell(coord, sourceField, destinationField, delta, alive){
		var currentState = sourceField.getCellState(coord);
		var aliveNeighbours = this.countAliveNeighbours(sourceField, coord);
		var newState = this.getNewState(currentState, aliveNeighbours);
		
		destinationField.setCellState(coord, newState);

		if (sourceField.getCellState(coord) !== newState){
			delta.push(
				{
					coord: coord,
					state: newState
				}
			);
		}

		if (newState){
			alive.push(coord);
		}
	}

	evaluateField(sourceField, destinationField, currentAlive){
		var delta = [];
		var alive = [];

		if (
			currentAlive !== null &&
			currentAlive.length < sourceField.getCellCount() * 0.1 &&
			false
		){
			var coordsToUpdate = new Set();

			for (let coord of currentAlive){
				var neighbourCoords = this.getNeighbours(coord, true);
				for (let neighbourCoord of neighbourCoords){
					coordsToUpdate.add(neighbourCoord.toScalar());
				}
			}

			for (let scalar of coordsToUpdate){
				var coord = Coord.fromScalar(
					scalar,
					sourceField.rowCount,
					sourceField.colCount
				);

				this.evaluateCell(
					coord,
					sourceField,
					destinationField,
					delta,
					alive
				);
			}
		}
		else{
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
						delta,
						alive
					);
				}
			}
		}

		return {
			delta: delta,
			alive: alive
		};
	}
}
