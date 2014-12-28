Jarvis = {

	convexHullVertices : [],
	inputVertices : [],
	delayExec : 0,
	firstConvexHullVertexIndex : 0,
	start : function(p_vertices_array)
	{
		
		Jarvis.inputVertices = p_vertices_array;

		

		Jarvis.lookingForFirstVertexInConvexHull();
		Jarvis.computeConvexHull();

		
	},

	lookingForFirstVertexInConvexHull : function()
	{
		var i0 = 0;
		var xmin = Jarvis.inputVertices[i0].x;
		var ymin = Jarvis.inputVertices[i0].y;
		

		for( var i = 1; i < Jarvis.inputVertices.length; i++)
		{
			if(Jarvis.inputVertices[i].x < xmin || (Jarvis.inputVertices[i].x == xmin  && Jarvis.inputVertices[i].y > ymin))
			{
				i0 = i;
				xmin = Jarvis.inputVertices[i0].x;
				ymin = Jarvis.inputVertices[i0].y;
			}
		}
		Jarvis.firstConvexHullVertexIndex = i0;

		//console.log("first index "+Jarvis.firstConvexHullVertexIndex);
	},

	computeConvexHull : function()
	{
		var d = new Date();
		var startTime = (new Date()).getTime(); 
		var i = Jarvis.firstConvexHullVertexIndex;
		var j = 0;
		var v = new Vect2();
		var pij = new Vect2()
		v.x = 0;
		v.y = -1;
		//v.normalize();
		Jarvis.convexHullVertices = [];
		do
		{
			Jarvis.convexHullVertices.push(Jarvis.inputVertices[i]);
			if(i == 0)
				j = 1;
			else
				j = 0;
			
			pij.x =  Jarvis.inputVertices[j].x - Jarvis.inputVertices[i].x;
			pij.y =  Jarvis.inputVertices[j].y - Jarvis.inputVertices[i].y;

			//pij.normalize();
			var deltaMin = v.angle(pij) ;
			var lmax = pij.magnitude();
			var inew = j;

			for(j = inew + 1; j < Jarvis.inputVertices.length; j++ )
			{
				if(j != i)
				{
					pij.x =  Jarvis.inputVertices[j].x - Jarvis.inputVertices[i].x;
					pij.y =  Jarvis.inputVertices[j].y - Jarvis.inputVertices[i].y;
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
			v.x = Jarvis.inputVertices[inew].x - Jarvis.inputVertices[i].x;
			v.y = Jarvis.inputVertices[inew].y - Jarvis.inputVertices[i].y;
			//v.normalize();
			
			i = inew;

		}while(i != Jarvis.firstConvexHullVertexIndex);
		var toto = (new Date()).getTime() - startTime; 

		
		
	},

	getExecDuration : function()
	{
		console.log("start time"+Jarvis.startTime);
		console.log("stop time"+Jarvis.startTime);

        $("#log").html(Jarvis.delayExec+"ms");
		return Jarvis.delayExec;
	}
}