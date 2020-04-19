class FieldBackupAccess{
	constructor(){
		this.storageKey = "Conway's Life FieldBackupStorage v1";
		this.fieldWrappers = [];
		this.restore();
	}

	resetFromRaw(rawData){
		window.localStorage.setItem(this.storageKey, rawData);
		this.restore();
	}

	restore(){
		var storageData = window.localStorage.getItem(this.storageKey);
		if (storageData === null){
			return [];
		}

		var serializedWrappers = null;
		
		try{
			serializedWrappers = JSON.parse(storageData);
		}
		catch(ex){
			alert(ex);
			window.localStorage.removeItem(this.storageKey);
			return [];
		}

		for (const serializedWrapper of serializedWrappers.fieldWrappers){
			var wrapper = FieldBackupWrapper.deserialize(serializedWrapper);
			this.fieldWrappers[wrapper.title] = wrapper;
		}
	}

	save(){
		var serializedWrappers = [];

		for (const title in this.fieldWrappers){
			var wrapper = this.fieldWrappers[title];
			serializedWrappers.push(wrapper.serialize());
		}

		var storageData = JSON.stringify(
			{
				fieldWrappers: serializedWrappers
			}
		);

		window.localStorage.setItem(this.storageKey, storageData);
	}

	getFieldWrapperList(){
		return Object.keys(this.fieldWrappers);
	}

	getFieldWrapper(title){
		return this.fieldWrappers[title].clone();
	}

	addFieldWrapper(wrapper){
		if (wrapper.titile in this.fieldWrappers){
			throw new Error("Duplicate name.");
		}

		this.fieldWrappers[wrapper.title] = wrapper.clone();
		this.save();
	}

	deleteFieldWrapper(title){
		delete this.fieldWrappers[title];
		this.save();
	}

}
