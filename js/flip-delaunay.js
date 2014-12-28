FlipDelaunay = {
	inputVertices : [],
	sortedVertices : [],
	edges : [],

	convexHullVertices : [],
	inputVertices : [],
	insideHullVertices : [],

	firstConvexHullVertexIndex : 0,

	start : function(p_vertices_array)
	{
		this.edges = [];
		this.inputVertices = p_vertices_array;
		this.lookingForFirstVertexInConvexHull();
		this.computeConvexHull();
		this.computeEdges();
	},

	lookingForFirstVertexInConvexHull : function()
	{
		var i0 = 0;
		var xmin = this.inputVertices[i0].x;
		var ymin = this.inputVertices[i0].y;
		

		for( var i = 1; i < this.inputVertices.length; i++)
		{
			if(this.inputVertices[i].x < xmin || (this.inputVertices[i].x == xmin  && this.inputVertices[i].y > ymin))
			{
				i0 = i;
				xmin = this.inputVertices[i0].x;
				ymin = this.inputVertices[i0].y;
			}
		}
		this.firstConvexHullVertexIndex = i0;

		console.log("first index "+this.firstConvexHullVertexIndex);
	},

	computeConvexHull : function()
	{

		var i = this.firstConvexHullVertexIndex;
		var j = 0;
		var v = new Vect2();
		var pij = new Vect2()
		this.insideHullVertices = this.inputVertices.slice(0);
		v.x = 0;
		v.y = -1;
		//v.normalize();
		this.convexHullVertices = [];
		do
		{
			this.convexHullVertices.push(this.inputVertices[i]);
			this.insideHullVertices.splice(i,0);
			if(i == 0)
				j = 1;
			else
				j = 0;
			
			pij.x =  this.inputVertices[j].x - this.inputVertices[i].x;
			pij.y =  this.inputVertices[j].y - this.inputVertices[i].y;

			//pij.normalize();
			var deltaMin = v.angle(pij) ;
			var lmax = pij.magnitude();
			var inew = j;

			for(j = inew + 1; j < this.inputVertices.length; j++ )
			{
				if(j != i)
				{
					pij.x =  this.inputVertices[j].x - this.inputVertices[i].x;
					pij.y =  this.inputVertices[j].y - this.inputVertices[i].y;
					//pij.normalize();
					var delta = v.angle(pij);
					if((deltaMin > delta) || (deltaMin == delta && lmax < pij.magnitude()) )
					{
						deltaMin = delta;
						lmax = pij.magnitude();
						inew = j;
					}
				}
			}
			v.x = this.inputVertices[inew].x - this.inputVertices[i].x;
			v.y = this.inputVertices[inew].y - this.inputVertices[i].y;
			//v.normalize();
			
			i = inew;

		}while(i != this.firstConvexHullVertexIndex)
	},

	start2 : function(p_vertices_array)
	{
		this.inputVertices = p_vertices_array;
		this.sortInputVertices();
		this.computeEdges();

	},

	sortInputVertices : function()
	{
		this.sortedVertices = this.inputVertices.slice(0);

		this.sortedVertices.sort(function(a, b)
		{
			if(a.x < b.x)
			{
				return -1;
			}
			else
			{
				if(a.x > b.x)
				{
					return 1;
				}
				else
				{
					if(a.y < b.y)
					{
						return -1;
					}
					else
					{
						if(a.y > b.y)
						{
							return 1;
						}
						else
						{
							return 0;
						}
					}
				}
			}
		});
		//console.log(this.sortedVertices);
	},

	computeEdges: function()
	{

		for(var i = 0; i < this.convexHullVertices.length; i++)
		{
			if(i != parseInt(this.convexHullVertices.length/2)+1 && i != parseInt(this.convexHullVertices.length/2)-1 && i != parseInt(this.convexHullVertices.length/2))
			{
				this.edges.push(this.convexHullVertices[parseInt(this.convexHullVertices.length/2)]);
				this.edges.push(this.convexHullVertices[i]);
			}
		}

	},

	computeEdges2: function()
	{
		var current_point = new Vect2();
		var next_point = new Vect2();
		var tmp = [];
		var k = 1;
		var i = 0;
		this.edges =  [];

		this.edges.push(this.sortedVertices[i]);
		do
		{
			current_point.fromPoints(this.sortedVertices[i],this.sortedVertices[i+1]);
			tmp.push(this.sortedVertices[i]);
			this.edges.push(this.sortedVertices[i+1]);
			next_point.fromPoints(this.sortedVertices[i+2], this.sortedVertices[i+1]);
			tmp.push(this.sortedVertices[i+1]);
			k++;
			i++;
		}while(current_point.signedAngle(next_point) == 0 || current_point.signedAngle(next_point) == Math.PI * 2)


		//this.edges.concat(tmp);
		for(var j = 0; j < k; j++)
		{
			this.edges.push(tmp[j])
			this.edges.push(this.sortedVertices[k]);
		}

		//console.log(this.edges);

	},

	computeEdges3: function()
	{
		var current_point = new Vect2();
		var next_point = new Vect2();
		var tmp = [];
		var k = 1;
		var i = 0;
		


		//console.log(this.edges);

	}
}