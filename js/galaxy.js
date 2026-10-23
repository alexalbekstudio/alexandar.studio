const container = document.getElementById('webgl-bg');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020308, 0.0012);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 7, 18);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.25;
controls.enableZoom = false;

function createGlowMaterial(color, size = 128) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  return new THREE.Sprite(new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    blending: THREE.AdditiveBlending
  }));
}

const centralGlow = createGlowMaterial('rgba(56, 189, 248, 0.85)', 256);
centralGlow.scale.set(8, 8, 1);
scene.add(centralGlow);

for (let i = 0; i < 12; i++) {
  const hue = Math.random() * 60 + 170;
  const color = `hsla(${hue}, 85%, 55%, 0.45)`;
  const nebula = createGlowMaterial(color, 256);
  nebula.scale.set(10 + Math.random() * 20, 10 + Math.random() * 20, 1);
  nebula.position.set(
    (Math.random() - 0.5) * 40,
    (Math.random() - 0.5) * 20,
    (Math.random() - 0.5) * 40
  );
  scene.add(nebula);
}

const isMobile = window.innerWidth < 768;
const galaxyParameters = {
  count: isMobile ? 40000 : 75000,
  arms: 4,
  radius: 12,
  spin: 1.8,
  randomness: 0.35,
  randomnessPower: 3,
  insideColor: new THREE.Color(0x38bdf8),
  outsideColor: new THREE.Color(0x10b981)
};

const positions = new Float32Array(galaxyParameters.count * 3);
const colors = new Float32Array(galaxyParameters.count * 3);

for (let i = 0; i < galaxyParameters.count; i++) {
  const i3 = i * 3;
  const radius = Math.pow(Math.random(), galaxyParameters.randomnessPower) * galaxyParameters.radius;
  const branchAngle = ((i % galaxyParameters.arms) / galaxyParameters.arms) * Math.PI * 2;
  const spinAngle = radius * galaxyParameters.spin;
  const randomX = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
  const randomY = (Math.random() - 0.5) * galaxyParameters.randomness * radius * 0.4;
  const randomZ = (Math.random() - 0.5) * galaxyParameters.randomness * radius;
  const totalAngle = branchAngle + spinAngle;

  positions[i3] = Math.cos(totalAngle) * radius + randomX;
  positions[i3 + 1] = randomY;
  positions[i3 + 2] = Math.sin(totalAngle) * radius + randomZ;

  const mixedColor = galaxyParameters.insideColor.clone();
  mixedColor.lerp(galaxyParameters.outsideColor, radius / galaxyParameters.radius);
  mixedColor.multiplyScalar(0.7 + 0.3 * Math.random());

  colors[i3] = mixedColor.r;
  colors[i3 + 1] = mixedColor.g;
  colors[i3 + 2] = mixedColor.b;
}

const galaxyGeometry = new THREE.BufferGeometry();
galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const galaxyMaterial = new THREE.PointsMaterial({
  size: 0.022,
  vertexColors: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
scene.add(galaxy);

const starGeometry = new THREE.BufferGeometry();
const starCount = 3500;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  starPositions[i * 3] = (Math.random() - 0.5) * 400;
  starPositions[i * 3 + 1] = (Math.random() - 0.5) * 400;
  starPositions[i * 3 + 2] = (Math.random() - 0.5) * 400;
}
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
  size: 0.6,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.8
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  galaxy.rotation.y += 0.0006;
  stars.rotation.y += 0.00015;
  renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();