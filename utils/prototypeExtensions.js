Array.prototype.getStays=function()
{
	var stays=[];
	for(var i=0; i<this.length;i++)
	{
		if(this[i].type=="hotel")
		{
			var checkin =	this[i].checkin;
			var checkout = this[i].checkout;
			var hotel = this[i];
			hotel.checkin = checkin;
			hotel.checkout = checkout;
			stays.push(hotel);
		}
	}
	return stays;
}

Array.prototype.getTripStates = function()
{
	var states =[];
	for(var i=0; i< this.length; i++)
	{
		if(this[i].state && states.indexOf(this[i].state) == -1)
			states.push(this[i].state);
	}
	return states;
}
Array.prototype.getTripCountries = function()
{
	var states =[];
	for(var i=0; i< this.length; i++)
	{
		if(this[i].country && states.indexOf(this[i].country) == -1)
			states.push(this[i].country);
	}
	return states;
}
Array.prototype.getPackages = function()
{
	var packages =[];
	for(var i=0; i< this.length; i++)
	{
		if(this[i].type && (this[i].type) == "package")
			packages.push(this[i]);
	}
	return packages;
}