import { FontLoader } from './lib/FontLoader.js';
import { VertexNormalsHelper } from './lib/VertexNormalsHelper.js';
import { TextGeometry } from './lib/TextGeometry.js';
import { Vector3 } from './lib/three.module.js';

// SETUP
let camera, scene, pointLightActive, renderer, stats;
let fov, dist;
let perspWidth, perspHeight;
let pointer = new THREE.Vector2();
let clock = new THREE.Clock;

let buffTest;
let boxes;
let numOfBoxes;

// INTERSECTION
// let raycaster;
let INTERSECTED;
let intersected_id;


// UPDATE
function updateTexts() { };


// TEXT
let boxTexts;


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
    var ambientLight = new THREE.AmbientLight(0xffffff, 0);


    let pointLightStatic = new THREE.PointLight(0x0000FF, 1, 1000);

    pointLightStatic.position.set(0, 0, 150);
    pointLightStatic.power = 4;

    pointLightStatic.castShadow = false;
    pointLightStatic.shadow.mapSize.width = 1024;
    pointLightStatic.shadow.mapSize.height = 1024;
    pointLightStatic.shadow.camera.near = 0.5;
    pointLightStatic.shadow.camera.far = 6000;



    pointLightActive = new THREE.PointLight(0xFF0000, 0.5);

    pointLightActive.castShadow = true;
    pointLightActive.shadow.mapSize.width = 1024;
    pointLightActive.shadow.mapSize.height = 1024;
    pointLightActive.shadow.camera.near = 0.5;
    pointLightActive.shadow.camera.far = 6000;


    scene.add(pointLightActive, pointLightStatic);

    const sphereSize = 1;
    const pointLightActiveHelper = new THREE.PointLightHelper(pointLightActive, sphereSize);
    scene.add(pointLightActiveHelper);
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


    function planar() {


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

        buffTest.computeVertexNormals();

        // const box = new THREE.BoxGeometry(1, 1, 1);
        const boxMesh = new THREE.Mesh(buffTest, new THREE.MeshPhongMaterial({ color: 0xFF0000 }));

        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;

        scene.add(boxMesh)

        boxMesh.scale.set(perspWidth, perspHeight, 300);

        console.log("objects=", boxes)
    };



    // TEXT

    updateTexts = (t) => {
        const loader = new FontLoader();
        loader.load('./lib/fonts/helvetiker_regular.typeface.json', function (font) {



            boxTexts = new THREE.Mesh(new TextGeometry('                    PAL\nis a one-member visual duo\n      established in 2016\n   working in the fields of \n      Projection Mapping, \n             New Media \n         and 3D Graphics ', {
                font: font,
                size: perspWidth / 180,
                height: 0.1,
                curveSegments: 12,
                bevelEnabled: true,
                bevelThickness: 0.1,
                bevelSize: 0.05,
                bevelOffset: 0,
                bevelSegments: 5
            }),
                new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 200, alpha: 0, opacity: 0 }));

            boxTexts.scale.set(10, 10, 10);
            boxTexts.position.set(0, 0, -60);
            boxTexts.geometry.center();

            boxTexts.castShadow = true;
            boxTexts.receiveShadow = true;

            boxTexts.material.transparent = true;

            scene.add(boxTexts);


        })




    };

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

};








function animate() {

    requestAnimationFrame(animate);

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

    pointLightActive.position.set(pointer.x * perspWidth / 2, pointer.y * perspHeight / 2, dist / 8);
};


function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}