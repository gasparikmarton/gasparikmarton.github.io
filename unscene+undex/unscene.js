import { GLTFLoader } from '../lib/GLTFLoader.js';
import { OBJLoader } from '../lib/OBJLoader.js';
import { GUI } from '../lib/lil-gui.module.min.js';
import { RenderPass } from '../lib/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../lib/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from '../lib/postprocessing/EffectComposer.js';

let scene, renderer, camera, composer, clock, parties;



// GLOBAL
var myRadius = 66;

// TIME
clock = new THREE.Clock();
clock.autoStart = false;
let elapsedTime = clock.getElapsedTime();

// FUNCTIONS
function updateAirPlane() { };
function updateBoxHanger() { };
// function partySize() { };
function updateCamera() { };
function updateCamera2() { };
function updateCamera2v2() { };
function updateCamera3() { };
function updateFlashLight() { };
function sphereUpdate() { };
function kicker() { };

function addTrail() { };
function addStarLines() { };
function addBox() { };
function changeView() { };
function changeViewDynamic() { };
function changeView2() { };
function addBloom() { };

function clockStarter() { };
//




// PARTICLEE Variables
let group;
let container, stats;
const particlesData = [];
let positions, colors;
let particles;
let pointCloud;
let particlePositions;
let linesMesh;

const maxParticleCount = 1000;
var particleCount = 10;
const r = 2000;
const rHalf = r / 2;


const effectController = {
    youHaveLostControl: true,
    showDots: true,
    showLines: true,
    minDistance: 10,
    limitConnections: false,
    maxConnections: 200,
    particleCount: 10
};
//

// After Effects
let params = {
    exposure: 0.6,
    bloomStrength: 2,
    bloomThreshold: 0,
    bloomRadius: 0.1
};

// AUDIO
let audio;
let fftSize = 512;
let analyser;

const frequencyRange = {
    kick: [0, 10],
    bass: [42, 100],
    lowMid: [100, 400],
    mid: [400, 2600],
    highMid: [2600, 5200],
    treble: [5200, 14000],
};
// 

// START BUTTON
const startButton = document.getElementById('startButton');
startButton.addEventListener('click', init);


// GUI
function initGUI() {

    const gui = new GUI();

    gui.add(effectController, 'youHaveLostControl').onChange(function (value) {

    });

};


function init() {

    initGUI();

    // Create scene
    scene = new THREE.Scene();
    // scene.fog = new THREE.FogExp2(scene.background, 0.00025);
    //
    //
    //
    //Camera Setup
    let fov = 70;
    camera = new THREE.PerspectiveCamera(
        fov,
        window.innerWidth / window.innerHeight,
        0.001,
        40000
    );

    // CAMERA Animation
    updateCamera = (t) => {
        let camRotPosY = Math.cos(t);
        let camRotPosZ = Math.sin(t);

        let camLookAtY = Math.cos(t + 0.65);
        let camLookAtZ = Math.sin(t + 0.65);

        camera.position.y = camRotPosY * myRadius / 100;
        camera.position.z = camRotPosZ * myRadius / 100;
        camera.fov = 120;
        camera.updateProjectionMatrix();
        camera.position.x = 0;
        camera.up = (new THREE.Vector3(0, -camRotPosY, camRotPosZ));
        camera.lookAt(new THREE.Vector3(0, camLookAtY * myRadius, -camLookAtZ * myRadius));
    };

    updateCamera2 = (t) => {
        let camRotPosY = Math.cos(t - 1);
        let camRotPosZ = Math.sin(t - 1);

        let camLookAtY = Math.cos(t + 1);
        let camLookAtZ = Math.sin(t + 1);

        camera.position.y = camRotPosY * myRadius * 2;
        camera.position.z = camRotPosZ * myRadius * -2;
        // camera.position.x = Math.cos(t) * 40;
        camera.up = (new THREE.Vector3(0, -camRotPosY, camRotPosZ));
        camera.lookAt(new THREE.Vector3(0, camLookAtY * myRadius, -camLookAtZ * myRadius));
    };

    updateCamera2v2 = (t) => {
        let camRotPosY = Math.cos(t - 1);
        let camRotPosZ = Math.sin(t - 1);

        let camLookAtY = Math.cos(t + 1);
        let camLookAtZ = Math.sin(t + 1);

        camera.position.y = camRotPosY * myRadius * 2 + Math.cos(t) * 10;
        camera.position.z = camRotPosZ * myRadius * -2;
        camera.position.x = Math.cos(t) * 40;
        camera.up = (new THREE.Vector3(0, -camRotPosY, camRotPosZ));
        camera.lookAt(new THREE.Vector3(0, camLookAtY * myRadius, -camLookAtZ * myRadius));
    };

    updateCamera3 = (t) => {
        let camRotPosY = Math.cos(t);
        let camRotPosZ = Math.sin(t);

        let camLookAtY = Math.cos(t);
        let camLookAtZ = Math.sin(t);

        camera.position.y = camRotPosY * myRadius * 2 + Math.cos(t) * 10;
        camera.position.z = camRotPosZ * myRadius;
        camera.position.x = 100;
        camera.up = (new THREE.Vector3(0, -camRotPosY, camRotPosZ));
        camera.lookAt(new THREE.Vector3(0, camLookAtY * myRadius, -camLookAtZ * myRadius));
    };

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    addBloom();
    //Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.body.appendChild(renderer.domElement);
    renderer.outputEncoding = THREE.sRGBEncoding;
    //
    //
    //
    //Light Setup
    const midLight = new THREE.PointLight("#931BE6", 1, 306);

    midLight.castShadow = true;
    midLight.shadow.mapSize.width = 512;
    midLight.shadow.mapSize.height = 512;
    midLight.shadow.camera.near = 0.5;
    midLight.shadow.camera.far = 600;
    midLight.position.set(0, 0, 0);


    scene.add(midLight);



    const flashLight = new THREE.SpotLight("#0218EF");
    flashLight.castShadow = true;


    flashLight.castShadow = true;
    flashLight.shadow.mapSize.width = 1024;
    flashLight.shadow.mapSize.height = 1024;
    flashLight.shadow.camera.near = 500;
    flashLight.shadow.camera.far = 4000;
    flashLight.shadow.camera.fov = 30;
    flashLight.power = 10;
    flashLight.angle = Math.PI / 2;
    flashLight.distance = 100;
    scene.add(flashLight);
    scene.add(flashLight.target);


    updateFlashLight = (t) => {
        flashLight.target.position.y = Math.cos(t + 1.4) * myRadius * 1;
        flashLight.target.position.z = Math.sin(t + 1.4) * -myRadius * 1;
        flashLight.position.y = Math.cos(t + 1) * myRadius * 0.9;
        flashLight.position.z = Math.sin(t + 1) * -myRadius * 0.9;
    };


    const ambLight = new THREE.AmbientLight(0xff0000, 1);
    scene.add(ambLight);

    // BLOOM
    const renderScene = new RenderPass(scene, camera);

    let bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;


    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);




    // Audio listener
    const audioListener = new THREE.AudioListener();
    audio = new THREE.Audio(audioListener);

    const audioLoader = new THREE.AudioLoader();
    // Load audio file inside asset folder
    audioLoader.load('../assets/trek.mp3', (buffer) => {
        audio.setBuffer(buffer);
        audio.setLoop(false);
        audio.play();  // Start playback
    });


    // About fftSize https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize
    analyser = new THREE.AudioAnalyser(audio, fftSize);


    const data = analyser.getFrequencyData();


    for (let i = 0, len = data.length; i < len; i++) {
        // access to magnitude of each frequency with data[i].
    }

    // ASSETS

    // AirPlane
    let airPlane;

    const loader = new GLTFLoader().setPath('../assets/');
    loader.load('airPlane2.gltf', function (gltf) {
        airPlane = gltf.scene;
        airPlane.rotateY(Math.PI / 2);
        airPlane.traverse(function (child) { child.castShadow = true; });

        airPlane.castShadow = true; //default is false
        airPlane.receiveShadow = true; //default
        scene.add(airPlane);

        // ASSETS Animation
        updateAirPlane = (t) => {
            // ASSETS Animation

            airPlane.rotation.order = 'ZXY';
            airPlane.rotation.x = -t + (Math.PI / 2) + 0.8;
            airPlane.rotation.z = (Math.cos(t) * 0.001 - 0.1);

            let airPlanePositionY = Math.cos(t + 1);
            let airPlanePositionZ = Math.sin(t + 1);

            airPlane.position.y = airPlanePositionY * myRadius * 0.8;
            airPlane.position.z = airPlanePositionZ * myRadius * -0.8;
        };
    });





    // TUNNEL
    let instanceNumber = 4000;
    var ringSize = 40;
    let detail = 1;
    const boxHangerGeo = new THREE.OctahedronGeometry(ringSize, detail);
    const boxHangerMat = new THREE.MeshPhongMaterial({ color: "#6EB0CA", shininess: 1 });
    // const boxHanger = new THREE.Mesh(boxHangerGeo, boxHangerMat);

    let boxHanger = new Array(instanceNumber)
        .fill(null)
        .map(() => new THREE.Mesh(boxHangerGeo, boxHangerMat));

    boxHanger.forEach((x) => scene.add(x));

    updateBoxHanger = (t) => {
        boxHanger.forEach((x, i) => {
            x.receiveShadow = true;
            x.castShadow = true;
            x.position.y = Math.tanh(1 + i * 10) * myRadius * 30;
            x.position.z = Math.tan(i) * myRadius * 20;
            x.position.x = (i + 40) * 40;

        })
    };




    // RING?
    const ringBahn = new THREE.CylinderGeometry(myRadius * 1.5, myRadius * 1.5, myRadius * 1.5, 12);
    const ringMaterial = new THREE.MeshPhongMaterial({
        color: "#6EB0CA", shininess: 10
    });
    ringMaterial.side = THREE.BackSide
    const cylinder = new THREE.Mesh(ringBahn, ringMaterial);

    cylinder.rotation.z = Math.PI / 2;

    cylinder.receiveShadow = true;
    cylinder.castShadow = true;
    // Add cube to Scene
   //  scene.add(cylinder);



    // PARTICLE System 2

    group = new THREE.Group();
    scene.add(group);

    // const helper = new THREE.BoxHelper(new THREE.Mesh(new THREE.BoxGeometry(r, r, r)));
    // helper.material.color.setHex(0x101010);
    // helper.material.blending = THREE.AdditiveBlending;
    // helper.material.transparent = true;
    // group.add(helper);

    const segments = maxParticleCount * maxParticleCount;

    positions = new Float32Array(segments * 3);
    colors = new Float32Array(segments * 3);

    const pMaterial = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 2,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: false
    });

    particles = new THREE.BufferGeometry();
    particlePositions = new Float32Array(maxParticleCount * 3);

    for (let i = 0; i < maxParticleCount; i++) {

        const x = Math.random() * r - r / 2;
        const y = Math.random() * r - r / 2;
        const z = Math.random() * r - r / 2;

        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;

        // add it to the geometry
        particlesData.push({
            velocity: new THREE.Vector3(- 0.01 + Math.random() * 0.02, - 0.01 + Math.random() * 0.02, - 0.01 + Math.random() * 0.02),
            numConnections: 0
        });

    }

    // particles.setDrawRange(0, particleCount);
    particles.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage));

    // create the particle system
    pointCloud = new THREE.Points(particles, pMaterial);
    group.add(pointCloud);

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage));

    geometry.computeBoundingSphere();

    geometry.setDrawRange(0, 0);

    const material = new THREE.LineBasicMaterial({
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        linewidth: 3,
        transparent: true
    });

    linesMesh = new THREE.LineSegments(geometry, material);
    // group.add(linesMesh);





    // // create  chemTrail:
    parties = [];

    var addDemo = (system, offset) => {
        system.particleSystem.position.x = offset + 50 - (Math.cos(clock.getElapsedTime()) * 0.001 + 0.1);
        parties.push(system);
    }

    var addDemo2 = (system, offset) => {
        system.particleSystem.position.x = -offset - 50 - (Math.cos(clock.getElapsedTime()) * 0.001 + 0.1);
        parties.push(system);
    }
    var globalScale = 200;


    // texture
    var texture = new THREE.TextureLoader().load('../assets/smokeD.png');



    let camPosY = Math.cos(clock.getElapsedTime() - 1) * 66 * 2;


    addDemo(new Partykals.ParticlesSystem({
        container: scene,
        particles: {
            startAlpha: 1,
            endAlpha: 0,
            startSize: 3.5,
            endSize: 35,
            // acceleration: (10, 0, 0),
            gravity: 0,
            ttl: 8,
            // velocity: new Partykals.Randomizers.SphereRandomizer(0.1),
            // velocityBonus: new THREE.Vector3(0, 0, 0),
            colorize: true,
            alphaTest: 0.1,
            startColor: new Partykals.Randomizers.ColorsRandomizer(new THREE.Color(0.5, 0.5, 0.2), new THREE.Color(1, 0.5, 1)),
            endColor: new THREE.Color(0, 0, 0),
            blending: "blend",
            rotationSpeed: new Partykals.Randomizers.MinMaxRandomizer(-1, 1),
            worldPosition: true,
            texture: texture,
            onUpdate: (i) => {
                i.velocity = new THREE.Vector3(-1.2, Math.cos((clock.getElapsedTime() * 0.3)) * 2,
                    Math.sin((clock.getElapsedTime() * -0.3)) * 2)
            }
        },
        system: {
            particlesCount: 300,
            scale: globalScale,
            emitters: new Partykals.Emitter({
                onInterval: new Partykals.Randomizers.MinMaxRandomizer(0, 5),
                interval: new Partykals.Randomizers.MinMaxRandomizer(0, 0.25),
            }),
            depthWrite: true,
            speed: 1,
            onUpdate: (system) => {
                system.startX = system.startX || system.particleSystem.position.x;
                system.particleSystem.rotation.order = 'ZXY';
                system.particleSystem.position.y = Math.cos(clock.getElapsedTime() * 0.3 + 0.9) * myRadius * 0.95;
                system.particleSystem.position.z = Math.sin(clock.getElapsedTime() * 0.3 + 0.9) * myRadius * -0.95;
            },
        }


    }), 1);

    addDemo2(new Partykals.ParticlesSystem({
        container: scene,
        particles: {
            startAlpha: 1,
            endAlpha: 0,
            startSize: 3.5,
            endSize: 35,
            // acceleration: (10, 1, 10),
            gravity: 0,
            ttl: 8,
            velocity: new Partykals.Randomizers.SphereRandomizer(0.1),
            rotation: 1,
            // velocityBonus: new THREE.Vector3(1, 0, 0),
            colorize: true,
            startColor: new Partykals.Randomizers.ColorsRandomizer(new THREE.Color(0.5, 0.5, 0.5), new THREE.Color(1, 1, 1)),
            endColor: new THREE.Color(0, 0, 0),
            blending: "blend",
            rotationSpeed: new Partykals.Randomizers.MinMaxRandomizer(-1, 1),
            worldPosition: true,
            texture: texture,
            onUpdate: (i) => {
                i.velocity = new THREE.Vector3(1.2, Math.cos((clock.getElapsedTime() * 0.3)) * 2,
                    Math.sin((clock.getElapsedTime() * -0.3)) * 2);


            }
        },
        system: {
            particlesCount: 300,
            scale: globalScale,
            emitters: new Partykals.Emitter({
                onInterval: new Partykals.Randomizers.MinMaxRandomizer(0, 5),
                interval: new Partykals.Randomizers.MinMaxRandomizer(0, 0.25),
            }),
            depthWrite: true,
            speed: 1,
            onUpdate: (system) => {
                system.startX = system.startX || system.particleSystem.position.x;
                system.particleSystem.rotation.order = 'ZXY';
                system.particleSystem.position.y = Math.cos(clock.getElapsedTime() * 0.3 + 0.9) * myRadius * 0.98;
                system.particleSystem.position.z = Math.sin(clock.getElapsedTime() * 0.3 + 0.9) * myRadius * -0.98;
            },
        }


    }), 1);


    // clockStarter();

    animate();
}

function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);

}



//Animation Setup

function animate() {

    // AUDIO
    let k, l, m, h;
    if (analyser) {
        // analyser.getFrequencyData() would be an array with a size of half of fftSize.
        const data = analyser.getFrequencyData();

        const kick = getFrequencyRangeValue(data, frequencyRange.kick);
        const bass = getFrequencyRangeValue(data, frequencyRange.bass);
        const mid = getFrequencyRangeValue(data, frequencyRange.mid);
        const treble = getFrequencyRangeValue(data, frequencyRange.treble);

        // kick, low, mid, high
        k = kick;
        l = bass;
        m = mid;
        h = treble;
    }

    clockStarter = () => {
        if (audio.isPlaying) {
            clock.autoStart = true;
        }
    }
    clockStarter();

    console.log("isRunning" + clock.running)
    let t = clock.getElapsedTime() * 0.3;

    updateCamera(t);
    updateAirPlane(t);

    updateFlashLight(t);

    sphereUpdate();



    // TIMELINE

    // 1111111111111
    // ChemTrail trigger
    addTrail = () => {
        if (clock.getElapsedTime() > 18) {
            for (var i = 0; i < parties.length; ++i) {
                parties[i].update();
            }
        }
    };
    addTrail();

    // 22222222222222
    // Stars Trigger
    let starTimer = Math.floor(clock.getElapsedTime() - 33);

    if (starTimer < 0) {
        particleCount = 0;
    }
    else if
        (starTimer >= 100) {
        starTimer = 100
    }
    else {
        particleCount = Math.floor(starTimer * 10);
    }

    particles.setDrawRange(0, particleCount);


    // 3333333333333333333
    addStarLines = (m) => {
        if (clock.getElapsedTime() >= 94) {
            effectController.minDistance = k * clock.getElapsedTime() * l;
            group.add(linesMesh);
        }
    };
    addStarLines(1);

    addBox = () => {
        if (clock.getElapsedTime() >= 79) {

            updateBoxHanger(t);
        }
    }
    addBox();

    changeView = () => {
        if (clock.getElapsedTime() >= 64.2) {
            updateCamera2(t)
        }
    };
    changeView();


    changeViewDynamic = () => {
        if (clock.getElapsedTime() >= 124.5) {
            updateCamera2v2(t)
        }
    };
    changeViewDynamic();




    changeView2 = () => {
        if (clock.getElapsedTime() >= 155) {
            updateCamera3(t)
        }
    };
    changeView2();

    console.log(clock.getElapsedTime());
    // 


    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    for (let i = 0; i < particleCount; i++)
        particlesData[i].numConnections = 0;

    for (let i = 0; i < particleCount; i++) {

        // get the particle
        const particleData = particlesData[i];

        particlePositions[i * 3] += particleData.velocity.x;
        particlePositions[i * 3 + 1] += particleData.velocity.y;
        particlePositions[i * 3 + 2] += particleData.velocity.z;

        if (particlePositions[i * 3 + 1] < - rHalf || particlePositions[i * 3 + 1] > rHalf)
            particleData.velocity.y = - particleData.velocity.y;

        if (particlePositions[i * 3] < - rHalf || particlePositions[i * 3] > rHalf)
            particleData.velocity.x = - particleData.velocity.x;

        if (particlePositions[i * 3 + 2] < - rHalf || particlePositions[i * 3 + 2] > rHalf)
            particleData.velocity.z = - particleData.velocity.z;

        if (effectController.limitConnections && particleData.numConnections >= effectController.maxConnections)
            continue;

        // Check collision
        for (let j = i + 1; j < particleCount; j++) {

            const particleDataB = particlesData[j];
            if (effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections)
                continue;

            const dx = particlePositions[i * 3] - particlePositions[j * 3];
            const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
            const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < effectController.minDistance) {

                particleData.numConnections++;
                particleDataB.numConnections++;

                const alpha = 1.0 - dist / effectController.minDistance;

                positions[vertexpos++] = particlePositions[i * 3];
                positions[vertexpos++] = particlePositions[i * 3 + 1];
                positions[vertexpos++] = particlePositions[i * 3 + 2];

                positions[vertexpos++] = particlePositions[j * 3];
                positions[vertexpos++] = particlePositions[j * 3 + 1];
                positions[vertexpos++] = particlePositions[j * 3 + 2];

                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;

                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;

                numConnected++;

            }

        }


    }




    linesMesh.geometry.setDrawRange(0, numConnected * 2);
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;

    pointCloud.geometry.attributes.position.needsUpdate = true;

    const delta = clock.getDelta();
    composer.render();

    requestAnimationFrame(animate);
    render();

}


function render() {

    const delta = clock.getDelta();

    const time = Date.now() * 0.001;

    group.rotation.y = time * 0.1;


    // renderer.render(scene, camera);
}



const getFrequencyRangeValue = (data, _frequencyRange) => {
    const nyquist = 48000 / 2;
    const lowIndex = Math.round(_frequencyRange[0] / nyquist * data.length);
    const highIndex = Math.round(_frequencyRange[1] / nyquist * data.length);
    let total = 0;
    let numFrequencies = 0;

    for (let i = lowIndex; i <= highIndex; i++) {
        total += data[i];
        numFrequencies += 1;
    }
    return total / numFrequencies / 255;
};


// Particle system from: https://github.com/RonenNess/partykals