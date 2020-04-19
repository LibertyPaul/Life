class Coord{
	constructor(row, col, rowCount, colCount){
		this.row = row;
		this.col = col;
		this.rowCount = rowCount;
		this.colCount = colCount;

		this.normalize();
	}

	toScalar(){
		return this.row * this.colCount + this.col;
	}

	static fromScalar(scalar, rowCount, colCount){
		var row = Math.floor(scalar / colCount);
		var col = scalar % colCount;

		var coord = new Coord(row, col, rowCount, colCount);
		return coord;
	}

	normalizeValue(value, modulus){
		if (value < 0){
			return modulus - (-value % modulus);
		}
		else{
			return value % modulus;
		}
	}

	normalize(){
		this.row = this.normalizeValue(this.row, this.rowCount);
		this.col = this.normalizeValue(this.col, this.colCount);
	}
}
