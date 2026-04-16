import * as THREE from 'three'
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { scene } from './scene.js'
import { notify } from './ui.js'

const gltfLoader = new GLTFLoader()

// modelos carregados assincronamente
let modelMan = null
let modelWoman = null

gltfLoader.load('models/Man.glb', (gltf) => {
  modelMan = gltf.scene
  modelMan.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })
})
gltfLoader.load('models/Woman.glb', (gltf) => {
  modelWoman = gltf.scene
  modelWoman.traverse(c => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true } })
})

const ORDERS = ['1 baguete', '2 croissants', 'pão de centeio', 'pastel de nata', 'pão brioche', 'pão alentejano']
const PRICES  = {
  '1 baguete':       1.80,
  '2 croissants':    2.40,
  'pão de centeio':  2.20,
  'pastel de nata':  1.50,
  'pão brioche':     2.80,
  'pão alentejano':  3.20,
}
const MALE_NAMES   = ['João', 'Pedro', 'Carlos', 'Rui', 'Miguel', 'Hugo']
const FEMALE_NAMES = ['Ana', 'Maria', 'Sofia', 'Inês', 'Rita', 'Catarina']

export let customers = []
let nextCustomerId = 0

export function removeCustomer(id) {
  customers = customers.filter(c => c.id !== id)
}

export class Customer {
  constructor(id) {
    this.id = id
    this.isMale = Math.random() > 0.5
    this.name   = this.isMale
      ? MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)]
      : FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)]
    this.order       = ORDERS[Math.floor(Math.random() * ORDERS.length)]
    this.price       = PRICES[this.order]
    this.patience    = 1.0
    this.patienceTime = 40 + Math.random() * 20
    this.satisfied   = false
    this.angry       = false

    this.group = new THREE.Group()

    // tenta usar GLB carregado, fallback para cápsulas simples
    const sourceModel = this.isMale ? modelMan : modelWoman
    if (sourceModel) {
      const char = SkeletonUtils.clone(sourceModel)
      char.scale.set(this.isMale ? 0.6 : 0.25, this.isMale ? 0.6 : 0.25, this.isMale ? 0.6 : 0.25)
      char.position.x -= 1
      this.group.add(char)
    } else {
      const bodyColor = this.isMale ? '#4466cc' : '#cc44aa'
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.9, 6, 8), new THREE.MeshStandardMaterial({ color: bodyColor }))
      body.castShadow = true; this.group.add(body)
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 10, 8), new THREE.MeshStandardMaterial({ color: '#e8c898' }))
      head.position.y = 1.75; this.group.add(head)
    }

    // bolha de encomenda
    this.bubble = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#ffdd44', emissive: '#ffaa00', emissiveIntensity: 0.5 })
    )
    this.bubble.position.set(0.6, 4.5, 0)
    this.group.add(this.bubble)

    this.group.position.set(0, 0, 21)
    this.group.rotation.y = Math.PI
    scene.add(this.group)

    this._createCard()
  }

  _createCard() {
    const panel = document.getElementById('customers-panel')
    this.card = document.createElement('div')
    this.card.className = 'customer-card'
    this.card.innerHTML = `
      <div class="cname">${this.isMale ? '👨' : '👩'} ${this.name}</div>
      <div class="order">📋 ${this.order}</div>
      <div style="color:#c8a060;font-size:11px">💰 ${this.price.toFixed(2)} €</div>
      <div class="patience-bar"><div class="patience" style="width:100%"></div></div>
    `
    panel.appendChild(this.card)
    this.patienceEl = this.card.querySelector('.patience')
  }

  update(dt) {
    if (this.satisfied || this.angry) {
      // sai pela porta
      this.group.position.x += (0  - this.group.position.x) * dt * 2
      this.group.position.z += (22 - this.group.position.z) * dt * 2
      return
    }

    // move-se para a fila
    const queueIndex = customers.indexOf(this)
    const targetX = 14
    const targetZ = 6 + queueIndex * 2.2
    this.group.position.x += (targetX - this.group.position.x) * dt * 3
    this.group.position.z += (targetZ - this.group.position.z) * dt * 3

    // paciência
    this.patience -= dt / this.patienceTime
    if (this.patience < 0) this.patience = 0
    this.patienceEl.style.width = (this.patience * 100) + '%'
    if (this.patience < 0.3) this.patienceEl.className = 'patience low'
    if (this.patience <= 0) this.leave(false)

    // pulso da bolha
    this.bubble.material.emissiveIntensity = 0.5 + Math.sin(Date.now() * 0.003) * 0.3
    if (this.patience < 0.3) this.card.classList.add('urgent')
  }

  leave(paid) {
    this.satisfied = paid
    this.angry     = !paid
    if (paid) notify(`✅ ${this.name} ficou feliz! +${this.price.toFixed(2)}€`)
    else      notify(`😠 ${this.name} foi embora...`)
    setTimeout(() => {
      scene.remove(this.group)
      this.card.remove()
      removeCustomer(this.id)
    }, 1500)
  }
}

// spawn controlado por timer (feito no loop principal)
const MAX_CUSTOMERS = 5

export function trySpawnCustomer() {
  if (customers.length >= MAX_CUSTOMERS) return
  customers.push(new Customer(nextCustomerId++))
}
