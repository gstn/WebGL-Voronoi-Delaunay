var aspectRatio ;
var canvas;
var gl;
var verticesBuffer;
var colorBuffer;
var perspectiveMatrix;
var modelViewMatrix;
var shaderProgram;
var mouseDown = false;
var movePoint = false;
var selectedPointIndex = -1;
var lastMouseX = null;
var lastMouseY = null;
var vertices = [];
var verticesInput = [];
var convexHullVertices = [];
var useJarvis = false;
var useGrahamScan = false;
var useDelaunay = false;
var useVoronoi = false;
var getAlgoDuration = false;
var grid = [];
var d = {};
var start = 0;
var stop = 0;
var delay = -1;
window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

//start WebGL dans le canvas
function startWebGL ()
{
    canvas = $("#glcanvas")[0];
    //aspectRatio = $("#glcanvas").width()/$("#glcanvas").height();

    initWebGL(canvas);
    aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    computeOrthogonalGrid(20);
    console.log("Aspect ratio : "+aspectRatio);

    if(gl)
    {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Met la couleur d'effacement au noir et complétement opaque
        gl.enable(gl.DEPTH_TEST);                               // Active le test de profondeur
        gl.depthFunc(gl.LEQUAL);  
        gl.enable(gl.BLEND); 
        gl.blendFunc(gl.SRC_ALPHA,  gl.ONE_MINUS_SRC_ALPHA);                             // Les objets proches cachent les objets lointains
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Efface les couleurs et le buffer de profondeur.
        //gl.enable(gl.VERTEX_PROGRAM_POINT_SIZE);
        //gl.enable(gl.POINT_SMOOTH);
        initShaders();
        
        
        
        canvas.onmousedown = handleMouseDown;
        canvas.onmouseup = handleMouseUp;
        canvas.onmousemove = handleMouseMove;
        canvas.addEventListener('contextmenu', function(e) {
            //alert("You've tried to open context menu"); //here you draw your own menu
            e.preventDefault();
        }, false);
        drawScene();

    }


}


//Fonction d'initialisation de WebGL
function initWebGL (p_canvas)
{
    console.log("initWebGL");
    gl = null;
    try { 
        // Essaye de récupérer le contexte standard. En cas d'échec, il teste l'appel experimental
        gl = p_canvas.getContext("experimental-webgl") || p_canvas.getContext("webgl");
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    } 
    catch(e) {} 

    // Si le contexte GL n'est pas récupéré, on l'indique à l'utilisateur.
    if (!gl) { 
        alert("Impossible d'initialiser le WebGL. Il est possible que votre navigateur ne supporte pas cette fonctionnalité."); 
    } 

}


//fonction de chargement du program Shader
function initShaders()
{
    //console.log("initShaders");
    var fragmentShader = getShader(gl,"shader-fs");
    var vertexShader = getShader(gl,"shader-vs");

    //Création du programme shader
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    //affichage d'une alerte si le chargement du shader a échoué
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
    {
        alert("Impossible de charger le shader.");
    }

    //On spécifie a WebGL quel programme shader utiliser
    gl.useProgram(shaderProgram);


}

function getShader(p_gl, p_id)
{
    //console.log("getShader "+p_id);
    var shaderScript, source, currentChild, shader;

    shaderScript = $("#"+p_id)[0];
    
    if(!shaderScript)
    {
        return null;
    }
    source = "";
    currentChild = shaderScript.firstChild;
    while(currentChild)
    {
        if (currentChild.nodeType == currentChild.TEXT_NODE)
        {
            source += currentChild.textContent;
        }
        currentChild = currentChild.nextSibling;
    }

    if (shaderScript.type == "x-shader/x-fragment")
    {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else
    {
        if(shaderScript.type == "x-shader/x-vertex")
        {
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else
        {
            return null;
        }
    }

    gl.shaderSource(shader, source);

    //On compile le shader
    gl.compileShader(shader);

    //On vérifie si la compilation s'est bien déroulée
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    {
        alert("Erreur lors de la compilation du shader "+gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


function initBuffers(p_vertices)
{
    //console.log("initBuffers");
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(p_vertices), gl.STATIC_DRAW);

    return buffer;
}

function computeOrthogonalGrid(p_step)
{
    for(var vertical_line = -gl.drawingBufferWidth/2; vertical_line < gl.drawingBufferWidth/2; vertical_line += p_step)
    {
        grid.push({x: vertical_line, y: -gl.drawingBufferHeight/2, z: 5});
        grid.push({x: vertical_line, y: gl.drawingBufferHeight/2, z: 5});
    }
   
    for(var horizontal_line = -gl.drawingBufferHeight/2; horizontal_line < gl.drawingBufferHeight/2; horizontal_line += p_step)
    {
        grid.push({x: -gl.drawingBufferWidth/2, y: horizontal_line, z: 5});
        grid.push({x: gl.drawingBufferWidth/2 , y: horizontal_line, z: 5});
    }

}

function drawOrthogonalGrid()
{
    drawVertices(flattenVerticesArray(grid), gl.LINES, [1.0, 1.0, 1.0,0.1]);
    drawVertices(flattenVerticesArray(
        [
        {x:-gl.drawingBufferWidth/2, y: 0, z:5},
        {x:gl.drawingBufferWidth/2, y: 0, z:5},
        {x:0, y: -gl.drawingBufferHeight/2, z:5},
        {x:0, y: gl.drawingBufferHeight/2, z:5}
        ]), gl.LINES, [1.0, 1.0, 1.0,0.5]);
   
}

function drawScene()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawOrthogonalGrid();
    vertices = flattenVerticesArray(verticesInput);
    drawVertices(vertices, gl.POINTS, [1.0,0.3,0.3,1.0]);

    if(verticesInput.length > 2)
    {
        //console.log(verticesInput);

        if(useJarvis)
        {

            Jarvis.start(verticesInput);
            if(getAlgoDuration)
            {
                Jarvis.start(verticesInput);
                delay = Jarvis.getExecDuration();
                console.log(delay+"ms");
                $("#log").html(delay+"ms");
                getAlgoDuration = false;
            }

            convexHullVertices = flattenVerticesArray(Jarvis.convexHullVertices);
        }
        else
        {
            if(useGrahamScan)
            {
                GrahamScan.start(verticesInput);
                drawVertices(flattenVerticesArray(GrahamScan.sortedVertices), gl.LINE_LOOP, [0.3,1.0,1.0,1.0]);
                drawVertices([GrahamScan.barycenter.x,GrahamScan.barycenter.y,GrahamScan.barycenter.z], gl.POINTS, [0.3,1.0,0.3,1.0]);
                convexHullVertices = flattenVerticesArray(GrahamScan.convexHullVertices);
            }
            else
            {
                if(useDelaunay)
                {
                   
                    FlipDelaunay.start(verticesInput);

                    
                    convexHullVertices = flattenVerticesArray(FlipDelaunay.convexHullVertices);
                    drawVertices(flattenVerticesArray(FlipDelaunay.edges), gl.LINES, [0.3,1.0,1.0,1.0]);
                }
                else
                {
                    if(useVoronoi)
                    {
                        console.log("use voronoi");
                    }
                }
            }
        }

        //console.log(convexHullVertices);
        drawVertices(convexHullVertices, gl.LINE_LOOP, [0.3,0.3,1.0,1.0]);
    }

}

function drawVertices(p_vertices, p_gl_draw_mode, p_color)
{
    //console.log("drawVertices");

    verticesBuffer = initBuffers(p_vertices);
    perspectiveMatrix = makePerspective(45, aspectRatio, 0.1, 100);
    orthoMatrix = makeOrtho(
        -gl.drawingBufferWidth/2,
        gl.drawingBufferWidth/2,
        -gl.drawingBufferHeight/2,
        gl.drawingBufferHeight/2,
        0,
        10);

    modelViewMatrix = Matrix.I(4);
    modelViewMatrix = modelViewMatrix.x(Matrix.Translation($V([0.0, 0.0, -6.0])).ensure4x4());
    

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.vertexAttribPointer(verticesBuffer, 3, gl.FLOAT, false, 0, 0);

    var vertexPositionAttribute = gl.getAttribLocation(shaderProgram,"a_Position");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    var perspectiveMatrixUniform = gl.getUniformLocation(shaderProgram, "u_PerspectiveMatrix");
    gl.uniformMatrix4fv(perspectiveMatrixUniform, false, new Float32Array(perspectiveMatrix.flatten()));

    var orthoMatrixUniform = gl.getUniformLocation(shaderProgram, "u_OrthoMatrix");
    gl.uniformMatrix4fv(orthoMatrixUniform, false, new Float32Array(orthoMatrix.flatten()));

    var modelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "u_ModelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixUniform, false, new Float32Array(modelViewMatrix.flatten()));

    color = [1.0,0.3,0.3,1.0];
    var vertexColorUniform = gl.getUniformLocation(shaderProgram,"u_Color");
    gl.uniform4fv(vertexColorUniform, new Float32Array(p_color));
    gl.drawArrays(p_gl_draw_mode, 0, p_vertices.length/3);
}



function handleMouseDown(event) {
    //console.log("handleMouseDown");
    mouseDown = true;
    var canvasBoundingRect = canvas.getBoundingClientRect();
    lastMouseX = event.clientX - canvasBoundingRect.left;
    lastMouseY = event.clientY - canvasBoundingRect.top;
    //console.log("button :"+event.button);
    var click = {x: lastMouseX - gl.drawingBufferWidth/2, y: gl.drawingBufferHeight/2 - lastMouseY , z: 5.0};
    //console.log(verticesInput);
    selectedPointIndex = isInVertexArray(click);
    if(event.button == 0)
    {
        if(selectedPointIndex == -1)
        {
            //console.log("ADD point");
            movePoint = false;
            verticesInput.push(click);
        }
        else
        {
            if(movePoint === false)
            {
                //console.log("MOVE point at index: "+selectedPointIndex);
            }
            movePoint = true;
        }
    }
    else
    {
        if(event.button == 2)
        {
            if(selectedPointIndex != -1)
            {
                //console.log("REMOVE point at index: "+selectedPointIndex);
                verticesInput.splice(selectedPointIndex,1);
            }
        }
    }

    drawScene();
}

function handleMouseUp(event) {
    mouseDown = false;
    movePoint = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
      return;
    }
    if(movePoint)
    {
        //console.log("move");
        var canvasBoundingRect = canvas.getBoundingClientRect();
        lastMouseX = event.clientX - canvasBoundingRect.left;
        lastMouseY = event.clientY - canvasBoundingRect.top;
        var click = {x: lastMouseX - gl.drawingBufferWidth/2, y: gl.drawingBufferHeight/2 - lastMouseY , z: 5.0};
        verticesInput[selectedPointIndex] = click;
        vertices = flattenVerticesArray(verticesInput);
        drawScene();

    }
}

function isInVertexArray(p_click)
{
    for(var i = 0; i < verticesInput.length; i++)
    {
        if(isSamePoint(p_click, verticesInput[i], 10))
        {
            console.log("same point "+i);
            return i;
        }
    } 
    return -1;
}

function isSamePoint(p_click, p_point, p_pointSize)
{
    //console.log(p_click.x +" >= "+ (p_point.x - p_pointSize)+ " && " + p_click.x +" <= "+ (p_point.x + p_pointSize)+" --> "+( p_click.x >= (p_point.x - p_pointSize) && p_click.x <= (p_point.x + p_pointSize)));
    //console.log(p_click.y +" >= "+ (p_point.y - p_pointSize)+ " && " + p_click.y +" <= "+ (p_point.y + p_pointSize)+" --> "+( p_click.y >= (p_point.y - p_pointSize) && p_click.y <= (p_point.y + p_pointSize)));
    if( p_click.x >= (p_point.x - p_pointSize) && p_click.x <= (p_point.x + p_pointSize))
    {
        if( p_click.y >= (p_point.y - p_pointSize) && p_click.y <= (p_point.y + p_pointSize))
        {
            //console.log("existing point");
            return true;
        }
        else
        {
            //console.log("not existing point");
            return false;
        }
    }
    else
    {
       // console.log("not existing point");
        return false;
    }
}

function changeConvexHullAlgorithme(p_algo)
{

    //console.log("Change algorithme to "+p_algo);
    if(p_algo == "jarvis")
    {
        useJarvis = true;
        useDelaunay = useGrahamScan = useVoronoi = false;
    }
    else
    {
        if(p_algo == "graham-scan")
        {
            useGrahamScan = true;
            useDelaunay = useJarvis = useVoronoi = false;
        }
        else
        {
            if(p_algo == "delaunay")
            {
                useDelaunay = true;
                useGrahamScan = useJarvis = useVoronoi = false; 
            }
            else
            {
                if(p_algo == "voronoi")
                {
                    useVoronoi = true;
                    useGrahamScan = useJarvis = useDelaunay = false; 
                }
                else
                {
                    console.log("not implemented");
                }            
            }
        }
    }
    drawScene();
}

function flattenVerticesArray(p_array)
{
    var tmp = [];
    for(var i = 0; i < p_array.length; i++)
    {
        tmp.push(p_array[i].x);
        tmp.push(p_array[i].y);
        tmp.push(p_array[i].z);
    }

    return tmp;
}

function tick()
{
    requestAnimationFrame(tick);

    
    if(getAlgoDuration)
    {
        getAlgoDuration = false; 
    }

}



function wantAlgoDuration()
{
    getAlgoDuration = true;
    console.log("toto");

}

