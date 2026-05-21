import * as THREE from 'three'
import { scene } from './scene.js'
import { sfx } from './audio.js'

// NOTIFICAÇÕES 
let notifTimer = null

// DINHEIRO E ESTATÍSTICAS 

export let money = 0
export let servedCount = 0 
export let lostCount = 0

// LEADERBOARD (Local Storage)
let highScore = parseFloat(localStorage.getItem('padaria_highscore')) || 0
setTimeout(() => {
  const hs = document.getElementById('high-score');
  if (hs) hs.textContent = highScore.toFixed(2).replace('.', ',') + ' €'
}, 100);



export function notify(msg) {
  const n = document.getElementById('notif')
  n.textContent = msg
  n.style.opacity = '1'
  if (notifTimer) clearTimeout(notifTimer)
  notifTimer = setTimeout(() => n.style.opacity = '0', 2200)
}

// DINHEIRO 

export function addMoney(amount) {
  money += amount
  document.getElementById('money').textContent = money.toFixed(2).replace('.', ',') + ' €'
  const m = document.getElementById('money-box')
  m.style.boxShadow = '0 0 30px #c8960c, inset 0 0 20px rgba(255,220,100,0.3)'
  setTimeout(() => m.style.boxShadow = '', 600)
  if (money > highScore) {
    highScore = money
    localStorage.setItem('padaria_highscore', highScore)
    document.getElementById('high-score').textContent = highScore.toFixed(2).replace('.', ',') + ' €'
  }
}
export function updateStats(served) {
    if (served) servedCount++; else lostCount++;
    document.getElementById('stat-served').textContent = servedCount;
    document.getElementById('stat-lost').textContent = lostCount;
}

// RECEITA 
const STEPS = ['step-dough', 'step-knead', 'step-oven', 'step-bake', 'step-take', 'step-sell']

export function updateRecipe(player, ovenBread, currentRecipe, carryingRecipe) {
  const activeRecipe = carryingRecipe || currentRecipe;
  const nameEl = document.getElementById('active-recipe-name');
  if (nameEl && activeRecipe) {
    nameEl.textContent = activeRecipe.name;
  }

  const idx = player.hasBread         ? 5  // Vender (R)
    : ovenBread && ovenBread.done     ? 4  // Tirar do forno
    : ovenBread                       ? 3  // Aguardar cozedura
    : player.hasKneadedDough          ? 2  // Levar ao forno
    : player.hasDough                 ? 1  // Amassar (Q)
    : 0                                    // Pegar massa
    
  STEPS.forEach((s, i) => {
    const el = document.getElementById(s)
    if (el) {
      el.className = 'recipe-step' + (i < idx ? ' done' : i === idx ? ' active' : '')
    }
  })
}

// HUD GERAL 
export function updateHUD(player, ovenBread, ovenTotal) {
  let s = 'Mãos livres'
  if (player.hasDough)         s = '🥣 Com massa crua'
  else if (player.hasKneadedDough) s = '💪 Massa amassada'
  else if (player.hasBread)    s = '🍞 Com pão'
  document.getElementById('state').textContent = s

  if (ovenBread) {
    const t = Math.min(ovenBread.time, ovenTotal)
    document.getElementById('oven-timer').textContent = 'A cozinhar... ' + (ovenTotal - t).toFixed(1) + 's'
    document.getElementById('oven-bar').style.width = (t / ovenTotal * 100) + '%'
  } else {
    document.getElementById('oven-timer').textContent = 'Vazio'
    document.getElementById('oven-bar').style.width = '0%'
  }
}

// PÃO NO FORNO 
export class OvenBread {
  constructor(recipeName) {
    this.recipeName = recipeName
    this.mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.28, 16),
      new THREE.MeshStandardMaterial({ color: '#d4b87a', roughness: 0.85 }))
    this.mesh.position.set(0, 0.85, -11.8)
    scene.add(this.mesh)
    this.time = 0
    this.done = false
  }

  update(dt, ovenTotal) {
    this.time += dt
    const t = Math.min(this.time / ovenTotal, 1)
    this.mesh.material.color.lerp(new THREE.Color('#7a3010'), t)
    if (t >= 1 && !this.done) {
      this.done = true
      sfx.ovenDing()
      notify('🔔 Pão pronto! Pressiona SPACE')
    }
    return t >= 1
  }

  remove() { scene.remove(this.mesh) }
}
