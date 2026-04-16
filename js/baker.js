import * as THREE from 'three'
import { scene, M } from './scene.js'


export class Baker {
  constructor() {
    this.group = new THREE.Group()

    const skinMat   = new THREE.MeshStandardMaterial({ color: '#d4956a', roughness: 0.75, metalness: 0.0 })
    const shirtMat  = new THREE.MeshStandardMaterial({ color: '#f0ece0', roughness: 0.9 })
    const apronMat  = new THREE.MeshStandardMaterial({ color: '#dce8f0', roughness: 0.85 })
    const apronStr  = new THREE.MeshStandardMaterial({ color: '#c0d0e8', roughness: 0.85 })
    const pantsMat  = new THREE.MeshStandardMaterial({ color: '#3a4a5a', roughness: 0.85 })
    const shoesMat  = new THREE.MeshStandardMaterial({ color: '#1a1008', roughness: 0.7, metalness: 0.1 })
    const hairMat   = new THREE.MeshStandardMaterial({ color: '#2a1a08', roughness: 0.9 })
    const hatMat    = new THREE.MeshStandardMaterial({ color: '#fafaf2', roughness: 0.8 })
    const buttonMat = new THREE.MeshStandardMaterial({ color: '#88a0b8', metalness: 0.3, roughness: 0.5 })

    // PERNAS 
    this.legL = new THREE.Group()
    this.legR = new THREE.Group()
    const thighGeo = new THREE.CapsuleGeometry(0.14, 0.42, 6, 10)
    const thighL = new THREE.Mesh(thighGeo, pantsMat); thighL.position.y = -0.21; this.legL.add(thighL)
    const thighR = new THREE.Mesh(thighGeo, pantsMat); thighR.position.y = -0.21; this.legR.add(thighR)
    const shinGeo = new THREE.CapsuleGeometry(0.11, 0.4, 6, 10)
    const shinL = new THREE.Mesh(shinGeo, pantsMat); shinL.position.y = -0.62; this.legL.add(shinL)
    const shinR = new THREE.Mesh(shinGeo, pantsMat); shinR.position.y = -0.62; this.legR.add(shinR)
    const shoeGeo = new THREE.BoxGeometry(0.18, 0.1, 0.32)
    const shoeL = new THREE.Mesh(shoeGeo, shoesMat); shoeL.position.set(0, -0.88, 0.06); this.legL.add(shoeL)
    const shoeR = new THREE.Mesh(shoeGeo, shoesMat); shoeR.position.set(0, -0.88, 0.06); this.legR.add(shoeR)
    const toeGeo = new THREE.SphereGeometry(0.1, 8, 6)
    const toeL = new THREE.Mesh(toeGeo, shoesMat); toeL.position.set(0, -0.84, 0.17); toeL.scale.set(0.95, 0.65, 1); this.legL.add(toeL)
    const toeR = new THREE.Mesh(toeGeo, shoesMat); toeR.position.set(0, -0.84, 0.17); toeR.scale.set(0.95, 0.65, 1); this.legR.add(toeR)

    this.legL.position.set(-0.16, 0.88, 0); this.group.add(this.legL)
    this.legR.position.set( 0.16, 0.88, 0); this.group.add(this.legR)

    // TORSO 
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.55, 8, 14), shirtMat)
    torso.position.y = 1.22; torso.castShadow = true; this.group.add(torso)
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 8, 16), shirtMat)
    collar.rotation.x = Math.PI / 2; collar.position.set(0, 1.62, 0.05); this.group.add(collar)
    // botões da camisa
    for (let i = 0; i < 3; i++) {
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.04, 8), buttonMat)
      btn.rotation.x = Math.PI / 2; btn.position.set(0.04, 1.55 - i * 0.18, 0.32); this.group.add(btn)
    }
    const seamGeo = new THREE.TorusGeometry(0.14, 0.015, 6, 16, Math.PI)
    const seamL = new THREE.Mesh(seamGeo, new THREE.MeshStandardMaterial({ color: '#ddd8cc', roughness: 0.9 }))
    seamL.position.set(-0.33, 1.38, 0); seamL.rotation.set(0, 0, Math.PI / 2); this.group.add(seamL)

    // AVENTAL 
    const apronBody = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.85, 0.06), apronMat)
    apronBody.position.set(0, 1.0, 0.31); this.group.add(apronBody)
    const apronBib = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.38, 0.06), apronMat)
    apronBib.position.set(0, 1.55, 0.31); this.group.add(apronBib)
    const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.04), new THREE.MeshStandardMaterial({ color: '#c8d8e8', roughness: 0.85 }))
    pocket.position.set(-0.1, 0.9, 0.35); this.group.add(pocket)
    const pocketTop = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.02, 0.04), new THREE.MeshStandardMaterial({ color: '#a8c0d4' }))
    pocketTop.position.set(-0.1, 0.975, 0.35); this.group.add(pocketTop)
    const strL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.5), apronStr)
    strL.rotation.y = 0.3; strL.position.set(-0.35, 1.0, 0.15); this.group.add(strL)
    const strR = strL.clone(); strR.rotation.y = -0.3; strR.position.set(0.35, 1.0, 0.15); this.group.add(strR)
    const neckStr = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 8), apronStr)
    neckStr.rotation.z = 0.15; neckStr.position.set(0, 1.68, 0.18); this.group.add(neckStr)
    // farinha no avental
    const flourDust = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 0.25), new THREE.MeshStandardMaterial({ color: '#f0ece4', transparent: true, opacity: 0.5, roughness: 1 }))
    flourDust.position.set(-0.05, 1.0, 0.345); this.group.add(flourDust)

    // BRAÇOS 
    this.armLGroup = new THREE.Group()
    this.armRGroup = new THREE.Group()
    const uArmGeo = new THREE.CapsuleGeometry(0.115, 0.36, 6, 10)
    const uArmL = new THREE.Mesh(uArmGeo, shirtMat); uArmL.position.y = -0.18; this.armLGroup.add(uArmL)
    const uArmR = new THREE.Mesh(uArmGeo, shirtMat); uArmR.position.y = -0.18; this.armRGroup.add(uArmR)
    const fArmGeo = new THREE.CapsuleGeometry(0.095, 0.32, 6, 10)
    const fArmL = new THREE.Mesh(fArmGeo, skinMat); fArmL.position.y = -0.54; this.armLGroup.add(fArmL)
    const fArmR = new THREE.Mesh(fArmGeo, skinMat); fArmR.position.y = -0.54; this.armRGroup.add(fArmR)
    const cuffGeo = new THREE.CylinderGeometry(0.12, 0.115, 0.1, 12)
    const cuffL = new THREE.Mesh(cuffGeo, new THREE.MeshStandardMaterial({ color: '#e0dcd0', roughness: 0.8 }))
    cuffL.position.y = -0.38; this.armLGroup.add(cuffL)
    const cuffR = cuffL.clone(); this.armRGroup.add(cuffR)
    const handGeo = new THREE.SphereGeometry(0.1, 10, 8)
    const handL = new THREE.Mesh(handGeo, skinMat); handL.position.y = -0.72; handL.scale.set(1, 0.85, 1.1); this.armLGroup.add(handL)
    const handR = new THREE.Mesh(handGeo, skinMat); handR.position.y = -0.72; handR.scale.set(1, 0.85, 1.1); this.armRGroup.add(handR)
    const thumbGeo = new THREE.CapsuleGeometry(0.035, 0.08, 4, 6)
    const thumbL = new THREE.Mesh(thumbGeo, skinMat); thumbL.position.set( 0.1, -0.7, 0.04); thumbL.rotation.z =  0.6; this.armLGroup.add(thumbL)
    const thumbR = new THREE.Mesh(thumbGeo, skinMat); thumbR.position.set(-0.1, -0.7, 0.04); thumbR.rotation.z = -0.6; this.armRGroup.add(thumbR)

    this.armLGroup.position.set(-0.44, 1.5, 0); this.armLGroup.rotation.z =  0.25; this.group.add(this.armLGroup)
    this.armRGroup.position.set( 0.44, 1.5, 0); this.armRGroup.rotation.z = -0.25; this.group.add(this.armRGroup)

    // PESCOÇO 
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.16, 0.22, 12), skinMat)
    neck.position.set(0, 1.64, 0); this.group.add(neck)

    // CABEÇA 
    this.headGroup = new THREE.Group()
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 14), skinMat)
    skull.scale.set(1, 1.08, 0.96); this.headGroup.add(skull)
    const jaw = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), skinMat)
    jaw.position.set(0, -0.1, 0.06); jaw.scale.set(0.9, 0.65, 0.95); this.headGroup.add(jaw)

    // olhos
    const eyeWhiteGeo = new THREE.SphereGeometry(0.045, 10, 8)
    const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: '#f8f4ee', roughness: 0.6 })
    const eyeIrisMat  = new THREE.MeshStandardMaterial({ color: '#3a2808', roughness: 0.5 })
    const eyePupilMat = new THREE.MeshStandardMaterial({ color: '#080400', roughness: 0.3 })
    for (let ex of [-0.1, 0.1]) {
      const eW = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat); eW.position.set(ex, 0.06, 0.22); this.headGroup.add(eW)
      const eI = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), eyeIrisMat);  eI.position.set(ex, 0.06, 0.255); this.headGroup.add(eI)
      const eP = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), eyePupilMat); eP.position.set(ex, 0.06, 0.265); this.headGroup.add(eP)
      const brow = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.018, 0.015), new THREE.MeshStandardMaterial({ color: '#1a0e04', roughness: 0.9 }))
      brow.position.set(ex, 0.115, 0.215); brow.rotation.z = ex < 0 ? 0.15 : -0.15; this.headGroup.add(brow)
    }
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), skinMat)
    nose.position.set(0, -0.02, 0.265); nose.scale.set(1.1, 0.8, 1); this.headGroup.add(nose)
    const mouthGeo = new THREE.TorusGeometry(0.05, 0.014, 6, 12, Math.PI)
    const mouth = new THREE.Mesh(mouthGeo, new THREE.MeshStandardMaterial({ color: '#b06050', roughness: 0.8 }))
    mouth.position.set(0, -0.085, 0.245); mouth.rotation.x = 0.3; this.headGroup.add(mouth)
    for (let ex of [-1, 1]) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), skinMat)
      ear.position.set(ex * 0.265, 0.0, 0.0); ear.scale.set(0.5, 0.7, 0.6); this.headGroup.add(ear)
    }
    // cabelo
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.265, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat)
    hairCap.position.set(0, 0.04, 0); this.headGroup.add(hairCap)
    for (let sx of [-1, 1]) {
      const sb = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.06), hairMat)
      sb.position.set(sx * 0.26, -0.08, 0.1); this.headGroup.add(sb)
    }
    // bigode
    for (let mx of [-1, 1]) {
      const mus = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), hairMat)
      mus.position.set(mx * 0.055, -0.038, 0.255); mus.scale.set(1.2, 0.7, 0.8); this.headGroup.add(mus)
    }
    this.headGroup.position.set(0, 1.9, 0)
    this.group.add(this.headGroup)

    // Chapeu CHEF 
    const hatGroup = new THREE.Group()
    const hatBand = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.16, 20), new THREE.MeshStandardMaterial({ color: '#e8e8e0', roughness: 0.7 }))
    hatBand.position.y = 0; hatGroup.add(hatBand)
    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.289, 0.289, 0.05, 20), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.7 }))
    stripe.position.y = 0.03; hatGroup.add(stripe)
    const hat1 = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.275, 0.18, 16), hatMat); hat1.position.y = 0.17; hatGroup.add(hat1)
    const hat2 = new THREE.Mesh(new THREE.CylinderGeometry(0.265, 0.27, 0.16, 16), hatMat); hat2.position.y = 0.33; hatGroup.add(hat2)
    const hat3 = new THREE.Mesh(new THREE.CylinderGeometry(0.255, 0.265, 0.16, 16), hatMat); hat3.position.y = 0.47; hatGroup.add(hat3)
    const hat4 = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.255, 0.16, 16), hatMat);  hat4.position.y = 0.61; hatGroup.add(hat4)
    const hatTop = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5), hatMat)
    hatTop.position.y = 0.69; hatGroup.add(hatTop)
    const hatShadow = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.285, 0.04, 20), new THREE.MeshStandardMaterial({ color: '#d8d4cc', roughness: 0.8 }))
    hatShadow.position.y = 0.02; hatGroup.add(hatShadow)
    hatGroup.position.set(0, 2.165, 0)
    this.group.add(hatGroup)

    // sombra no chão
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), new THREE.MeshStandardMaterial({ color: '#8a6040', transparent: true, opacity: 0.35, roughness: 1 }))
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.005; this.group.add(shadow)

    this.hasDough = false; this.hasKneadedDough = false; this.hasBread = false
    this.item = null; this.kneadCount = 0
    this._walkT = 0

    scene.add(this.group)
  }

  // atualiza o item que o padeiro está a segurar
  updateItem() {
    if (this.item) this.armRGroup.remove(this.item)
    this.item = null
    if (this.hasDough) {
      this.item = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), M.doughRaw)
    } else if (this.hasKneadedDough) {
      const g = new THREE.Group()
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), new THREE.MeshStandardMaterial({ color: '#c8a858', roughness: 0.85 }))
      g.add(ball)
      for (let i = 0; i < 3; i++) {
        const spot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), new THREE.MeshStandardMaterial({ color: '#f0ece4', transparent: true, opacity: 0.7 }))
        spot.position.set(Math.cos(i * 2.1) * 0.12, Math.sin(i * 1.3) * 0.1, 0.14); g.add(spot)
      }
      this.item = g
    } else if (this.hasBread) {
      const g = new THREE.Group()
      const loaf = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.55, 16), M.breadDone); loaf.rotation.z = Math.PI / 2; g.add(loaf)
      const end1 = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), new THREE.MeshStandardMaterial({ color: '#6a2e08', roughness: 0.55 })); end1.position.set(0.275, 0, 0); end1.scale.set(0.5, 1, 1); g.add(end1)
      const end2 = end1.clone(); end2.position.set(-0.275, 0, 0); g.add(end2)
      // cortes no pão
      for (let i = 0; i < 3; i++) {
        const score = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.22, 0.04), new THREE.MeshStandardMaterial({ color: '#3a1204', roughness: 0.7 }))
        score.position.set(-0.12 + i * 0.12, 0.17, 0); g.add(score)
      }
      this.item = g
    }
    if (this.item) { this.item.position.set(0.1, -0.75, 0.12); this.armRGroup.add(this.item) }
  }

  // animação de andar e idle
  walkAnim(dt, isMoving) {
    this._walkT += dt
    const t = this._walkT
    if (isMoving) {
      this.legL.rotation.x =  Math.sin(t * 6) * 0.38
      this.legR.rotation.x = -Math.sin(t * 6) * 0.38
      this.armLGroup.rotation.x =  Math.sin(t * 6) * 0.28
      this.armRGroup.rotation.x = -Math.sin(t * 6) * 0.28
      this.group.position.y = Math.abs(Math.sin(t * 6)) * 0.04
    } else {
      this.legL.rotation.x      += (0 - this.legL.rotation.x) * 0.12
      this.legR.rotation.x      += (0 - this.legR.rotation.x) * 0.12
      this.armLGroup.rotation.x += (0 - this.armLGroup.rotation.x) * 0.12
      this.armRGroup.rotation.x += (0 - this.armRGroup.rotation.x) * 0.12
      this.group.position.y     += (0 - this.group.position.y) * 0.1
      this.headGroup.rotation.z  = Math.sin(t * 0.8) * 0.02
    }
    this.armLGroup.rotation.z =  0.25 + Math.sin(t * 0.5) * 0.03
    this.armRGroup.rotation.z = -0.25 - Math.sin(t * 0.5) * 0.03
  }
}
