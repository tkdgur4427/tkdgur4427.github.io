// this function is executed once the page is loaded
var main = function () {
    // get the canvas from the DOM
    var CANVAS = document.getElementById("WebGL_canvas");

    // resize the canvas
    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    /*===== GET WEBGL CONTEXT =====*/
    var WebGL;
    try {
        // create WebGL context
        // all WebGL functions are methods of WebGL; it is access point of the API
        WebGL = CANVAS.getContext("experimental-webgl",{antialias: true});
    }
    catch (e) {
        alert("NOT WebGL compatible:(");
        return false;
    }

    /*===== SHADERS =====*/
    var vsshader = document.getElementById("vsshader").innerText;
    var psshader = document.getElementById("psshader").innerText;

    // this function is used to compile a shader
    var getShader = function (source, type, typeString) {
        var shader = WebGL.createShader(type);
        WebGL.shaderSource(shader, source);
        WebGL.compileShader(shader);

        if (!WebGL.getShaderParameter(shader, WebGL.COMPILE_STATUS)) {
            alert("Error in" + typeString + " Shader: " + WebGL.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    };

    // compilation of the vertex and pixel shader
    var shaderVS = getShader(vsshader, WebGL.VERTEX_SHADER, "VERTEX");
    var shaderPS = getShader(psshader, WebGL.FRAGMENT_SHADER, "FRAGMENT");

    // creation of the shader program
    var SHADER_PROGRAM = WebGL.createProgram();
    WebGL.attachShader(SHADER_PROGRAM, shaderVS);
    WebGL.attachShader(SHADER_PROGRAM, shaderPS);

    WebGL.linkProgram(SHADER_PROGRAM); // linking of the shader program
    var _color = WebGL.getAttribLocation(SHADER_PROGRAM, "color");
    var _position = WebGL.getAttribLocation(SHADER_PROGRAM, "position"); // position GLSL variable links to

    // we link Pmatrix GLSL variable to _Pmatrix javascript variable
    // Uniforms do not need to be enabled like attributes
    var _Pmatrix = WebGL.getUniformLocation(SHADER_PROGRAM, "Pmatrix");
    var _Mmatrix = WebGL.getUniformLocation(SHADER_PROGRAM, "Mmatrix");
    var _Vmatrix = WebGL.getUniformLocation(SHADER_PROGRAM, "Vmatrix");

    WebGL.enableVertexAttribArray(_color);
    WebGL.enableVertexAttribArray(_position); // GLSL attributes variables
    WebGL.useProgram(SHADER_PROGRAM); // linking is over, tells WebGL context to use SHADER_PROGRAM for rendering

    /*===== THE TRIANGLE =====*/
    // Points:
    // we build the point coordinates array of the triangle
    var triangle_vertex = [
        -1, -1, 0, // first summit -> bottom left of the viewport
        0, 0, 1,
        1, -1, 0, // bottom right of the viewport
        1, 1, 0,
        1, 1, 0, // top right of the viewport
        1, 0, 0
    ];

    var TRIANGLE_VERTEX = WebGL.createBuffer(); // we build the VBO (Vertex Buffer Object) = the WebGL vertex array
    WebGL.bindBuffer(WebGL.ARRAY_BUFFER, TRIANGLE_VERTEX);
    WebGL.bufferData(WebGL.ARRAY_BUFFER, new Float32Array(triangle_vertex), WebGL.STATIC_DRAW);

    // FACES:
    // use points with index 0, 1, 2 to build a triangle
    var triangle_faces = [0, 1, 2];
    var TRIANGLE_FACES = WebGL.createBuffer();
    WebGL.bindBuffer(WebGL.ELEMENT_ARRAY_BUFFER, TRIANGLE_FACES);
    WebGL.bufferData(WebGL.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangle_faces), WebGL.STATIC_DRAW);

    /*===== MATRIX =====*/
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var MOVEMATRIX = LIBS.get_I4();
    var VIEWMATRIX = LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -5);

    /*===== DRAWING =====*/
    WebGL.clearColor(0.0, 0.0, 0.0, 0.0); // set clear color to transparent

    // we enable Depth buffer test and set depth buffer comparison function
    WebGL.enable(WebGL.DEPTH_TEST);
    WebGL.depthFunc(WebGL.LEQUAL);

    // we set the clear value for the depth buffer to 1
    WebGL.clearDepth(1.0);

    var time_old = 0;

    var animate = function (time) {
        var dAngle = 0.005 * (time - time_old);
        LIBS.rotateY(MOVEMATRIX, dAngle);
        time_old = time;

        WebGL.viewport(0.0, 0.0, CANVAS.width, CANVAS.height);
        WebGL.clear(WebGL.COLOR_BUFFER_BIT | WebGL.DEPTH_BUFFER_BIT);

        WebGL.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
        WebGL.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
        WebGL.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
        WebGL.bindBuffer(WebGL.ARRAY_BUFFER, TRIANGLE_VERTEX);
        WebGL.vertexAttribPointer(_position, 2, WebGL.FLOAT, false, 4 * (3 + 3), 0);
        WebGL.vertexAttribPointer(_color, 3, WebGL.FLOAT, false, 4 * (3 + 3), 3 * 4);

        WebGL.bindBuffer(WebGL.ARRAY_BUFFER, TRIANGLE_FACES);
        WebGL.drawElements(WebGL.TRIANGLES, 3, WebGL.UNSIGNED_SHORT, 0);
        WebGL.flush();

        window.requestAnimationFrame(animate);
    };

    animate(0);
}