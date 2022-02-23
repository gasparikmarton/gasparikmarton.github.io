import { FontLoader } from './lib/FontLoader.js';
import { VertexNormalsHelper } from './lib/VertexNormalsHelper.js';
import { TextGeometry } from './lib/TextGeometry.js';
import { Vector3 } from './lib/three.module.js';

// SETUP
let camera, scene, pointLight, renderer, stats;
let fov, dist;
let perspWidth, perspHeight;
let pointer = new THREE.Vector2();
let clock = new THREE.Clock;

// BOXES
let framingSize = 50;
let rowSize = 30;
let rectWidth = 0;
let columnSize = 0;

let buffTest;
let boxes;
let numOfBoxes;

// INTERSECTION
let raycaster;
let INTERSECTED;
let intersected_id;


// UPDATE
function updateBoxes() { };



init();
animate();

function init() {

    // SCENE
    scene = new THREE.Scene();
    // 

    // CAM
    fov = 60;
    dist = 300;

    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = dist;


    var vFOV = THREE.MathUtils.degToRad(fov); // convert vertical fov to radians
    perspHeight = 2 * Math.tan(vFOV / 2) * dist; // visible height
    perspWidth = perspHeight * camera.aspect;           // visible width
    // 

    //LIGHT
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    pointLight = new THREE.PointLight(0xc9efff, 0.5);

    pointLight.castShadow = true;
    pointLight.shadow.mapSize.width = 512;
    pointLight.shadow.mapSize.height = 512;
    pointLight.shadow.camera.near = 0.5;
    pointLight.shadow.camera.far = 600;
    scene.add(pointLight, ambientLight);

    const sphereSize = 1;
    const pointLightHelper = new THREE.PointLightHelper(pointLight, sphereSize);
    scene.add(pointLightHelper);
    // 

    const size = 1000;
    const divisions = 10;




    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor("#000000");
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setSize(192 * 5, 108 * 5);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // 



    let colors = [0xFF0000, 0xFFFF00, 0x0000FF, 0xFFFFFF];


    function planar() {
        let mininmumScale = 40;
        let scale = 126;
        let boxPositions = [];
        let boxScales = [];
        let boxColors = [];
        let color;


        for (let posY = Math.floor(perspHeight / 2); posY >= -perspHeight / 2 + columnSize / 2; posY -= columnSize) {
            columnSize = Math.ceil(Math.random() * scale / 10) * 20 + mininmumScale;
            if (posY - columnSize < -perspHeight / 2) {
                columnSize = -1 * (-perspHeight / 2 + posY)
            }

            for (let posX = Math.floor(0 - perspWidth / 2); posX <= perspWidth / 2 - rectWidth / 2; posX += rectWidth) {
                // console.log("cS", columnSize);

                rectWidth = Math.ceil(Math.random() * scale / 10) * 20 + mininmumScale;

                boxColors.push(colors[Math.floor(Math.random() * colors.length)]);

                boxPositions.push(new THREE.Vector3(posX + rectWidth / 2, posY - columnSize / 2, 0));
                boxScales.push(new THREE.Vector3(rectWidth * 0.99, columnSize * 0.99, 50));
                // boxScales.push(new THREE.Vector3(1, 1, 1));
            }

        }
        numOfBoxes = boxPositions.length;
        // GEO
        buffTest = new THREE.BufferGeometry();

        let x = 0.5;
        let y = 0.5;
        let z = 0.5;


        const vertices = new Float32Array([
            // back
            -x, -y, -z,
            x, -y, -z,
            x, y, -z,

            x, y, -z,
            -x, y, -z,
            -x, -y, -z,

            // left
            -x, y, z,
            -x, -y, -z,
            -x, y, -z,

            -x, y, z,
            -x, -y, z,
            -x, -y, -z,


            // right
            x, -y, -z,
            x, -y, z,
            x, y, z,

            x, -y, -z,
            x, y, z,
            x, y, -z,

            // top
            -x, y, -z,
            x, y, -z,
            x, y, z,

            -x, y, -z,
            x, y, z,
            -x, y, z,

            // bottom
            -x, -y, -z,
            -x, -y, z,
            x, -y, z,

            x, -y, -z,
            -x, -y, -z,
            x, -y, z,



        ]);
        buffTest.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        const box = new THREE.BoxGeometry(1, 1, 1);


        // MESH
        boxes = new Array(numOfBoxes)
            .fill(null)
            .map(() => new THREE.Mesh(buffTest, new THREE.MeshLambertMaterial({})));

        boxes.forEach((x, i) => {
            x.castShadow = true;
            x.receiveShadow = true;

            x.material.color.set(boxColors[i]);

            x.box_id = i

            scene.add(x);

            x.position.set(boxPositions[i].x, boxPositions[i].y, boxPositions[i].z);
            x.scale.set(boxScales[i].x, boxScales[i].y, boxScales[i].z);

            x.geometry.computeVertexNormals();
            x.geometry.normalizeNormals();

            let vnh = new VertexNormalsHelper(x, 50);
            scene.add(vnh);

        });


        // updateBoxes = (t) => { boxes.forEach((x, i) => { x.rotation.y = t * (Math.PI / 2) }) }

        // console.log("posX=" + posX);
        // console.log("rectWidth=" + rectWidth);
        // console.log("boxPos=", boxPositions);
        // console.log("boxScale=", boxScales);
        // console.log("boxColors", boxColors);


        // console.log("boxes=", boxes)
        buffTest.computeVertexNormals();


        raycaster = new THREE.Raycaster();

    };


    planar();


    function spherer(x, y) {
        const geometry = new THREE.SphereGeometry(6, 32, 6);
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);
        sphere.position.set(x, y, 20);
    }
    spherer(0, 0);
    spherer(-perspWidth / 2, perspHeight / 2)

    animate();



    // Append Renderer to DOM
    window.addEventListener('resize', onWindowResize);
    document.body.appendChild(renderer.domElement);
    document.addEventListener('pointermove', onPointerMove);

};








function animate() {

    requestAnimationFrame(animate);

    raycaster.setFromCamera(pointer, camera);

    const intersects = raycaster.intersectObjects(boxes, false);

    if (intersects.length > 0) {
        // intersects[0].object.material.emissive.setHex(0xff0000);

        if (INTERSECTED != intersects[0].object) {

            if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            INTERSECTED.material.emissive.setHex(0xff0000);

            // console.log("inter=", intersects.length)

        }
    } else {


        if (INTERSECTED) {
            INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

            INTERSECTED = null;

        }

    };

    if (INTERSECTED) {
        intersected_id = INTERSECTED.box_id
    } else {
        intersected_id = null
    }

    console.log(intersected_id)

    render();

};












// Render Loop
function render() {
    // pointLight.position.set(pointer.x, pointer.y, 0);





    // Render the scene
    renderer.render(scene, camera);
};

// render();


function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    pointLight.position.set(pointer.x * perspWidth / 2, pointer.y * perspHeight / 2, 50);
}



function loadFont() {

    const loader = new FontLoader();
    loader.load('fonts/' + fontName + '_' + fontWeight + '.typeface.json', function (response) {

        font = response;

        refreshText();

    });

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}
