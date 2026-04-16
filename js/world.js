import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { scene, M, add } from './scene.js'

const gltfLoader = new GLTFLoader()

// carrega um GLB e coloca na cena
export function loadProp(url, x, y, z, scale = 1, rotationY = 0) {
  gltfLoader.load(url, (gltf) => {
    const model = gltf.scene
    model.position.set(x, y, z)
    model.scale.set(scale, scale, scale)
    model.rotation.y = rotationY
    model.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })
    scene.add(model)
  }, undefined, (err) => console.error('Erro ao carregar modelo:', err))
}

// CHÃO 
add(new THREE.PlaneGeometry(44.4, 35.4), M.floor, 0, 0, 4.5, -Math.PI / 2)
// ripas do soalho
for (let i = -22; i <= 22; i += 2) {
  add(new THREE.PlaneGeometry(0.05, 35.4),
    new THREE.MeshStandardMaterial({ color: '#a07040', roughness: 1 }),
    i, 0.002, 4.5, -Math.PI / 2)
}

// PAREDES 
add(new THREE.BoxGeometry(44.8, 16, 0.4), M.wall,  0, 8, -13)       // traseira
add(new THREE.BoxGeometry(0.4, 16, 35),  M.wall, -22, 8,  4.5)      // esquerda
add(new THREE.BoxGeometry(0.4, 16, 35),  M.wall,  22, 8,  4.5)      // direita

// parede da frente (com abertura para a porta)
add(new THREE.BoxGeometry(20.25, 16, 0.4), M.wall, -11.875, 8, 22)
add(new THREE.BoxGeometry(20.25, 16, 0.4), M.wall,  11.875, 8, 22)
add(new THREE.BoxGeometry(3.5, 10, 0.4),   M.wall,       0, 11, 22)

// rodapés
add(new THREE.BoxGeometry(14, 1.5, 0.15), M.woodMed, -7, 0.8, -12.8)
add(new THREE.BoxGeometry(14, 1.5, 0.15), M.woodMed,  7, 0.8, -12.8)

// CANDEEIROS 
function pendantLight(x, z) {
  add(new THREE.CylinderGeometry(0.02, 0.02, 1.5), M.metalDark, x, 6.2, z)
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.5, 16, 1, true), M.metalGrey)
  shade.rotation.x = Math.PI; shade.position.set(x, 5.3, z); scene.add(shade)
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshStandardMaterial({ emissive: '#ffaa44', emissiveIntensity: 4, color: '#fff' }))
  bulb.position.set(x, 5.2, z); scene.add(bulb)
}
pendantLight(-12,  0); pendantLight(-12, -6); pendantLight(8, -6); pendantLight(14, 4)
pendantLight(0, -6);   pendantLight(0,   2);  pendantLight(0, 10)
pendantLight(-10, 16); pendantLight(10, 16);  pendantLight(0, 18)

// JANELAS 
function addWindow(x, z, ry = 0) {
  const g = new THREE.Group()
  g.add(new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.5, 0.25),
    new THREE.MeshStandardMaterial({ color: '#c8b090', roughness: 0.6 })))
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3), M.glass)
  glass.position.z = 0.13; g.add(glass)
  const mv = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3, 0.26), new THREE.MeshStandardMaterial({ color: '#b89868' }))
  const mh = new THREE.Mesh(new THREE.BoxGeometry(4, 0.08, 0.26),  new THREE.MeshStandardMaterial({ color: '#b89868' }))
  mh.position.y = 0.3; g.add(mv); g.add(mh)
  const sill = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.15, 0.5), new THREE.MeshStandardMaterial({ color: '#d8c8a0', roughness: 0.5 }))
  sill.position.set(0, -1.82, 0.3); g.add(sill)
  g.position.set(x, 3.2, z); g.rotation.y = ry; scene.add(g)
  // luz exterior suave
  const shaft = new THREE.PointLight('#fff5e0', 0.8, 14)
  shaft.position.set(x, 3, z + 1); scene.add(shaft)
}
addWindow(-12, -12.6)
addWindow(  8, -12.6)
addWindow(-21.6, 0, Math.PI / 2)

// PORTA 
add(new THREE.BoxGeometry(3.5, 6, 0.3), M.woodDark, 0, 3, 21.85)
add(new THREE.BoxGeometry(3, 5.5, 0.1), M.woodMed,  0, 2.75, 21.8)
const doorGlass = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2), M.glass)
doorGlass.position.set(0, 3.8, 21.86); scene.add(doorGlass)
add(new THREE.CylinderGeometry(0.04, 0.04, 0.8), M.metalGrey, 0.5, 2.6, 21.9, 0, 0, Math.PI / 2)

// BALCÃO 
add(new THREE.BoxGeometry(10, 1.05, 2),    M.woodDark, 14, 0.52, 4)
add(new THREE.BoxGeometry(10.1, 0.12, 2.1), M.counter, 14, 1.12, 4) // tampo
add(new THREE.BoxGeometry(0.08, 1.05, 2),  M.woodDark,  9, 0.52, 4)
add(new THREE.BoxGeometry(0.08, 1.05, 2),  M.woodDark, 19, 0.52, 4)
// vitrine de vidro
const dispGlass = new THREE.Mesh(new THREE.BoxGeometry(9, 0.7, 0.08), M.glass)
dispGlass.position.set(14, 0.75, 3.04); scene.add(dispGlass)
// pães expostos no balcão
for (let i = 0; i < 5; i++) {
  add(new THREE.CylinderGeometry(0.2, 0.22, 0.18, 16),
    new THREE.MeshStandardMaterial({ color: '#7a3d10', roughness: 0.6 }), 10.5 + i * 1.8, 0.6, 3.9)
  const top = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8),
    new THREE.MeshStandardMaterial({ color: '#8b4520', roughness: 0.65 }))
  top.position.set(10.5 + i * 1.8, 0.79, 3.9); top.scale.y = 0.5; scene.add(top)
}

// CAIXA REGISTADORA 
function buildCashRegister(x, z) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.8),
    new THREE.MeshStandardMaterial({ color: '#2a2a2a', metalness: 0.6, roughness: 0.4 }))
  body.position.y = 0.4; g.add(body)
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.4),
    new THREE.MeshStandardMaterial({ color: '#00ff88', emissive: '#00cc66', emissiveIntensity: 0.8 }))
  screen.position.set(0, 0.65, 0.36); g.add(screen)
  // teclas
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const key = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.12), M.metalGrey)
    key.position.set(-0.18 + c * 0.14, 0.22, -0.05 + r * 0.13); g.add(key)
  }
  const gl = new THREE.PointLight('#00ff88', 0.4, 3)
  gl.position.set(0, 1, 0.4); g.add(gl)
  g.position.set(x, 1.12, z); scene.add(g)
}
buildCashRegister(17, 3.2)

// MESAS DE TRABALHO 
function buildWorkTable(x, z) {
  const g = new THREE.Group()
  // pernas
  for (let dx of [-1.4, 1.4]) for (let dz of [-0.85, 0.85]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.0, 0.12), M.woodDark)
    leg.position.set(dx, 0.5, dz); g.add(leg)
  }
  // tampo
  const top = new THREE.Mesh(new THREE.BoxGeometry(3, 0.1, 2),
    new THREE.MeshStandardMaterial({ color: '#f0ede0', roughness: 0.5 }))
  top.position.y = 1.05; g.add(top)
  // rolo de massa
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 1.2, 16),
    new THREE.MeshStandardMaterial({ color: '#d4b080', roughness: 0.6 }))
  pin.rotation.z = Math.PI / 2; pin.position.set(0, 1.12, 0.4); g.add(pin)
  // farinha espalhada
  const dust = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.5),
    new THREE.MeshStandardMaterial({ color: '#f8f4ec', transparent: true, opacity: 0.4 }))
  dust.rotation.x = -Math.PI / 2; dust.position.set(0, 1.11, 0); g.add(dust)
  // taça
  const bowl = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.flour)
  bowl.rotation.x = Math.PI; bowl.position.set(-0.8, 1.1, -0.4); g.add(bowl)
  g.position.set(x, 0, z); scene.add(g)
}
buildWorkTable(-12,  6)  // principal - onde se amassa
buildWorkTable(-12,  0)
buildWorkTable(-12, -6)
buildWorkTable(  8, -6)

// props decorativos em cima das mesas
loadProp('models/Bread.glb',  -12, 1.15,  6, 0.5, Math.random() * Math.PI)
loadProp('models/Burger.glb', -12, 1.15,  0, 0.5, Math.random() * Math.PI)
loadProp('models/Pan.glb',    -12, 1.15, -6,   0, 0.5)
loadProp('models/Pizza.glb',    8, 1.15, -6, 0.5, Math.random() * Math.PI)

loadProp('models/Kitchen.glb', 16, 2, -12, 0.5, Math.PI)

// SACOS DE FARINHA 
function flourSack(x, z) {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.44, 1.0, 12), M.flour)
  body.position.y = 0.5; g.add(body)
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.38, 0.2, 12), M.flour)
  top.position.y = 1.1; g.add(top)
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), M.flour)
  knot.position.y = 1.22; g.add(knot)
  g.position.set(x, 0, z); scene.add(g)
}
flourSack(-14, 3); flourSack(-13, 4.2); flourSack(-11, 3.4)

// FORNO 
loadProp('models/Oven.glb', 0, 0, -12, 1.25, 0)
// brilho do forno
const ovenGlow = new THREE.PointLight('#ff5500', 4, 15)
ovenGlow.position.set(0, 1.2, -11.5)
scene.add(ovenGlow)

// PRATELEIRA 
function buildShelf(x, z) {
  const g = new THREE.Group()
  const back = new THREE.Mesh(new THREE.BoxGeometry(5, 4.5, 0.2), M.woodDark)
  back.position.set(0, 2.25, -0.5); g.add(back)
  for (let sh = 0; sh < 3; sh++) {
    const board = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.1, 0.8), M.woodMed)
    board.position.set(0, 0.8 + sh * 1.5, 0); g.add(board)
    for (let i = 0; i < 4; i++) {
      const brd = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.6, 16),
        new THREE.MeshStandardMaterial({ color: '#7a3d12', roughness: 0.6 }))
      brd.rotation.z = 0.15; brd.position.set(-1.5 + i * 1.0, 0.95 + sh * 1.5, -0.1); g.add(brd)
    }
  }
  g.position.set(x, 0, z); scene.add(g)
}
buildShelf(-17, -12)

// QUADRO DE MENU 
add(new THREE.BoxGeometry(4.3, 2.8, 0.1), M.woodDark, -5, 3, -12.45)
add(new THREE.BoxGeometry(4, 2.5, 0.15),
  new THREE.MeshStandardMaterial({ color: '#1a2a1a', roughness: 0.9 }), -5, 3, -12.5)

// PLANTAS 
function addPlant(x, z) {
  add(new THREE.CylinderGeometry(0.3, 0.25, 0.5, 12),
    new THREE.MeshStandardMaterial({ color: '#8b4513', roughness: 0.9 }), x, 0.25, z)
  for (let i = 0; i < 8; i++) {
    const ang = i / 8 * Math.PI * 2, r = 0.25 + Math.random() * 0.15
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.25, 8, 6),
      new THREE.MeshStandardMaterial({ color: '#2d6a2d', roughness: 0.8 }))
    leaf.position.set(x + Math.cos(ang) * r, 0.7 + Math.random() * 0.3, z + Math.sin(ang) * r)
    leaf.scale.set(1, 0.6, 1); scene.add(leaf)
  }
}
addPlant(-21, 20); addPlant(20, 20)

// BANCOS DE BARRA 
function stool(x, z) {
  add(new THREE.CylinderGeometry(0.3, 0.3, 0.06, 16), M.woodMed, x, 0.85, z)
  add(new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8), M.metalDark, x, 0.45, z)
  add(new THREE.CylinderGeometry(0.28, 0.28, 0.04, 16), M.metalDark, x, 0.04, z)
}
stool(10, 6); stool(12, 6); stool(14, 6)
