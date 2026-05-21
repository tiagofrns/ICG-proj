import * as THREE from 'three'
import { renderer, scene, camera } from './scene.js'
import './world.js'
import { Baker } from './baker.js'
import { customers, trySpawnCustomer } from './customers.js'
import { notify, money, addMoney, updateRecipe, updateHUD, OvenBread, servedCount } from './ui.js'
import { initAudio, sfx } from './audio.js'
// ESTADO DO JOGO 
const player   = new Baker()
let px = 0, pz = 15
let ovenBread  = null
let ovenTotal = 12
let stamina    = 100
const maxStamina = 100
let moving = false
let gameStarted = false

let shopOpen = false;
let speedMult = 1.0;
let ovenMult = 1.0;

const RECIPES = {
  '1': { name: '1 baguete', kneads: 2, bakeTime: 8 },
  '2': { name: '2 croissants', kneads: 3, bakeTime: 6 },
  '3': { name: 'pão de centeio', kneads: 4, bakeTime: 12 },
  '4': { name: 'pastel de nata', kneads: 1, bakeTime: 5 },
  '5': { name: 'pão brioche', kneads: 3, bakeTime: 10 },
  '6': { name: 'pão alentejano', kneads: 5, bakeTime: 15 }
}
let currentRecipe = RECIPES['1']
let carryingRecipe = null             

//iniio
const startBtn = document.getElementById('start-btn');
// LOGICA DA LOJA -
document.getElementById('btn-upg-speed')?.addEventListener('click', (e) => {
  if (money >= 50 && speedMult === 1.0) {
    addMoney(-50);
    speedMult = 1.5;
    e.currentTarget.classList.add('bought');
    document.getElementById('shop-money').textContent = money.toFixed(2).replace('.', ',') + ' €';
    notify("👟 Sapatos Rápidos comprados!");
  }
});

document.getElementById('btn-upg-oven')?.addEventListener('click', (e) => {
  if (money >= 80 && ovenMult === 1.0) {
    addMoney(-80);
    ovenMult = 0.6; // Forno 40% mais rápido
    e.currentTarget.classList.add('bought');
    document.getElementById('shop-money').textContent = money.toFixed(2).replace('.', ',') + ' €';
    notify("🔥 Forno Turbo comprado!");
  }
});

if (startBtn) {
  startBtn.addEventListener('click', async () => {
    // Dá feedback visual e previne múltiplos cliques enquanto carrega os buffers
    startBtn.textContent = "A carregar sons...";
    startBtn.disabled = true;

    try {
      await initAudio();
      console.log("Todos os áudios locais foram descodificados com sucesso!");
      
      const screen = document.getElementById('start-screen');
      if (screen) {
        screen.style.opacity = '0';
        setTimeout(() => screen.style.display = 'none', 300);
      }
      
      gameStarted = true;
      setTimeout(trySpawnCustomer, 2000);
    } catch (err) {
      console.error("Falha ao inicializar o motor de áudio:", err);
      gameStarted = true;
      const screen = document.getElementById('start-screen');
      if (screen) screen.style.display = 'none';
    }
  });
} else {
  console.error("Erro: O botão 'start-btn' não foi encontrado no HTML.");
}



const keys = {}

// === CÂMARA ESTILO ROBLOX ===
let camYaw   = 0    // rotação horizontal (rato esq/dir)
let camPitch = 0.45  // rotação vertical   (rato cima/baixo)
let isDragging = false
let lastMouseX = 0, lastMouseY = 0

window.addEventListener('mousedown', e => {
  if (e.button === 2 || e.button === 0) {
    isDragging = true
    lastMouseX = e.clientX
    lastMouseY = e.clientY
  }
})
window.addEventListener('mouseup', () => { isDragging = false })
window.addEventListener('mousemove', e => {
  if (!isDragging) return
  const dx = e.clientX - lastMouseX
  const dy = e.clientY - lastMouseY
  lastMouseX = e.clientX
  lastMouseY = e.clientY
  camYaw   -= dx * 0.005
  camPitch -= dy * 0.005
  camPitch  = Math.max(0.1, Math.min(1.4, camPitch))
})
window.addEventListener('contextmenu', e => e.preventDefault())

window.addEventListener('keydown', e => {
  if (!gameStarted) return
  keys[e.code] = true

  // Abrir / Fechar Loja
  if (e.code === 'KeyB') {
    shopOpen = !shopOpen;
    const s = document.getElementById('shop-screen');
    s.style.display = shopOpen ? 'flex' : 'none';
    if(shopOpen) document.getElementById('shop-money').textContent = money.toFixed(2).replace('.', ',') + ' €';
    return;
  }

  // Deitar produto fora
  if (e.code === 'KeyT' && (player.hasDough || player.hasKneadedDough || player.hasBread)) {
    player.hasDough = false; player.hasKneadedDough = false; player.hasBread = false;
    player.updateItem();
    addMoney(800); //teste
    notify('🗑️ Deitaste o produto no lixo!');
    return;
  }

  if (RECIPES[e.key] && !player.hasDough && !player.hasKneadedDough && !player.hasBread) {
    currentRecipe = RECIPES[e.key];
    notify('📜 Receita ativa: ' + currentRecipe.name.toUpperCase());
  }

  if (e.code === 'KeyE' && !player.hasDough && !player.hasKneadedDough && !player.hasBread) {
    if (dist(px, pz, -12, 6) < 3.5) {
      player.hasDough = true; player.kneadCount = 0; player.updateItem()
      carryingRecipe = currentRecipe; 
      sfx.pickup();
      notify(`Massa de ${carryingRecipe.name} apanhada! Amassa com Q`)
    }
  }

  if (e.code === 'KeyQ' && player.hasDough) {
    if (dist(px, pz, -12, 6) < 3.5) {
      player.kneadCount++
      sfx.knead();
      if (player.kneadCount >= carryingRecipe.kneads) {
        player.hasDough = false; player.hasKneadedDough = true; player.updateItem()
        notify('Massa pronta! Leva ao forno (F)')
      } else {
        notify(`💪 A amassar... (${player.kneadCount}/${carryingRecipe.kneads})`)
      }
    }
  }

  if (e.code === 'KeyF' && player.hasKneadedDough && !ovenBread) {
    if (dist(px, pz, 0, -12) < 5) {
      player.hasKneadedDough = false; player.updateItem()
      // Aplica multiplicador da loja ao tempo de cozedura
      ovenTotal = carryingRecipe.bakeTime * ovenMult; 
      ovenBread = new OvenBread(carryingRecipe.name);
      sfx.ovenIn();
      notify(`No forno 🔥! Aguarda ${ovenTotal.toFixed(1)} segundos...`)
    }
  }

  if (e.code === 'Space') {
    if (ovenBread && ovenBread.done && dist(px, pz, 0, -12) < 5) {
      carryingRecipe = Object.values(RECIPES).find(r => r.name === ovenBread.recipeName);
      ovenBread.remove(); ovenBread = null
      player.hasBread = true; player.updateItem()
      sfx.pickup();
      notify(`🍞 ${carryingRecipe.name} pronto! Vende (R)`)
    }
  }

  if (e.code === 'KeyR' && player.hasBread) {
    let sold = false
    for (let c of customers) {
      if (!c.satisfied && !c.angry && dist(px, pz, c.group.position.x, c.group.position.z) < 4) {
        // Validação da Receita!
        if (c.order === carryingRecipe.name) {
          player.hasBread = false; player.updateItem()
          addMoney(c.price); c.leave(true)
          sold = true; break
        } else {
          notify(`❌ O cliente quer ${c.order}, mas tens ${carryingRecipe.name}!`);
          sold = true; // Impede o loop de saltar para o próximo cliente automaticamente
          break;
        }
      }
    }
    if (!sold) notify('❗ Chega-te ao cliente certo!')
  }
})

window.addEventListener('keyup', e => { keys[e.code] = false })

function dist(x1, z1, x2, z2) { return Math.hypot(x1 - x2, z1 - z2) }


// SPAWN DE CLIENTES 
let spawnTimer = 0, nextSpawnTime = 8

// LOOP PRINCIPAL 
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)
  const dt = clock.getDelta()

  if (!gameStarted || shopOpen) {
    renderer.render(scene, camera)
    return
  }

  //mov
  // W/S/A/D movem relativamente à câmara; boneco vira suavemente para a direção do movimento
  moving = false
  let speed = 0.12 * speedMult;
  const isRunning = (keys['ShiftLeft'] || keys['ShiftRight']) && stamina > 0;
  if (moving && isRunning) { speed = 0.22 * speedMult; stamina -= dt * 40 }

  // Vetores da câmara no plano XZ (ignora inclinação vertical)
  const camForward = new THREE.Vector3(-Math.sin(camYaw), 0, -Math.cos(camYaw))
  const camRight   = new THREE.Vector3( Math.cos(camYaw), 0, -Math.sin(camYaw))

  let moveVec = new THREE.Vector3()
  if (keys['KeyW']) moveVec.add(camForward)
  if (keys['KeyS']) moveVec.sub(camForward)
  if (keys['KeyA']) moveVec.sub(camRight)
  if (keys['KeyD']) moveVec.add(camRight)

  if (moveVec.lengthSq() > 0) {
    moving = true
    moveVec.normalize()

    const targetAngle = Math.atan2(moveVec.x, moveVec.z)
    let diff = targetAngle - player.group.rotation.y
    while (diff >  Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    player.group.rotation.y += diff * Math.min(1, dt * 14)
  }

  // stamina
  if (moving && isRunning) { 
    speed = 0.22 * speedMult; 
    stamina -= dt * 40;
  } else { 
    stamina += dt * 15;
  }
  stamina = Math.max(0, Math.min(maxStamina, stamina))
  document.getElementById('stamina-bar').style.width = stamina + '%'

  // posição com colisão básica
  let nextPx = px, nextPz = pz
  if (moving) {
    nextPx += moveVec.x * speed
    nextPz += moveVec.z * speed
  }
  nextPx = Math.max(-20, Math.min(20, nextPx))
  nextPz = Math.max(-10, nextPz)

  // bloqueia saída pela parede da frente (exceto pela porta)
  const naPorta = nextPx > -1.75 && nextPx < 1.75
  if (nextPz > 21.5 && !naPorta) nextPz = Math.min(pz, 21.5)
  nextPz = Math.min(60, nextPz)

  px = nextPx; pz = nextPz
  player.group.position.set(px, 0, pz)
  player.walkAnim(dt * (isRunning ? 1.5 : 1) * speedMult, moving)  
  // forno
  if (ovenBread) ovenBread.update(dt, ovenTotal)

  // clientes
  spawnTimer += dt
  if (spawnTimer >= nextSpawnTime) {
    spawnTimer = 0
    const diffOffset = Math.min(10, servedCount * 0.5);
    nextSpawnTime = Math.max(5, (10 + Math.random() * 15) - diffOffset);
    trySpawnCustomer()
  }
  for (let c of customers) c.update(dt)

  // === CÂMARA ORBITAL ESTILO ROBLOX ===
  const camDist = 7
  const camTarget = new THREE.Vector3(px, 1.2, pz)
  const idealCamPos = new THREE.Vector3(
    px + Math.sin(camYaw) * Math.cos(camPitch) * camDist,
    1.2 + Math.sin(camPitch) * camDist,
    pz + Math.cos(camYaw) * Math.cos(camPitch) * camDist
  )
  idealCamPos.x = Math.max(-25, Math.min(25, idealCamPos.x))
  idealCamPos.z = Math.max(-15, Math.min(70, idealCamPos.z))
  const cPad = 1.0 

  if (pz <= 21.5) {
   
    idealCamPos.x = Math.max(-22 + cPad, Math.min(22 - cPad, idealCamPos.x))
    idealCamPos.z = Math.max(-13 + cPad, Math.min(22 - cPad, idealCamPos.z))
  } else {
    idealCamPos.x = Math.max(-22 + cPad, Math.min(22 - cPad, idealCamPos.x))
    
    if (idealCamPos.x < -1.75 || idealCamPos.x > 1.75) {
      idealCamPos.z = Math.max(22 + cPad, Math.min(60, idealCamPos.z))
    } else {
      idealCamPos.z = Math.max(-13 + cPad, Math.min(60, idealCamPos.z))
    }
  }

  camera.position.lerp(idealCamPos, Math.min(1, dt * 12))
  camera.lookAt(camTarget)

  // hud
  updateHUD(player, ovenBread, ovenTotal)
  updateRecipe(player, ovenBread, currentRecipe, carryingRecipe)

  renderer.render(scene, camera)
}

animate()