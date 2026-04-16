import * as THREE from 'three'
import { renderer, scene, camera } from './scene.js'
import './world.js'
import { Baker } from './baker.js'
import { customers, trySpawnCustomer } from './customers.js'
import { notify, addMoney, updateRecipe, updateHUD, OvenBread } from './ui.js'

// ESTADO DO JOGO 
const player   = new Baker()
let px = 0, pz = 15
let ovenBread  = null
const ovenTotal = 12

let stamina    = 100
const maxStamina = 100

let moving = false

// INPUT 
const keys = {}

window.addEventListener('keydown', e => {
  keys[e.code] = true

  // E - pegar massa (perto da mesa)
  if (e.code === 'KeyE' && !player.hasDough && !player.hasKneadedDough && !player.hasBread) {
    if (dist(px, pz, -12, 6) < 3.5) {
      player.hasDough = true; player.kneadCount = 0; player.updateItem()
      notify('Massa apanhada! 🥣 Amassa com Q')
    }
  }

  // Q - amassar (perto da mesa)
  if (e.code === 'KeyQ' && player.hasDough) {
    if (dist(px, pz, -12, 6) < 3.5) {
      player.kneadCount++
      if (player.kneadCount >= 3) {
        player.hasDough = false; player.hasKneadedDough = true; player.updateItem()
        notify('Massa amassada! Agora leva ao forno (F)')
      } else {
        notify(`💪 A amassar... (${player.kneadCount}/3)`)
      }
    }
  }

  // F - colocar no forno
  if (e.code === 'KeyF' && player.hasKneadedDough && !ovenBread) {
    if (dist(px, pz, 0, -12) < 5) {
      player.hasKneadedDough = false; player.updateItem()
      ovenBread = new OvenBread()
      notify('No forno 🔥! Aguarda 12 segundos...')
    }
  }

  // SPACE - tirar do forno
  if (e.code === 'Space') {
    if (ovenBread && ovenBread.done && dist(px, pz, 0, -12) < 5) {
      ovenBread.remove(); ovenBread = null
      player.hasBread = true; player.updateItem()
      notify('🍞 Pão pronto! Vende a um cliente (R)')
    }
  }

  // R - vender ao cliente
  if (e.code === 'KeyR' && player.hasBread) {
    let sold = false
    for (let c of customers) {
      if (!c.satisfied && !c.angry && dist(px, pz, c.group.position.x, c.group.position.z) < 4) {
        player.hasBread = false; player.updateItem()
        addMoney(c.price); c.leave(true)
        sold = true; break
      }
    }
    if (!sold) notify('❗ Chega-te a um cliente!')
  }
})

window.addEventListener('keyup', e => { keys[e.code] = false })

function dist(x1, z1, x2, z2) { return Math.hypot(x1 - x2, z1 - z2) }

// SPAWN DE CLIENTES 
let spawnTimer = 0, nextSpawnTime = 8
setTimeout(trySpawnCustomer, 2000) // primeiro cliente logo ao início

// LOOP PRINCIPAL 
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const dt = clock.getDelta()

  // movimento
  moving = false
  let speed = 0.12
  const isRunning = (keys['ShiftLeft'] || keys['ShiftRight']) && stamina > 0

  const turnSpeed = 0.05
  if (keys['KeyA']) player.group.rotation.y += turnSpeed
  if (keys['KeyD']) player.group.rotation.y -= turnSpeed

  let moveDir = 0
  if (keys['KeyW']) { moving = true; moveDir =  1 }
  if (keys['KeyS']) { moving = true; moveDir = -1 }

  // stamina
  if (moving && isRunning) { speed = 0.22; stamina -= dt * 40 }
  else                     { stamina += dt * 15 }
  stamina = Math.max(0, Math.min(maxStamina, stamina))
  document.getElementById('stamina-bar').style.width = stamina + '%'

  // posição com colisão básica
  let nextPx = px, nextPz = pz
  if (moving) {
    nextPx += Math.sin(player.group.rotation.y) * speed * moveDir
    nextPz += Math.cos(player.group.rotation.y) * speed * moveDir
  }
  nextPx = Math.max(-20, Math.min(20, nextPx))
  nextPz = Math.max(-10, nextPz)

  // bloqueia saída pela parede da frente (exceto pela porta)
  const naPorta = nextPx > -1.75 && nextPx < 1.75
  if (nextPz > 21.5 && !naPorta) nextPz = Math.min(pz, 21.5)
  nextPz = Math.min(60, nextPz)

  px = nextPx; pz = nextPz
  player.group.position.set(px, 0, pz)
  player.walkAnim(dt * (isRunning ? 1.5 : 1), moving)
  // forno
  if (ovenBread) ovenBread.update(dt, ovenTotal)

  // clientes
  spawnTimer += dt
  if (spawnTimer >= nextSpawnTime) {
    spawnTimer = 0
    nextSpawnTime = 10 + Math.random() * 15
    trySpawnCustomer()
  }
  for (let c of customers) c.update(dt)

  // câmara em 3ª pessoa
  const offset = new THREE.Vector3(0, 5, -8)
  offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), player.group.rotation.y)
  offset.add(player.group.position)
  offset.x = Math.max(-25, Math.min(25, offset.x))
  offset.z = Math.max(-15, Math.min(70, offset.z))
  camera.position.lerp(offset, 0.08)
  camera.lookAt(player.group.position.x, player.group.position.y + 1.2, player.group.position.z)

  // hud
  updateHUD(player, ovenBread, ovenTotal)
  updateRecipe(player, ovenBread)

  renderer.render(scene, camera)
}

animate()
