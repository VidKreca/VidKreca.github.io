/**
 * Config
 */
const objectsDistance = 4;
const particlesCount = 200;
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};


/**
 * ThreeJS objects setup
 */ 
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();
const material = new THREE.MeshToonMaterial({color: '#ffeded'});

// Create objects
const meshes = [
    new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material),
    new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material),
    new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), material)
];
meshes[0].position.y = -objectsDistance * 0;
meshes[1].position.y = -objectsDistance * 1;
meshes[2].position.y = -objectsDistance * 2;
meshes[0].position.x = 2;
meshes[1].position.x = -2;
meshes[2].position.x = 2;
scene.add(meshes[0], meshes[1], meshes[2]);

// Create particles
const particlePositions = new Float32Array(particlesCount * 3);
for(let i = 0; i < particlesCount; i++)
{
    particlePositions[i * 3 + 0] = (Math.random() - 0.5) * 10;
    particlePositions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * meshes.length;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}
const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particlesMaterial = new THREE.PointsMaterial({
    color: '#ffeded',
    sizeAttenuation: true,
    size: 0.03
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
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 6;
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
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Scrolling handler
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
                duration: 1.5,
                ease: 'power2.inOut',
                x: '+=6',
                y: '+=3'
            }
        );
    }
})

/**
 * Cursor handler
 */
const cursor = {x: 0, y: 0};
window.addEventListener('mousemove', (event) => {
    cursor.x = event.clientX / sizes.width - 0.5;
    cursor.y = event.clientY / sizes.height - 0.5;
})

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;
const animate = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Animate meshes
    for (const mesh of meshes) {
        mesh.rotation.x += deltaTime * 0.1;
        mesh.rotation.y += deltaTime * 0.12;
    }

    // Animate camera
    camera.position.y = - scrollY / sizes.height * objectsDistance;
    const parallaxX = cursor.x * 0.5;
    const parallaxY = - cursor.y * 0.5;
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(animate);
}
animate();