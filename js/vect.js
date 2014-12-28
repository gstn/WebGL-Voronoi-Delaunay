var Vect2 = function(){
	this.x = 0.0;
	this.y = 0.0;
};

Vect2.prototype.fromPoints = function(p_point1, p_point2){
	this.x = parseFloat(p_point2.x) - parseFloat(p_point1.x);
	this.y = parseFloat(p_point2.y) - parseFloat(p_point1.y);
};

Vect2.prototype.fromFloats = function(p_f1, p_f2){
	this.x = parseFloat(p_f1);
	this.y = parseFloat(p_f2);
}

Vect2.prototype.dotProduct = function(p_vect) {
	return this.x*p_vect.x + this.y*p_vect.y;
};

Vect2.prototype.crossProduct = function(p_vect) {
	var res = new Vect2();
	return this.x * p_vect.y - p_vect.x * this.y;
};

Vect2.prototype.normalized = function(){
	return (new Vect2()).fromFloats(this.x/this.magnitude(),this.y/this.magnitude());
};

Vect2.prototype.normalize = function(){
	this.x = this.x/this.magnitude();
	this.y = this.y/this.magnitude();
};

Vect2.prototype.magnitude = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y );
};

Vect2.prototype.angle = function(p_vect) {
	return Math.acos(this.dotProduct(p_vect)/(this.magnitude()*p_vect.magnitude()));
};

Vect2.prototype.signedAngle = function(p_vect) {
	var angle =  Math.atan2(this.crossProduct(p_vect),this.dotProduct(p_vect));

	if (angle < 0)
		angle += 2 * Math.PI;
	return angle;
};