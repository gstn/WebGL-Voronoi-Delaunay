GrahamScan = {
	convexHullVertices : [],
	inputVertices : [],
	sortedVertices : [],
	barycenter : {x: 0, y: 0, z: 5},
	firstConvexHullVertexIndex : 0,
	start : function(p_vertices_array)
	{
		this.inputVertices = p_vertices_array;
		this.computeBarycenter();
		this.sortInputVertices();
		this.removeConcaveVertices();
	},


	sortInputVertices : function()
	{

		this.sortedVertices = this.inputVertices.slice(0);
		
		this.sortedVertices.sort(function(a, b)
		{
			var a_bpj = new Vect2();
			var b_bpj = new Vect2();
			a_bpj.fromPoints(GrahamScan.barycenter, a);
			b_bpj.fromPoints(GrahamScan.barycenter, b)
			var ox = new Vect2();
			ox.fromFloats(1,0);

			if(ox.signedAngle(a_bpj) < ox.signedAngle(b_bpj))
			{
				return 1;
			}
			else
			{
				if(ox.signedAngle(a_bpj) > ox.signedAngle(b_bpj))
				{
					return -1;
				}
				else
				{
					if(a_bpj.magnitude() < b_bpj.magnitude)
					{
						return 1
					}
					else
					{
						if(a_bpj.magnitude() > b_bpj.magnitude)
						{
							return -1
						}
						else
						{
							return 0;
						}
					}
				}
			}
		});

	},

	computeBarycenter : function()
	{
		var xSum = 0;
		var ySum = 0;

		for(var i = 0; i < this.inputVertices.length; i++)
		{
			xSum = parseFloat(xSum) + parseFloat(this.inputVertices[i].x);
			ySum = parseFloat(ySum) + parseFloat(this.inputVertices[i].y);
		}
		this.barycenter = {x: parseFloat(xSum/this.inputVertices.length), y: parseFloat(ySum/this.inputVertices.length), z: 5};
	},

	removeConcaveVertices : function()
	{
		this.convexHullVertices = this.sortedVertices.slice(0);
		var sinit = this.sortedVertices[0];
		var pivot = sinit;
		var sinit_index = 0;
		var pivot_index = 0;
		var goForward = true;
		do
		{
			var next = this.convexHullVertices[(pivot_index+1)%this.convexHullVertices.length];
			var prev = (pivot_index-1 <0)?this.convexHullVertices[this.convexHullVertices.length-1]:this.convexHullVertices[(pivot_index-1)];
			var pjpjnext = new Vect2();
			pjpjnext.fromPoints(pivot, next);

			var pjpjprev = new Vect2();
			pjpjprev.fromPoints(pivot, prev);
			
			if(pjpjnext.signedAngle(pjpjprev) <= Math.PI)
			{
				//console.log("loop GrahamScan "+pjpjprev.signedAngle(pjpjnext));
				sinit = prev;
				this.convexHullVertices.splice(pivot_index,1);
				pivot_index = (pivot_index-1 < 0)?this.convexHullVertices.length-1:(pivot_index-1);
				pivot = this.convexHullVertices[pivot_index];
				goForward = false;
			}
			else
			{
				pivot_index = (pivot_index+1)%this.convexHullVertices.length;
				pivot = this.convexHullVertices[pivot_index];
				goForward = true;
			}
		}while( (pivot.x != sinit.x && pivot.y != sinit.y) || goForward == false )
	}
}