/**
 * Config
 */
 const config = {
    objectsDistance: 4,
    meshOffset: 1.5,
    particles: {
        count: 300,
        size: 0.03,
        color: '#ffeded'
    },
    camera: {
        fov: 35,
        z: 6
    },
    animation: {
        meshes: {
            rotation: {
                x: 0.1,
                y: 0.12
            }
        }
    },
    mobile: {
        isMobile: false,
        maxWidth: 1000,
        xPosition: 0
    },
    getXPosition: (isEven) => {
        return (config.mobile.isMobile) ? config.mobile.xPosition : (isEven ? config.meshOffset : -1 * config.meshOffset);
    }
};
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};
const cursor = {
    x: 0, 
    y: 0
};



/**
 * ThreeJS objects setup
 */ 
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const material = new THREE.MeshToonMaterial({color: '#ffeded'});

// Create objects, EdgesGeometry or WireframeGeometry
let cubeGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1));
let torusGeometry = new THREE.WireframeGeometry(new THREE.TorusGeometry(1, 0.4, 16, 60));   
let coneGeometry = new THREE.WireframeGeometry(new THREE.ConeGeometry(1, 2, 32));
let lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, linewidth: 2});
const meshes = [
    new THREE.LineSegments(torusGeometry, lineMaterial),
    new THREE.LineSegments(cubeGeometry, lineMaterial),
    new THREE.LineSegments(coneGeometry, lineMaterial),
];
meshes[0].position.y = -config.objectsDistance * 0;
meshes[1].position.y = -config.objectsDistance * 1;
meshes[2].position.y = -config.objectsDistance * 2;
meshes[0].position.x = config.getXPosition(true);
meshes[1].position.x = config.getXPosition(false);
meshes[2].position.x = config.getXPosition(true);
scene.add(meshes[0], meshes[1], meshes[2]);

// Create particles
const particlePositions = new Float32Array(config.particles.count * 3);  // Flat 3D array for particle positions
for (let i = 0; i < config.particles.count; i++) {
    particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    particlePositions[i * 3 + 1] = config.objectsDistance * 0.5 - Math.random() * config.objectsDistance * meshes.length;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particlesMaterial = new THREE.PointsMaterial({
    color: config.particles.color,
    sizeAttenuation: true,
    size: config.particles.size
});
const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Lights
const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight);

// Camera
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
const camera = new THREE.PerspectiveCamera(config.camera.fov, sizes.width / sizes.height, 0.1, 100);
camera.position.z = config.camera.z;
cameraGroup.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


/**
 * Resizing handler
 */
window.addEventListener('resize', () => {
    // Update window sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update isMobile flag
    config.mobile.isMobile = (sizes.width < config.mobile.maxWidth);

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

/**
 * Scrolling handler, 
 * animates objects when they're reached.
 */
let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
    const newSection = Math.round(scrollY / sizes.height);

    if (newSection != currentSection) {
        currentSection = newSection;
        gsap.to(
            meshes[currentSection].rotation,
            {
                duration: 10,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3'
            }
        );
    }
});

/**
 * Cursor handler,
 * updates cursor position object.
 */
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
})

/**
 * Animation
 */
const clock = new THREE.Clock();
let previousTime = 0;
const animate = () => {
    // Get delta time
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Animate meshes
    for (const [index, mesh] of meshes.entries()) {
        mesh.rotation.x += deltaTime * config.animation.meshes.rotation.x;
        mesh.rotation.y += deltaTime * config.animation.meshes.rotation.y;

        // Toggle between default and mobile mesh positions
        mesh.position.x = config.getXPosition(index % 2 == 0);
    }

    // Animate camera
    camera.position.y = -scrollY / sizes.height * config.objectsDistance;
    const parallaxX = cursor.x * 0.5;
    const parallaxY = -cursor.y * 0.5;
    cameraGroup.position.x += deltaTime * (parallaxX - cameraGroup.position.x) * 5;
    cameraGroup.position.y += deltaTime * (parallaxY - cameraGroup.position.y) * 5;

    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
}
animate();