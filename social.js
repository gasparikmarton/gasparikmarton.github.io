import { FontLoader } from './lib/FontLoader.js';
import { VertexNormalsHelper } from './lib/VertexNormalsHelper.js';
import { TextGeometry } from './lib/TextGeometry.js';
import { Vector3 } from './lib/three.module.js';
// import { MathUtils } from './lib/MathUtils';

// SETUP
let camera, scene, pointLightActive, renderer, stats;
let fov, dist;
let perspWidth, perspHeight;
let pointer = new THREE.Vector2();
let clock = new THREE.Clock({ autoStart: false });
let camPos;


// BOXES
let framingSize = 50;
let rowSize = 30;
let rectWidth = 0;
let columnSize = 0;

let boxPositions = [];
let boxScales = [];


let buffTest;
let boxes;
let numOfBoxes;

// INTERSECTION
// let raycaster;
let INTERSECTED;
let intersected_id;


// UPDATE
function updateBoxes() { };
function updateTexts() { };


// TEXT
let textGeo;
let font;
let boxTexts = [];
let text;
let pages = ['Facebook', 'Behance'];
let links = [{
    URL: "https://www.facebook.com/vizupal"
}, {
    URL: "https://www.behance.net/gasparikmad173"
}, {
    URL: "events.html"
}];

let textBB = [];

init();
// animate();

function init() {

    // SCENE
    scene = new THREE.Scene();
    // 

    // CAM
    fov = 60;
    dist = 300;
    camPos = new THREE.Vector3(0, 0, dist);

    camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = dist;


    var vFOV = THREE.MathUtils.degToRad(fov); // convert vertical fov to radians
    perspHeight = 2 * Math.tan(vFOV / 2) * dist; // visible height
    perspWidth = perspHeight * camera.aspect;           // visible width
    // 

    //LIGHT
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.1);


    let pointLightStatic = new THREE.PointLight('#ffffff', 1, 1000);

    pointLightStatic.position.set(0, 0, 150);
    pointLightStatic.power = 4;

    pointLightStatic.castShadow = false;
    pointLightStatic.shadow.mapSize.width = 1024;
    pointLightStatic.shadow.mapSize.height = 1024;
    pointLightStatic.shadow.camera.near = 0.5;
    pointLightStatic.shadow.camera.far = 600;



    pointLightActive = new THREE.SpotLight(0xff0000, 0.5, 1000, Math.PI / 4, 0.5);

    pointLightActive.target.position.set(pointLightActive.position.x, pointLightActive.position.y, 0);

    pointLightActive.castShadow = true;
    pointLightActive.shadow.mapSize.width = 1024;
    pointLightActive.shadow.mapSize.height = 1024;
    pointLightActive.shadow.camera.near = 0.5;
    pointLightActive.shadow.camera.far = 600;


    scene.add(pointLightActive, pointLightActive.target, ambientLight, pointLightStatic);

    // const sphereSize = 1;
    // const pointLightActiveHelper = new THREE.PointLightHelper(pointLightActive, sphereSize);
    // scene.add(pointLightActiveHelper);
    // 


    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setClearColor("#000000");
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setSize(192 * 5, 108 * 5);

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // 



    let colors = [/*'	#000000', '#7b7d7b', '#969696', '#bfbfbf',*/ '#ffffff'];


    function planar() {
        let mininmumScale = perspWidth / 5;
        let scale = perspWidth / 4;
        let boxColors = [];
        let distFromEdge = 50;
        let color;
        let boxCount = 2;


        for (let posX = Math.floor(0 - perspWidth / 2) + distFromEdge; posX <= perspWidth / 2 - rectWidth - distFromEdge; posX += rectWidth) {
            rectWidth = perspWidth / 2 - distFromEdge;
            boxColors.push(colors[Math.floor(Math.random() * colors.length)]);

            boxPositions.push(new THREE.Vector3(posX + rectWidth / 2, 0, 0));
            boxScales.push(new THREE.Vector3(rectWidth * 0.99, rectWidth, 20));
            // boxScales.push(new THREE.Vector3(1, 1, 1));
        }


        console.log(perspWidth / 2)
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
            .map(() => new THREE.Mesh(buffTest, new THREE.MeshPhongMaterial({})));

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

            x.userData = links[i];

            // let vnh = new VertexNormalsHelper(x, 50);
            // scene.add(vnh);

        });
        buffTest.computeVertexNormals();



        // console.log("objects=", boxes)
    };



    // TEXT

    updateTexts = (t) => {
        const loader = new FontLoader();
        loader.load('./lib/fonts/helvetiker_regular.typeface.json', function (font) {



            boxTexts = new Array(numOfBoxes)
                .fill(null)
                .map((x, i) => new THREE.Mesh(new TextGeometry(pages[i], {
                    font: font,
                    size: 1,
                    height: 1,
                    curveSegments: 12,
                    // bevelEnabled: true,
                    // bevelThickness: 0.05,
                    // bevelSize: 0.05,
                    // bevelOffset: 0,
                    // bevelSegments: 6
                }),
                    new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: false, opacity: 0, transparent: true })))


            boxTexts.forEach((x, i) => {

                text = pages[i];

                x.geometry.center();

                x.castShadow = true;
                x.receiveShadow = true;

                scene.add(x);

                x.geometry.computeBoundingBox();


                x.scale.set(boxScales[i].x / 10, boxScales[i].y / 10, boxScales[i].z / 10);
                x.position.set(boxPositions[i].x, boxPositions[i].y, boxPositions[i].z + 10);



            })




        });
    }
    updateTexts();

    planar();



    // function spherer(x, y) {
    //     const geometry = new THREE.SphereGeometry(6, 32, 6);
    //     const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    //     const sphere = new THREE.Mesh(geometry, material);
    //     scene.add(sphere);
    //     sphere.position.set(x, y, 20);


    // }
    // spherer(0, 0);
    // spherer(-perspWidth / 2, perspHeight / 2)



    // Append Renderer to DOM
    window.addEventListener('resize', onWindowResize);
    document.body.appendChild(renderer.domElement);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('mousedown', onDocumentMouseDown);

    // animate();

};

animate();




function animate() {



    requestAnimationFrame(animate);
    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(pointer, camera);

    // BOX INTERSEX
    const intersects = raycaster.intersectObjects((boxes), false);

    if (intersects.length > 0) {


        if ((INTERSECTED != intersects[0].object)) {

            if (INTERSECTED && boxTexts[INTERSECTED.box_id]) {
                INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
                INTERSECTED.position.z = 0;
                boxTexts[INTERSECTED.box_id].position.z = 0;
                boxTexts[INTERSECTED.box_id].rotation.z = 0;

            }
            INTERSECTED = intersects[0].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex(0xFFFFFF);


            if (boxTexts[INTERSECTED.box_id]) {
                INTERSECTED.position.z = 0;
                boxTexts[INTERSECTED.box_id].position.z = + Math.sin(clock.getElapsedTime() * 0.5) * 9;
                boxTexts[INTERSECTED.box_id].rotation.z = + Math.sin(clock.getElapsedTime() * 0.6) * 0.1;

            }
        }

    } else {


        if (INTERSECTED && boxTexts[INTERSECTED.box_id]) {
            INTERSECTED.material.color.setHex(INTERSECTED.currentHex);

            INTERSECTED.position.z = 0;
            boxTexts[INTERSECTED.box_id].position.z = 0;
            boxTexts[INTERSECTED.box_id].rotation.z = 0;


            INTERSECTED = null;


        }
    }





    // console.log(clock.running)



    if (INTERSECTED) {
        intersected_id = INTERSECTED.box_id
    } else {
        intersected_id = null
    }






    render();

};

// Render Loop
function render() {
    // pointLightActive.position.set(pointer.x, pointer.y, 0);





    // Render the scene
    renderer.render(scene, camera);
};

// render();


function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    pointLightActive.position.set(pointer.x * perspWidth / 2, pointer.y * perspHeight / 2, dist / 4);
    // pointLightActive.position.set(0, 0, dist / 4);
    pointLightActive.target.position.set(pointer.x * perspWidth / 2, pointer.y * perspHeight / 2, 0);
};


function onDocumentMouseDown(event) {
    event.preventDefault();


    if (intersected_id !== null) {
        window.open(boxes[intersected_id].userData.URL)
    }

}


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

