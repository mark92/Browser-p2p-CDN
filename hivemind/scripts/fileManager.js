var FileManager = function(){
	var resources = {};

	this.split = function(input, rscName){
		var output = [];
		var splitSize = 160;
		var outputSize = Math.ceil(input.length / splitSize);
		var piece;
		for( var i = 0; i < outputSize; i++){
			piece = input.substring(i*splitSize, i*splitSize+splitSize);
			output.push( { data: piece, order: i, total: outputSize, name: rscName } );
		}

		return output;
	}

	this.join = function(input){
		var output = "";
		input = input.sort(function(a,b){ return a.order - b.order;});
		for( var i = 0; i < input.length; i++ ){
			if(i != input[i].order){
				debug(i);
			}
			output += input[i].data;
		}

		localStorage["resource_"+input[0].name] = output;
		debug("Resource rebuilt: "+input[0].name);
		var x = new Event(input[0].name);
		document.dispatchEvent(x);
	}

	this.rebuild = function(input){
		resources[input.name] = resources[input.name] || { total: input.total, output: [] };
		resources[input.name].output.push(input);

		if(resources[input.name].total == resources[input.name].output.length){
			this.join(resources[input.name].output);
		}
	}
}