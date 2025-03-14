/*
*   TODO:
*    - Leaf shake
*      
*/

const startButton = document.querySelector('.start');
const startLeaf = document.querySelector('.solveLeaf');
const leafQuatSlider = document.querySelector('.leavesNo');
const spawnSpeedSlider = document.querySelector('.spawnSpeedAdjust');
const resetButton = document.querySelector('.reset');
const slider = document.querySelector('.speedAdjust');
const leafSpeedSlider = document.querySelector('.leafSpeedAdjust');
const body = document.querySelector("body");
const poly = document.querySelector('polyline');

let points = "234,2 234,10 170,10 170,26 202,26 202,42 186,42 186,90 170,90 170,74 154,74 154,90 138,90 138,74 122,74 122,58 106,58 106,42 58,42 58,58 90,58 90,106 122,106 122,122 106,122 106,138 138,138 138,186 122,186 122,234 106,234 106,250 122,250 122,266 90,266 90,298 74,298 74,266 58,266 58,282 42,282 42,266 10,266 10,282 26,282 26,298 58,298 58,314 42,314 42,330 26,330 26,314 10,314 10,362 26,362 26,346 42,346 42,362 58,362 58,330 74,330 74,394 90,394 90,362 106,362 106,378 122,378 122,394 154,394 154,426 138,426 138,442 170,442 170,458 186,458 186,426 170,426 170,394 186,394 186,410 202,410 202,426 314,426 314,442 298,442 298,458 314,458 314,474 282,474 282,458 266,458 266,474 250,474 250,482";
let arr = create2DArrayFromCoordinates(points);
console.log(arr[0]);

resetButton.disabled = true;

// Default Values

let speed = 100; // default polyline speed
let leafSpeed = 50;
let leafQuat = 1;
let spawnSpeed = 1000;

startButton.addEventListener('click', () => {
    drawSolutionLerp()
});

slider.addEventListener('input', () => {
    speed = slider.value;
});

resetButton.addEventListener('click', () => {
    if (checkReset())
        reset();
});

startLeaf.addEventListener('click', () => {
    generateLeaves();
});

function create2DArrayFromCoordinates(points) {
    // Split the input string into an array of coordinate pairs
    let coordinates = points.split(" ");

    // Map each coordinate pair into an array of [x, y]
    let result = coordinates.map(pair => {
        let [x, y] = pair.split(",").map(Number);
        return [x, y];
    });

    return result;
}

function drawSolutionLerp() {
    let polypoints = "";
    poly.setAttribute("points", "");
    poly.setAttribute('stroke', '#db9a17');
    let index = 0;

    startButton.disabled = true;
    startLeaf.disabled = true;

    function draw() {
        if (index >= arr.length - 1) {
            resetButton.disabled = false;
            return;
        }

        let startX = arr[index][0];
        let startY = arr[index][1];
        let endX = arr[index + 1][0];
        let endY = arr[index + 1][1];
        //console.log("Start x: "+startX+" start y: "+startY);
        //console.log("End x: "+endX+", end y: "+endY)
        // Calculate distance between points
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

        // Calculate duration based on speed (distance / speed = time)
        const duration = distance / speed * 1000; // izracuna trajanje za premik med tockama start in end ter pretvori value v ms
        const startTime = performance.now(); //dobi zacetni cas v ms

        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const t = Math.min(elapsed / duration, 1); // Normalized time (0 to 1) -> progress koliko je animacija koncana -> .5 = 50%

            // Interpolation (smooth transition)
            polypoints += (lerp(startX, endX, t))+","+(lerp(startY, endY,t))+" ";
            poly.setAttribute("points", polypoints);
            /* 
                polypoints += lerp(x) + ", "+lerp(y) +" "-> nastavi points umes za smoother line, hopefully brez slowing down 
                later down the line
             */

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                index++;
                draw(); // ko je t = 1 oz je pot opravljena 100% gre na naslednjo tocko
            }
        }
        requestAnimationFrame(animate);
    }

    draw();
}


function reset() {
    let polyPoints = poly.getAttribute('points');
    resetButton.disabled = true;
    slider.disabled = true;
    let spaceIdx = 0;
    let interval = setInterval(() => {
        if (spaceIdx === -1) {
            clearInterval(interval);
            startButton.disabled = false;
            startLeaf.disabled = false;
            slider.disabled = false;
            leafSpeedSlider.disabled = false;
            spawnSpeedSlider.disabled = false;
            leafQuatSlider.disabled = false;
            poly.setAttribute('points', '');
            return;
        }

        spaceIdx = polyPoints.indexOf(" ");
        polyPoints = polyPoints.substring(spaceIdx + 1);
        poly.setAttribute('points', polyPoints);

    }, 4)
}

function checkReset() {
    return poly.getAttributeNames().includes("points");
}

//mazeToGrid();

function mazeToGrid() {
    let svg = document.querySelector(".maze").children[0];
    let walls = document.querySelectorAll('line');
    console.log(walls);
    console.log(parseInt(svg.getAttribute('height')));
    let gridx = parseInt(svg.getAttribute('height')), gridY = parseInt(svg.getAttribute('height'));
    let x1, x2, y1, y2;
    let grid = [];

    for (let i = 0; i < gridx; i++) {
        grid[i] = new Array(gridY).fill(0);
    }
    console.log(grid);

    for (let i = 0; i < walls.length; i++) {
        x1 = parseInt(walls[i].getAttribute('x1'));
        x2 = parseInt(walls[i].getAttribute('x2'));
        y1 = parseInt(walls[i].getAttribute('y1'));
        y2 = parseInt(walls[i].getAttribute('y2'));

        //y je isti sam x se spreminja -> za vsak line da v grid 1 kot wall
        if (y1 == y2) {
            for (let j = x1; j <= x2; j++) {
                console.log(y1);
                grid[y1][j] = 1;
            }
        }
        else if (y1 != y2) {
            for (let j = y1; j <= y2; j++) {
                grid[j][x1] = 1;
            }
        }
    }

    addStartEnd();

    function addStartEnd() {
        let start = walls[0].getAttribute('y1');
        let end = walls[walls.length - 1].getAttribute('y2');
        console.log("y1: " + start);
        console.log("end: " + end)

        let drawnStart = false

        //narderi da 0 da v 2;

        for (let i = 2; i < walls[0].length; i++) {
            if (walls[i] == 0) {

            }
        }


    }
    console.log(grid);


}

function lerp(start, end, t) {
    return start + (end - start) * t;
}

let activeLeaves = 0;
function generateLeaves() {
    startLeaf.disabled = true;
    startButton.disabled = true;
    const maze = document.querySelector('.maze');
    const leafSvg = `<?xml version="1.0" encoding="iso-8859-1"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
<svg height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 512 512" xml:space="preserve">
<path style="fill:#FFD92D;" d="M502.672,194.84c-10.829,0.312-24.547,1.688-39.942,5.707c-17.789,4.642-32.044,11.305-42.39,17.119
	c4.798-39.563,4.891-50.541,4.891-50.541c0.193-22.557-4.38-39.563-7.335-50.541c-14.697-54.629-53.94-94.44-66.845-106.788
	c-12.759,11.189-28.64,27.462-43.206,49.726c-18.809,28.76-27.936,56.067-32.608,74.996c-0.331-0.344-28.769-34.646-59.508-57.878
	c-20.962-15.838-39.389-23.813-56.248-30.977C132.647,34.261,84.477,17.957,17.901,17.149
	c0.756,66.754,17.098,115.04,28.519,141.921c7.164,16.856,15.137,35.285,30.976,56.246c23.233,30.739,57.534,59.178,57.878,59.51
	c-18.929,4.671-46.237,13.796-74.998,32.607c-22.264,14.565-38.537,30.445-49.726,43.204c12.35,12.906,52.159,52.15,106.789,66.845
	c10.98,2.954,27.983,7.527,50.541,7.337c0,0,10.98-0.092,50.541-4.891c-5.816,10.345-12.477,24.602-17.119,42.389
	c-4.019,15.396-5.394,29.114-5.707,39.944c15.264,0.185,65.113-1.17,104.344-37.5c21.602-20.002,31.543-42.793,35.867-52.986
	c8.343-19.659,10.649-36.404,12.765-63.987c27.361-2.108,44.042-4.431,63.614-12.736c10.191-4.325,32.981-14.267,52.986-35.869
	C501.503,259.952,502.858,210.107,502.672,194.84z"/>
<path style="fill:#FFE571;" d="M241.501,468.868c0.329-11.46,1.786-25.977,6.038-42.268c4.911-18.822,11.961-33.909,18.115-44.855
	c-41.863,5.078-53.482,5.176-53.482,5.176c-23.872,0.202-41.863-4.638-53.482-7.764c-51.509-13.856-90.546-48.318-107.692-65.33
	c-17.575,12.703-30.878,25.898-40.449,36.81c12.35,12.906,52.159,52.15,106.789,66.845c10.98,2.954,27.983,7.527,50.541,7.337
	c0,0,10.98-0.092,50.541-4.891c-5.816,10.345-12.477,24.602-17.119,42.389c-4.019,15.396-5.394,29.114-5.707,39.944
	c15.264,0.185,65.113-1.17,104.344-37.5c2.807-2.599,5.407-5.246,7.834-7.905C278.9,468.402,252.189,468.997,241.501,468.868z"/>
<path style="fill:#FFA81E;" d="M462.729,200.548c-17.789,4.642-32.047,11.303-42.393,17.117c4.798-39.559,4.891-50.54,4.891-50.54
	c0.19-22.558-4.379-39.563-7.333-50.541c-14.697-54.629-53.94-94.44-66.848-106.789c-12.759,11.189-28.637,27.461-43.206,49.726
	c-18.809,28.761-27.936,56.069-32.605,74.996c-0.332-0.344-28.769-34.643-59.508-57.877c-20.962-15.839-39.392-23.812-56.248-30.976
	C132.65,34.266,84.468,17.992,17.917,17.176C18.681,83.904,35,132.196,46.421,159.07c1.832,4.325,3.742,8.758,5.8,13.304
	c-1.092-10.103-1.858-20.747-1.987-32.19c0.003,0.007-0.001,0.003,0,0c54.807,0.673,94.487,14.075,116.587,23.463
	c13.881,5.901,29.055,12.467,46.317,25.511c8.143,6.153,16.088,13.25,23.131,20.056c11.722,11.326,31.161,7.794,37.872-7.061
	c3.891-8.614,8.757-17.76,14.863-27.093c5.642-8.627,11.524-16.161,17.266-22.681c9.662-10.969,26.783-10.399,36.124,0.845
	c13.35,16.071,29.465,39.932,37.237,68.828c2.436,9.043,6.199,23.046,6.045,41.624c0,0-0.008,0.929-0.15,3.263
	c-0.999,16.568,14.542,28.62,30.588,24.375c0.147-0.038,0.292-0.077,0.439-0.113c12.683-3.311,23.976-4.442,32.897-4.701
	c0.066,5.41-0.259,16.232-2.853,29.222c6.165-4.584,12.487-9.964,18.574-16.537c36.33-39.231,37.685-89.077,37.499-104.344
	C491.842,195.154,478.125,196.529,462.729,200.548z"/>
<g>
	<path style="fill:#FFFFFF;" d="M84.06,358.292c-1.873-0.074-3.743-0.688-5.368-1.877c-0.467-0.342-3.139-2.408-4.222-5.644
		c0.573,1.969,1.717,3.67,3.104,4.788l-0.325-0.255c-4.263-3.298-5.047-9.427-1.748-13.692c3.298-4.263,9.429-5.046,13.692-1.748
		c0.202,0.156,0.396,0.314,0.579,0.471l0.446,0.327c4.351,3.185,5.297,9.292,2.112,13.641
		C90.339,357.026,87.198,358.416,84.06,358.292z"/>
	<path style="fill:#FFFFFF;" d="M173.452,393.227c-0.187-0.008-0.377-0.02-0.566-0.039c-27.514-2.674-47.007-10.092-71.378-22
		c-4.844-2.367-6.852-8.212-4.485-13.054c2.367-4.844,8.212-6.851,13.054-4.486c22.902,11.189,39.995,17.709,64.698,20.112
		c5.366,0.521,9.292,5.294,8.77,10.66C183.042,389.593,178.583,393.431,173.452,393.227z"/>
</g>
<g>
	<path style="fill:#1C2042;" d="M139.708,48.464c5.016,1.883,10.032,3.894,15.336,6.148c1.247,0.53,2.54,0.781,3.814,0.781
		c3.797,0,7.408-2.231,8.986-5.945c2.108-4.962-0.204-10.694-5.165-12.801c-5.562-2.363-10.832-4.476-16.111-6.458
		c-5.046-1.895-10.673,0.661-12.568,5.708C132.105,40.945,134.661,46.569,139.708,48.464z"/>
	<path style="fill:#1C2042;" d="M373.319,355.061c15.022-2.004,27.996-5.09,42.06-11.058c9.433-4,34.487-14.626,56.339-38.222
		c35.591-38.433,40.398-86.099,40.096-111.093c-0.03-2.617-1.111-5.111-3-6.922c-1.887-1.812-4.4-2.769-7.041-2.716
		c-14.22,0.409-28.394,2.434-42.128,6.019c-9.625,2.512-19.043,5.789-28.157,9.792c2.777-25.319,2.879-33.3,2.883-33.689
		c0.202-23.916-4.728-42.223-7.673-53.16C412.58,61.526,377.08,21.748,357.176,2.707c-3.657-3.497-9.378-3.62-13.183-0.285
		c-17.28,15.156-32.4,32.557-44.937,51.721c-12.315,18.833-22.012,39.123-28.934,60.512c-11.831-12.898-30.021-31.4-49.125-45.84
		c-4.302-3.25-10.423-2.4-13.672,1.901c-3.25,4.301-2.4,10.422,1.901,13.672c26.114,19.74,50.713,47.878,57.63,56.033
		c0.433,0.511,0.69,0.786,0.733,0.83c2.466,2.561,6.131,3.578,9.561,2.656c3.434-0.921,6.094-3.636,6.946-7.087
		c6.348-25.721,16.879-49.942,31.3-71.992c9.915-15.156,21.582-29.119,34.758-41.608c18.86,19.331,46.21,53.158,57.699,95.865
		c2.859,10.621,7.182,26.671,7.002,47.894c-0.001,0.109-0.206,11.446-4.819,49.477c-0.444,3.652,1.205,7.241,4.261,9.288
		c3.056,2.047,7.003,2.198,10.211,0.397c12.624-7.094,26.107-12.54,40.073-16.184c9.006-2.352,18.223-3.952,27.515-4.788
		c-1.2,23.318-7.998,58.519-34.695,87.349c-19.006,20.523-41.261,29.961-49.641,33.515c-15.315,6.499-28.71,9.086-49.232,11.023
		c0.086-1.219,0.172-2.451,0.26-3.704c1.113-15.861,1.283-45.484,1.23-67.541c-0.033-13.751-0.155-25.557-0.225-31.369
		c-0.048-4.077-0.098-7.398-0.137-9.702c-0.02-1.054-0.035-2.046-0.09-2.985c0-0.096,0-0.141,0-0.157
		c0,0.043-0.001,0.085-0.003,0.129c-0.213-3.606-0.988-6.391-4.516-8.633c-3.023-1.922-6.86-2.033-9.988-0.288
		c-5.065,2.823-5.03,7.492-5.009,10.282c0.008,1.153,0.027,2.915,0.057,5.359c0.005,0.432,0.038,0.858,0.098,1.274
		c0.258,18.611,0.67,65.538-0.392,92.669l-30.51-29.747c-3.86-3.764-10.04-3.686-13.801,0.176
		c-3.764,3.859-3.684,10.039,0.176,13.801l33.524,32.687c-25.191,1.471-79.324,1.005-99.652,0.724
		c-0.416-0.06-0.841-0.092-1.273-0.098c-2.444-0.03-4.206-0.049-5.359-0.057c-2.812-0.014-7.46-0.053-10.282,5.009
		c-1.745,3.129-1.635,6.964,0.288,9.988c2.242,3.528,5.029,4.302,8.633,4.516c-0.113,0.003-0.131,0.003,0.031,0.003
		c0.938,0.055,1.93,0.072,2.983,0.09c2.305,0.039,5.625,0.088,9.702,0.137c5.813,0.07,17.617,0.191,31.369,0.225
		c2.259,0.005,4.594,0.009,6.99,0.009c20.989,0,46.315-0.239,60.551-1.238c1.383-0.096,2.739-0.193,4.082-0.286
		c-1.939,20.731-4.52,34.198-11.055,49.603c-3.555,8.38-13,30.641-33.516,49.638c-28.83,26.699-64.029,33.497-87.347,34.698
		c0.835-9.3,2.438-18.518,4.787-27.515c3.649-13.974,9.093-27.458,16.184-40.073c1.802-3.207,1.649-7.154-0.397-10.211
		c-2.046-3.058-5.642-4.705-9.288-4.261c-38.032,4.613-49.366,4.819-49.447,4.82c-21.283,0.19-37.297-4.144-47.925-7.003
		c-42.7-11.487-76.529-38.838-95.862-57.699c12.49-13.174,26.451-24.841,41.61-34.758c22.047-14.419,46.27-24.95,71.991-31.299
		c3.447-0.85,6.161-3.506,7.085-6.935c0.925-3.43-0.086-7.09-2.639-9.559c-0.044-0.042-0.327-0.306-0.851-0.752
		c-8.157-6.921-36.303-31.532-56.023-57.623c-15.44-20.435-23.059-38.363-29.783-54.179c-16.728-39.367-25.976-82.671-27.54-128.855
		c20.435,0.729,40.515,3.071,59.827,6.986c5.282,1.066,10.436-2.344,11.506-7.626c1.071-5.284-2.344-10.435-7.626-11.506
		C67.262,9.417,42.504,6.858,17.362,6.616c-2.599,0.027-5.142,1.003-6.995,2.858c-1.854,1.854-2.884,4.374-2.859,6.996
		c0.505,52.545,10.366,101.797,29.309,146.383c6.809,16.022,15.282,35.959,32.174,58.314c14.431,19.095,32.94,37.292,45.839,49.126
		c-21.392,6.922-41.682,16.62-60.514,28.935c-19.168,12.539-36.569,27.657-51.721,44.936c-3.335,3.804-3.213,9.526,0.286,13.183
		c19.042,19.905,58.825,55.406,111.302,69.523c10.945,2.946,29.321,7.873,53.162,7.673c0.39-0.004,8.369-0.107,33.688-2.883
		c-4.001,9.108-7.279,18.525-9.792,28.154c-3.581,13.721-5.606,27.894-6.019,42.128c-0.075,2.616,0.902,5.152,2.715,7.041
		c1.813,1.888,4.308,2.97,6.923,3.001c0.691,0.009,1.396,0.014,2.121,0.014c25.498-0.001,71.603-5.504,108.971-40.112
		c23.588-21.839,34.22-46.901,38.223-56.335c6.985-16.463,10.021-31.435,11.996-49.948l119.483,116.496
		c1.897,1.851,4.356,2.772,6.812,2.772c2.539,0,5.077-0.985,6.99-2.948c3.764-3.859,3.684-10.039-0.176-13.801L373.319,355.061z"/>
	<path style="fill:#1C2042;" d="M239.744,248.216c2.539,0,5.077-0.985,6.99-2.948c3.764-3.86,3.684-10.039-0.176-13.801l-26.832-26.162c-3.86-3.765-10.039-3.686-13.801,0.176c-3.764,3.86-3.684,10.039,0.176,13.801l26.832,26.162C234.828,247.294,237.287,248.216,239.744,248.216z"/></g></svg>`;

    if (leafQuat != null)
        leafQuat = leafQuatSlider.value;

    let leaves = Array.from({ length: leafQuat }, () => document.createElement('span'));
    leaves.forEach(leaf => {
        leaf.classList.add('leafHolder');
        leaf.innerHTML = leafSvg;
        maze.appendChild(leaf);
    });

    activeLeaves = leaves.length;

    //console.log(leafSpeedSlider);
    if (leafSpeedSlider != null)
        leafSpeed = leafSpeedSlider.value * 10;

    if (spawnSpeedSlider != null)
        spawnSpeed = spawnSpeedSlider.value * -1000;

    leafSpeedSlider.disabled = true;
    spawnSpeedSlider.disabled = true;
    leafQuatSlider.disabled = true;
    slider.disabled = true;

    let i = 0;
    function spawn() {
        if (i < leaves.length) {
            moveLeaf(leaves[i]);
            i++;
            setTimeout(spawn, spawnSpeed);
        }
    }

    spawn();

}

//generateLeaves();

let leafOffsetX = 10;
let leafOffsetY = 11;
let scaleOffset = 1;

function moveLeaf(leaf) {

    //arr = cloneArray(arr);

    console.log(leafSpeed);
    let idx = 1;

    console.log(scaleOffset);

    leaf.style.display = 'inline';
    animateLeaf();

    function animateLeaf() {
        if (idx >= arr.length - 1) {
            leaf.style.display = 'none';
            activeLeaves--;
            checkActiveLeaves();
            return;
        }


        const startX = arr[idx][0] - leafOffsetX;
        const startY = arr[idx][1] - leafOffsetY;
        const endX = arr[idx + 1][0] - leafOffsetX;
        const endY = arr[idx + 1][1] - leafOffsetY;

        // Calculate distance between points
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));

        // Calculate duration based on speed (distance / speed = time)
        const duration = distance / leafSpeed * 1000; // izracuna trajanje za premik med tockama start in end ter pretvori value v ms
        const startTime = performance.now(); //dobi zacetni cas v ms


        //Linear Interpelation
        function step(currentTime) {
            const elapsed = currentTime - startTime;
            const t = Math.min(elapsed / duration, 1); // Normalized time (0 to 1) -> progress koliko je animacija koncana -> .5 = 50%

            // Interpolation (smooth transition)
            leaf.style.left = (lerp(startX, endX, t) / scaleOffset) + 'px';
            leaf.style.top = (lerp(startY, endY, t) / scaleOffset) + 'px';

            //console.log("lerp x: " + (lerp(startX, endX, t) / scaleOffset));
            //console.log("lerp y: " + (lerp(startY, endY, t) / scaleOffset));

            if (t < 1) {
                requestAnimationFrame(step);
            } else {
                idx++;
                animateLeaf(); // ko je t = 1 oz je pot opravljena 100% gre na naslednjo tocko
            }
        }
        requestAnimationFrame(step);
    }
}

function checkActiveLeaves() {
    if (activeLeaves == 0) {
        destroyLeaves();
        startButton.disabled = false;
        startLeaf.disabled = false;
        leafSpeedSlider.disabled = false;
        spawnSpeedSlider.disabled = false;
        leafQuatSlider.disabled = false;
        slider.disabled = false;
    }
}

function destroyLeaves(){
    let leaves = document.querySelectorAll(".leafHolder");
    leaves.forEach(leaf =>{
        leaf.remove();
    })
}

body.onload = initPositions();

window.matchMedia("(max-width: 991px)")

window.matchMedia("(max-width:990px)").addEventListener("change", (e) => {
    if (e.matches) {
        leafOffsetX = 10;
        leafOffsetY = 19;
        scaleOffset = 2;
    }
    else {
        leafOffsetX = 10;
        leafOffsetY = 11;
        scaleOffset = 1;
    }
});

window.matchMedia("(max-width:600px)").addEventListener("change", (e) => {
    if (e.matches) {
        if (document.querySelector('.sideLeft').classList.contains('active')) { }
        document.querySelector('.sideLeft').classList.remove('active');
        document.querySelector('.showMenu').classList.add('active');
    } else {
        if (!document.querySelector('.sideLeft').classList.contains('active')) {
            document.querySelector('.sideLeft').classList.toggle('active');
        }

        document.querySelector('.showMenu').classList.remove('active');
    }

});

window.matchMedia("(max-width:500px)").addEventListener("change", (e) => {
    if (e.matches) {
        leafOffsetX = 10;
        leafOffsetY = 47;
        scaleOffset = 4;
    } else {
        leafOffsetX = 10;
        leafOffsetY = 19;
        scaleOffset = 2;
    }
})

function initPositions() {
    let width = body.clientWidth;
    if (width <= 500) {
        leafOffsetX = 10;
        leafOffsetY = 47;
        scaleOffset = 4;
        return;
    }
    if (width <= 600)
        document.querySelector('.showMenu').classList.add('active');
    if (width <= 930)
        //document.querySelector('.sideRight').remove();
        //console.log(width);
        if (width <= 990) {
            leafOffsetX = 10;
            leafOffsetY = 19;
            scaleOffset = 2;
        }
}

//sideMenuOpeining

let openButton = document.querySelector('.showMenu');
let sideMenu = document.querySelector('.sideLeft');

openButton.addEventListener('click', () => {
    sideMenu.classList.toggle('active');
    openButton.classList.toggle('open');
});

//buttons logic

function toggleSubMenu(button) {
    button.nextElementSibling.classList.toggle('active');
    button.classList.toggle('rotate');
}


/*
const sliders = [document.querySelector('.leavesNo'), document.querySelector('.spawnSpeedAdjust')];
const tags = document.querySelectorAll('.toolTip');

sliders.forEach(slider =>{
    updateThumb(slider);
    slider.addEventListener("input", () => updateThumb(slider))
});

function updateThumb(slider){
    let sliderRect = slider.getBoundingClientRect();
    let thumbWidth = getThumbWidth();
    //let pos = (slider.value / slider.max)  * sliderRect.width;
    let pos = ((slider.value - slider.min) / (slider.max - slider.min)) * sliderRect.width;

        let tag = slider.parentElement.children[1];
        
        if(slider.classList.contains("spawnSpeedAdjust")){
            tag.innerHTML = slider.value * 1000 + "ms";
            tag.style. width = '3.2rem';
        }   
        else
           tag.innerHTML = slider.value;

        tag.style.left = `${pos - thumbWidth / 2}px`;
}

function getThumbWidth(){
    let rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return 1.1*rootFontSize;
}
*/

function cloneArray(array){
    arr1 = [];

    for(let i = 0; i < array.length; i++){
        arr1[0] =[];
        for(let j = 0; j < array[i].length; j++){
            arr1[i][j] = array[i][j];
        }
    }
    return arr1;
}
