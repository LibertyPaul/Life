class FieldBackupWrapper{
	constructor(fieldState, title){
		this.fieldState = fieldState.toShrinked();
		this.title = title
	}

	clone(){
		var fieldState = this.fieldState.clone();
		return new FieldBackupWrapper(fieldState, this.title);
	}

	serialize(){
		var serializedField = this.fieldState.serialize();

		return JSON.stringify(
			{
				field: serializedField,
				title: this.title
			}
		);
	}

	static deserialize(data){
		var model = JSON.parse(data);
		if (
			! ('field' in model) ||
			! ('title' in model)
		){
			throw new Error('Failed to parse FieldBackupWrapper.');
		}

		var fieldState = FieldState.deserialize(model.field);
		
		return new FieldBackupWrapper(fieldState, model.title);
	}
}
