import * as THREE from 'three'

// RENDERER 
export const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMappingExposure = 0.6
renderer.outputColorSpace = THREE.SRGBColorSpace
document.body.appendChild(renderer.domElement)

// CENA 
export const scene = new THREE.Scene()
scene.background = new THREE.Color(0x0a0c10)
scene.fog = new THREE.FogExp2(0xf0e8dc, 0.02)

// CÂMARA 
export const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200) // Câmara de Projeção Perspetiva: simula a visão humana, onde os objetos 
// parecem menores à medida que se afastam, ângulo de 65 graus, 

// LUZES 
scene.add(new THREE.AmbientLight(0xfff0e0, 0.3))
scene.add(new THREE.HemisphereLight(0x333344, 0x11111a, 0.2))

const fillLight = new THREE.DirectionalLight(0xfff5e0, 1.3)
fillLight.castShadow = true
fillLight.shadow.mapSize.set(1024, 1024)
fillLight.shadow.bias = -0.001
scene.add(fillLight)

// luz da zona de trabalho
const lightWork = new THREE.PointLight('#ffc880', 3.5, 30)
lightWork.position.set(-10, 4, -2)
lightWork.castShadow = true
scene.add(lightWork)

// luz do balcão
const lightCounter = new THREE.PointLight('#ffc880', 6, 30)
lightCounter.position.set(10, 4, 4)
scene.add(lightCounter)

// luz da entrada
const lightEntrance = new THREE.PointLight('#ffc880', 5, 30)
lightEntrance.position.set(0, 4, 15)
scene.add(lightEntrance)

// lua (exterior)
const moon = new THREE.DirectionalLight(0x88aabb, 0.6)
moon.position.set(-25, 20, 25)
moon.castShadow = false
scene.add(moon)

// MATERIAIS 
export const M = {
  floor:      new THREE.MeshStandardMaterial({ color: '#c49a6c', roughness: 0.85, metalness: 0.0 }),
  wall:       new THREE.MeshStandardMaterial({ color: '#f2ead8', roughness: 0.9 }),
  wallAccent: new THREE.MeshStandardMaterial({ color: '#e8d4b0', roughness: 0.8 }),
  woodDark:   new THREE.MeshStandardMaterial({ color: '#5c3010', roughness: 0.8 }),
  woodMed:    new THREE.MeshStandardMaterial({ color: '#7a4a20', roughness: 0.75 }),
  woodLight:  new THREE.MeshStandardMaterial({ color: '#a06030', roughness: 0.7 }),
  metalGrey:  new THREE.MeshStandardMaterial({ color: '#888', metalness: 0.85, roughness: 0.25 }),
  metalDark:  new THREE.MeshStandardMaterial({ color: '#555', metalness: 0.9, roughness: 0.2 }),
  glass:      new THREE.MeshStandardMaterial({ color: '#b8d8f0', metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.45 }),
  flour:      new THREE.MeshStandardMaterial({ color: '#f5ede0', roughness: 0.95 }),
  doughRaw:   new THREE.MeshStandardMaterial({ color: '#f0deb8', roughness: 0.9 }),
  breadRaw:   new THREE.MeshStandardMaterial({ color: '#d4b87a', roughness: 0.85 }),
  breadDone:  new THREE.MeshStandardMaterial({ color: '#7a3d10', roughness: 0.6 }),
  tile:       new THREE.MeshStandardMaterial({ color: '#e8ddd0', roughness: 0.7 }),
  counter:    new THREE.MeshStandardMaterial({ color: '#f8f0e0', roughness: 0.3, metalness: 0.1 }),
}

// helper - adiciona mesh à cena com posição/rotação
export function add(geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat)
  m.position.set(x, y, z)
  m.rotation.set(rx, ry, rz)
  m.castShadow = true
  m.receiveShadow = true
  scene.add(m)
  return m
}

// resize
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight
  camera.updateProjectionMatrix() // transformar as coordenadas 3D do mundo em coordenadas 2D
  renderer.setSize(innerWidth, innerHeight)
})
