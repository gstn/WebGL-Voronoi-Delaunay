var aspectRatio ;
var canvas;
var gl;
var verticesBuffer;
var curveVerticesBuffer;
var colorBuffer;
var perspectiveMatrix;
var modelViewMatrix;
var shaderProgram;
var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var vertices = [];
var curveVertices = [];

//start WebGL dans le canvas
function startWebGL ()
{
    canvas = $("#glcanvas")[0];
    //aspectRatio = $("#glcanvas").width()/$("#glcanvas").height();

    initWebGL(canvas);
    aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    console.log("Aspect ratio : "+aspectRatio);

    if(gl)
    {
        gl.clearColor(1.0, 1.0, 1.0, 1.0);                      // Met la couleur d'effacement au noir et complétement opaque
        gl.enable(gl.DEPTH_TEST);                               // Active le test de profondeur
        gl.depthFunc(gl.LEQUAL);                                // Les objets proches cachent les objets lointains
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Efface les couleurs et le buffer de profondeur.
        //gl.enable(gl.VERTEX_PROGRAM_POINT_SIZE);
        //gl.enable(gl.POINT_SMOOTH);
        initShaders();
        
        
        
        canvas.onmousedown = handleMouseDown;
        canvas.onmouseup = handleMouseUp;
        //canvas.onmousemove = handleMouseMove;
        initBuffers();
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
        gl = p_canvas.getContext("experimental-webgl");
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


function initBuffers()
{
    //console.log("initBuffers");
    verticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    curveVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,curveVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(curveVertices), gl.STATIC_DRAW);

}

function drawScene()
{
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //drawPoly();
    drawControlPoints();

}

function drawPoly()
{
    //console.log("drawPoly");
   

    perspectiveMatrix = makePerspective(45, aspectRatio, 0.1, 100);

    modelViewMatrix = Matrix.I(4);
    modelViewMatrix = modelViewMatrix.x(Matrix.Translation($V([-0.0, 0.0, -6.0])));
    

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.vertexAttribPointer(verticesBuffer, 3, gl.FLOAT, false, 0, 0);

    var vertexPositionAttribute = gl.getAttribLocation(shaderProgram,"a_Position");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    var perspectiveMatrixUniform = gl.getUniformLocation(shaderProgram, "u_PerspectiveMatrix");
    gl.uniformMatrix4fv(perspectiveMatrixUniform, false, new Float32Array(perspectiveMatrix.flatten()));

    var modelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "u_ModelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixUniform, false, new Float32Array(modelViewMatrix.flatten()));

    var color = [0.2,0.5,1.0,1.0];
    var vertexColorUniform = gl.getUniformLocation(shaderProgram,"u_Color");
    gl.uniform4fv(vertexColorUniform, Float32Array(color));

    gl.drawArrays(gl.LINE_STRIP, 0, vertices.length/3);
    
}

function drawControlPoints()
{
    //console.log("drawControlPoints");

    perspectiveMatrix = makePerspective(45, aspectRatio, 0.1, 100);

    modelViewMatrix = Matrix.I(4);
    modelViewMatrix = modelViewMatrix.x(Matrix.Translation($V([-0.0, 0.0, -6.0])));
    

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.vertexAttribPointer(verticesBuffer, 3, gl.FLOAT, false, 0, 0);

    var vertexPositionAttribute = gl.getAttribLocation(shaderProgram,"a_Position");
    gl.enableVertexAttribArray(vertexPositionAttribute);

    var perspectiveMatrixUniform = gl.getUniformLocation(shaderProgram, "u_PerspectiveMatrix");
    gl.uniformMatrix4fv(perspectiveMatrixUniform, false, new Float32Array(perspectiveMatrix.flatten()));

    var modelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "u_ModelViewMatrix");
    gl.uniformMatrix4fv(modelViewMatrixUniform, false, new Float32Array(modelViewMatrix.flatten()));

    color = [1.0,0.3,0.3,1.0];
    var vertexColorUniform = gl.getUniformLocation(shaderProgram,"u_Color");
    gl.uniform4fv(vertexColorUniform, Float32Array(color));
    gl.drawArrays(gl.POINTS, 0, vertices.length/3);
}


function handleMouseDown(event) {
    console.log("handleMouseDown");
    mouseDown = true;
    var canvasBoundingRect = canvas.getBoundingClientRect();
    lastMouseX = event.clientX - canvasBoundingRect.left;
    lastMouseY = event.clientY - canvasBoundingRect.top;
    
    console.log(canvasBoundingRect);
    console.log("mouse pos ("+lastMouseX+","+lastMouseY+")");

    var click = [lastMouseX/320-1,1-lastMouseY/240,0.0]
    if(!isInVertexArray(click)){
        vertices = vertices.concat(click);
    }

    initBuffers();
    drawScene();

}

function handleMouseUp(event) {
    mouseDown = false;
}

function handleMouseMove(event) {
    if (!mouseDown) {
      return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX;
    var deltaY = newY - lastMouseY;

    //console.log("delta : ("+deltaX+","+deltaY+")");
    lastMouseX = newX
    lastMouseY = newY;
}

function isInVertexArray(p_click)
{
    return false;
}

function delta(p1, p2) {
    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y
    };
}

function getPointAt(p1, p2, t) {
    var diff = delta(p1, p2);
    return {
        x: diff.x * t + p1.x,
        y: diff.y * t + p1.y
    };
}
