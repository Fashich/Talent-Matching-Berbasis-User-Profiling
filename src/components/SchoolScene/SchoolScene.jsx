import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene 3D gedung sekolah untuk hero Landing — siklus 24 jam (=120 detik
// nyata), orang-orangan berjalan sesuai jam sekolah, tanpa auto-rotate
// (user drag sendiri). Diporting dari
// design_handoff_landing_login/design-refs/Landing.dc.html (blok
// <script type="module">, three.js murni) — logika & angka dipertahankan
// apa adanya kecuali disebutkan lain di komentar. Semua tekstur prosedural
// via Canvas 2D, tidak ada file gambar eksternal (kecuali logo sekolah utk
// papan nama).
//
// Referensi spesifikasi: design_handoff_landing_login/README.md §1.3.

function cv(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function wrapt(t, rx, ry) {
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  return t;
}

function texWall(base, line) {
  const c = cv(256, 256);
  const x = c.getContext('2d');
  x.fillStyle = base;
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 3200; i++) {
    x.fillStyle = 'rgba(0,0,0,0.04)';
    x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  for (let i = 0; i < 900; i++) {
    x.fillStyle = 'rgba(255,255,255,0.05)';
    x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  x.globalAlpha = 0.22;
  x.strokeStyle = line;
  x.lineWidth = 2;
  for (let y = 32; y < 256; y += 64) {
    x.beginPath();
    x.moveTo(0, y);
    x.lineTo(256, y);
    x.stroke();
  }
  x.globalAlpha = 0.16;
  x.fillStyle = '#000';
  x.fillRect(0, 236, 256, 20);
  return new THREE.CanvasTexture(c);
}

function texBrick() {
  const c = cv(256, 256);
  const x = c.getContext('2d');
  x.fillStyle = '#8e5a4c';
  x.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 16; row++) {
    for (let col = 0; col < 9; col++) {
      const off = row % 2 ? 14 : 0;
      x.fillStyle = row % 3 === 0 ? '#a6604d' : col % 2 ? '#95513f' : '#9e5a47';
      x.fillRect(col * 29 + off, row * 16 + 2, 26, 12);
    }
  }
  return new THREE.CanvasTexture(c);
}

function texRoof() {
  const c = cv(256, 256);
  const x = c.getContext('2d');
  x.fillStyle = '#8e3520';
  x.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 15; row++) {
    for (let col = 0; col < 12; col++) {
      const off = row % 2 ? 11 : 0;
      x.fillStyle = row % 2 ? '#c0532f' : '#b0482a';
      x.beginPath();
      x.roundRect(col * 22 + off, row * 17, 20, 15, 4);
      x.fill();
      x.strokeStyle = 'rgba(0,0,0,0.22)';
      x.lineWidth = 1.5;
      x.stroke();
    }
  }
  return new THREE.CanvasTexture(c);
}

function texPave() {
  const c = cv(512, 512);
  const x = c.getContext('2d');
  x.fillStyle = '#9ba3ad';
  x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 6000; i++) {
    x.fillStyle = 'rgba(0,0,0,0.05)';
    x.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
  }
  x.strokeStyle = 'rgba(70,76,86,0.55)';
  x.lineWidth = 2;
  for (let i = 0; i <= 512; i += 64) {
    x.beginPath();
    x.moveTo(i, 0);
    x.lineTo(i, 512);
    x.stroke();
    x.beginPath();
    x.moveTo(0, i);
    x.lineTo(512, i);
    x.stroke();
  }
  for (let i = 0; i < 26; i++) {
    x.fillStyle = 'rgba(120,126,134,0.30)';
    x.beginPath();
    x.arc(Math.random() * 512, Math.random() * 512, 8 + Math.random() * 26, 0, 6.3);
    x.fill();
  }
  return new THREE.CanvasTexture(c);
}

function texPanes(cols, rows, frame, lit) {
  const c = cv(1024, 512);
  const x = c.getContext('2d');
  x.fillStyle = frame;
  x.fillRect(0, 0, 1024, 512);
  const pw = 1024 / cols;
  const ph = 512 / rows;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const gx = i * pw + 12;
      const gy = j * ph + 12;
      const gw = pw - 24;
      const gh = ph - 24;
      const warm = (i * 3 + j * 5) % 4 !== 0;
      x.save();
      x.beginPath();
      x.rect(gx, gy, gw, gh);
      x.clip();
      const room2 = x.createLinearGradient(gx, gy, gx, gy + gh);
      if (lit) {
        room2.addColorStop(0, warm ? '#ffcf78' : '#1d1710');
        room2.addColorStop(1, warm ? '#c98b35' : '#120e09');
      } else {
        room2.addColorStop(0, '#53616e');
        room2.addColorStop(0.5, '#303a45');
        room2.addColorStop(1, '#1a2028');
      }
      x.fillStyle = room2;
      x.fillRect(gx, gy, gw, gh);
      x.fillStyle = lit && warm ? 'rgba(120,78,26,0.6)' : 'rgba(10,14,20,0.5)';
      for (let d = 0; d < 3; d++) x.fillRect(gx + 8 + d * (gw / 3), gy + gh * 0.56, gw / 4.6, gh * 0.32);
      x.fillStyle = lit && warm ? 'rgba(255,244,214,0.85)' : 'rgba(228,238,248,0.10)';
      x.fillRect(gx + gw * 0.32, gy + 6, gw * 0.36, 7);
      const ref = x.createLinearGradient(gx, gy + gh, gx + gw, gy);
      ref.addColorStop(0, 'rgba(255,255,255,0.02)');
      ref.addColorStop(0.48, 'rgba(206,232,255,0.20)');
      ref.addColorStop(0.62, 'rgba(255,255,255,0.05)');
      ref.addColorStop(1, 'rgba(255,255,255,0.02)');
      x.fillStyle = ref;
      x.fillRect(gx, gy, gw, gh);
      x.restore();
      x.strokeStyle = frame;
      x.lineWidth = 10;
      x.strokeRect(gx, gy, gw, gh);
      x.lineWidth = 6;
      x.beginPath();
      x.moveTo(gx + gw / 2, gy);
      x.lineTo(gx + gw / 2, gy + gh);
      x.stroke();
      x.beginPath();
      x.moveTo(gx, gy + gh * 0.44);
      x.lineTo(gx + gw, gy + gh * 0.44);
      x.stroke();
    }
  }
  return new THREE.CanvasTexture(c);
}

function texSign(txt) {
  const c = cv(2048, 256);
  const x = c.getContext('2d');
  const grd = x.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, '#3a94d6');
  grd.addColorStop(1, '#17598f');
  x.fillStyle = grd;
  x.fillRect(0, 0, 2048, 256);
  x.fillStyle = '#0d4470';
  x.fillRect(0, 0, 2048, 15);
  x.fillRect(0, 241, 2048, 15);
  let size = 156;
  x.font = 'bold ' + size + 'px Arial, Helvetica, sans-serif';
  while (x.measureText(txt).width > 1860 && size > 42) {
    size -= 4;
    x.font = 'bold ' + size + 'px Arial, Helvetica, sans-serif';
  }
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillStyle = 'rgba(0,0,0,0.4)';
  x.fillText(txt, 1028, 136);
  x.fillStyle = '#ffffff';
  x.fillText(txt, 1024, 130);
  return new THREE.CanvasTexture(c);
}

function texWood() {
  const c = cv(256, 256);
  const x = c.getContext('2d');
  x.fillStyle = '#8b4f27';
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 80; i++) {
    x.strokeStyle = 'rgba(48,22,6,' + (0.05 + Math.random() * 0.1).toFixed(3) + ')';
    x.lineWidth = 1 + Math.random() * 3.2;
    const y0 = Math.random() * 256;
    x.beginPath();
    x.moveTo(0, y0);
    x.bezierCurveTo(85, y0 + Math.random() * 18 - 9, 170, y0 + Math.random() * 18 - 9, 256, y0 + Math.random() * 12 - 6);
    x.stroke();
  }
  for (let i = 0; i < 46; i++) {
    x.strokeStyle = 'rgba(255,214,166,0.07)';
    x.lineWidth = 2;
    const y0 = Math.random() * 256;
    x.beginPath();
    x.moveTo(0, y0);
    x.lineTo(256, y0 + Math.random() * 8 - 4);
    x.stroke();
  }
  return new THREE.CanvasTexture(c);
}

function texRail() {
  const c = cv(128, 64);
  const x = c.getContext('2d');
  x.clearRect(0, 0, 128, 64);
  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, 128, 9);
  x.fillRect(0, 55, 128, 9);
  for (let i = 5; i < 128; i += 14) x.fillRect(i, 0, 5, 64);
  return wrapt(new THREE.CanvasTexture(c), 1, 1);
}

function texGable() {
  const c = cv(256, 256);
  const x = c.getContext('2d');
  x.fillStyle = '#f0c33c';
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2200; i++) {
    x.fillStyle = 'rgba(0,0,0,0.035)';
    x.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
  }
  x.strokeStyle = 'rgba(255,255,255,0.35)';
  x.lineWidth = 6;
  x.strokeRect(26, 26, 204, 204);
  return new THREE.CanvasTexture(c);
}

function makeHuman(shirt, pants, skin, hair, tall) {
  const root = new THREE.Group();
  const parts = [];
  function put(geo, color, rough) {
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: rough === undefined ? 0.75 : rough, transparent: true }));
    m.castShadow = true;
    parts.push(m);
    return m;
  }
  const torso = put(new THREE.CapsuleGeometry(0.135, 0.36, 6, 14), shirt);
  torso.position.y = 1.1;
  root.add(torso);
  const neck = put(new THREE.CylinderGeometry(0.05, 0.06, 0.07, 8), skin);
  neck.position.y = 1.38;
  root.add(neck);
  const head = put(new THREE.SphereGeometry(0.125, 20, 18), skin, 0.62);
  head.position.y = 1.49;
  root.add(head);
  const cap = put(new THREE.SphereGeometry(0.131, 20, 16, 0, 6.3, 0, 1.5), hair, 0.85);
  cap.position.y = 1.495;
  root.add(cap);
  const arms = [];
  const shoes = [];
  const limbs = [];
  [-1, 1].forEach((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.18, 1.31, 0);
    const upper = put(new THREE.CapsuleGeometry(0.048, 0.3, 4, 10), shirt);
    upper.position.y = -0.18;
    pivot.add(upper);
    const hand = put(new THREE.SphereGeometry(0.052, 10, 10), skin, 0.6);
    hand.position.y = -0.37;
    pivot.add(hand);
    root.add(pivot);
    arms.push(pivot);
  });
  [-1, 1].forEach((side) => {
    const pivot = new THREE.Group();
    pivot.position.set(side * 0.085, 0.86, 0);
    const thigh = put(new THREE.CapsuleGeometry(0.062, 0.4, 4, 10), pants);
    thigh.position.y = -0.24;
    pivot.add(thigh);
    const shoe = put(new THREE.BoxGeometry(0.11, 0.07, 0.22), 0x22252b, 0.6);
    shoe.position.set(0, -0.49, 0.03);
    pivot.add(shoe);
    root.add(pivot);
    limbs.push(pivot);
    shoes.push(shoe);
  });
  root.scale.setScalar(tall || 1);
  root.userData.arms = arms;
  root.userData.limbs = limbs;
  root.userData.parts = parts;
  return root;
}

/**
 * Inisialisasi scene ke `canvas` yang diberikan. Mengembalikan `{ dispose }`
 * untuk dipanggil saat komponen unmount.
 */
function initScene(canvas) {
  try {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0); // transparan — background halaman (pageBg) yang tampil di belakang, bukan skybox
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;

    const scene = new THREE.Scene();
    // fov/posisi/target sesuai README §1.3 "Renderer & kamera"
    const camera = new THREE.PerspectiveCamera(38, 1, 0.5, 400);
    camera.position.set(-36, 23, 60);
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 5.2, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.enablePan = false;
    controls.minDistance = 30;
    controls.maxDistance = 110;
    controls.maxPolarAngle = Math.PI * 0.487;
    controls.autoRotate = false;
    controls.update();

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const hemi = new THREE.HemisphereLight(0xbcd8ff, 0x4a4037, 0.5);
    const sol = new THREE.DirectionalLight(0xffffff, 2.1);
    sol.castShadow = true;
    sol.shadow.mapSize.set(2048, 2048);
    sol.shadow.camera.left = -34;
    sol.shadow.camera.right = 34;
    sol.shadow.camera.top = 34;
    sol.shadow.camera.bottom = -34;
    sol.shadow.camera.far = 140;
    sol.shadow.bias = -0.0006;
    scene.add(ambient, hemi, sol);

    const solball = new THREE.Mesh(new THREE.SphereGeometry(1.5, 20, 20), new THREE.MeshBasicMaterial({ color: 0xfff2c0 }));
    const lunaball = new THREE.Mesh(new THREE.SphereGeometry(1.05, 20, 20), new THREE.MeshBasicMaterial({ color: 0xe8eefc }));
    scene.add(solball, lunaball);

    const stars = new THREE.Points(
      (() => {
        const g = new THREE.BufferGeometry();
        const arr = [];
        for (let i = 0; i < 420; i++) {
          const th = Math.random() * Math.PI * 2;
          const ph = Math.random() * 0.72;
          arr.push(Math.cos(th) * Math.cos(ph) * 150, Math.sin(ph) * 150 + 6, Math.sin(th) * Math.cos(ph) * 150);
        }
        g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
        return g;
      })(),
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, transparent: true, opacity: 0 })
    );
    scene.add(stars);

    const pave = wrapt(texPave(), 3, 3);
    const fadeCanvas = cv(256, 256);
    {
      const fx = fadeCanvas.getContext('2d');
      const fg = fx.createRadialGradient(128, 128, 30, 128, 128, 126);
      fg.addColorStop(0, '#ffffff');
      fg.addColorStop(0.52, '#ffffff');
      fg.addColorStop(0.84, '#8a8a8a');
      fg.addColorStop(1, '#000000');
      fx.fillStyle = fg;
      fx.fillRect(0, 0, 256, 256);
    }
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(26, 64),
      new THREE.MeshStandardMaterial({ map: pave, alphaMap: new THREE.CanvasTexture(fadeCanvas), transparent: true, roughness: 0.95 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const wallCream = texWall('#efe7d4', '#cfc3a8');
    const wallGreen = texWall('#a9cf5f', '#7fa63f');
    const brick = texBrick();
    const roofT = texRoof();
    const gableT = texGable();
    const panesDay = texPanes(6, 2, '#e8edf3', false);
    const panesLit = texPanes(6, 2, '#e8edf3', true);
    const railT = texRail();
    const signT = texSign('SMKS RAJASA SURABAYA');

    const litMats = [];
    const fh = 3.3;

    function box(w, h, d, x, y, z, tex, rx, ry, color) {
      const mat = new THREE.MeshStandardMaterial({ roughness: 0.9 });
      if (tex) {
        const t = tex.clone();
        t.needsUpdate = true;
        wrapt(t, rx || 1, ry || 1);
        mat.map = t;
      }
      if (color !== undefined) mat.color = new THREE.Color(color);
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      return m;
    }

    function paneStrip(w, h, x, y, z, ry) {
      const day = panesDay.clone();
      day.needsUpdate = true;
      wrapt(day, Math.max(1, Math.round(w / 3.4)), 1);
      const lit = panesLit.clone();
      lit.needsUpdate = true;
      wrapt(lit, Math.max(1, Math.round(w / 3.4)), 1);
      const mat = new THREE.MeshStandardMaterial({ map: day, emissiveMap: lit, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0, roughness: 0.35, metalness: 0.1 });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      m.position.set(x, y, z);
      if (ry) m.rotation.y = ry;
      scene.add(m);
      litMats.push(mat);
      return m;
    }

    function railing(w, x, y, z, ry) {
      const t = railT.clone();
      t.needsUpdate = true;
      wrapt(t, Math.round(w / 1.1), 1);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.05), new THREE.MeshStandardMaterial({ color: 0x2f86c8, alphaMap: t, transparent: true, roughness: 0.5, side: THREE.DoubleSide }));
      m.position.set(x, y, z);
      if (ry) m.rotation.y = ry;
      m.castShadow = true;
      scene.add(m);
      return m;
    }

    function tiledRoof(w, d, x, y, z, ry) {
      const shape = new THREE.Shape();
      shape.moveTo(-w / 2, 0);
      shape.lineTo(w / 2, 0);
      shape.lineTo(0, w * 0.17);
      shape.lineTo(-w / 2, 0);
      const geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
      geo.translate(0, 0, -d / 2);
      const t = roofT.clone();
      t.needsUpdate = true;
      wrapt(t, Math.round(w / 2), Math.round(d / 2));
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: t, roughness: 0.85 }));
      m.rotation.x = -Math.PI / 2;
      m.rotation.z = ry || 0;
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      scene.add(m);
      const eave = box(w + 0.7, 0.22, d + 0.7, x, y - 0.06, z, null, 1, 1, 0xe9e2d2);
      if (ry) eave.rotation.y = ry;
      return m;
    }

    function block(w, d, x, z, ry, floors) {
      const front = d / 2 + 0.02;
      const n = floors || 3;
      box(w, fh, d, x, fh / 2, z, brick, Math.round(w / 3), 1);
      for (let i = 0; i < Math.round(w / 3.4); i++) {
        const px = x - w / 2 + 1.7 + i * 3.4;
        box(0.85, fh - 0.3, 0.62, ry ? x + front : px, (fh - 0.3) / 2, ry ? z - w / 2 + 1.7 + i * 3.4 : z + front, brick, 1, 1);
      }
      for (let f = 1; f < n; f++) {
        box(w, fh, d, x, fh * f + fh / 2, z, f % 2 ? wallGreen : wallCream, Math.round(w / 3), 1);
        box(w + 0.55, 0.32, d + 1.5, x, fh * f + 0.1, z, null, 1, 1, 0xdad4c4);
        box(w + 0.2, 0.16, d + 1.2, x, fh * f + 0.34, z, null, 1, 1, 0x2f86c8);
        if (!ry) {
          paneStrip(w - 1.4, 1.75, x, fh * f + 1.95, z + front + 0.72);
          railing(w + 0.45, x, fh * f + 0.78, z + front + 0.74);
          paneStrip(w - 1.8, 1.5, x, fh * f + 1.95, z - front - 0.06, Math.PI);
        } else {
          const sd = ry < 0 ? -1 : 1;
          paneStrip(d - 1.4, 1.75, x + sd * (front + 0.72), fh * f + 1.95, z, (sd * -Math.PI) / 2);
          railing(d + 0.45, x + sd * (front + 0.74), fh * f + 0.78, z, (sd * -Math.PI) / 2);
          paneStrip(d - 1.8, 1.5, x - sd * (front + 0.06), fh * f + 1.95, z, (sd * Math.PI) / 2);
        }
      }
      return fh * n;
    }

    function gazebo(gx, gz) {
      const woodA = new THREE.MeshStandardMaterial({ map: wrapt(texWood(), 1, 3), roughness: 0.6 });
      const woodB = new THREE.MeshStandardMaterial({ map: wrapt(texWood(), 3, 1), roughness: 0.6 });
      const g = new THREE.Group();
      const deck = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.3, 3.6), woodB);
      deck.position.y = 0.66;
      g.add(deck);
      [
        [-1.55, -1.55],
        [1.55, -1.55],
        [-1.55, 1.55],
        [1.55, 1.55],
      ].forEach((p) => {
        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.66, 0.34), woodA);
        foot.position.set(p[0], 0.33, p[1]);
        g.add(foot);
        const col = new THREE.Mesh(new THREE.BoxGeometry(0.24, 2.6, 0.24), woodA);
        col.position.set(p[0], 2.11, p[1]);
        g.add(col);
      });
      for (let i = 0; i < 6; i++) {
        const y = 1.05 + i * 0.17;
        const s1 = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.12, 0.09), woodB);
        s1.position.set(0, y, -1.5);
        g.add(s1);
        const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 3.1), woodB);
        s2.position.set(-1.5, y, 0);
        g.add(s2);
        const s3 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.12, 3.1), woodB);
        s3.position.set(1.5, y, 0);
        g.add(s3);
      }
      const seat = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.15, 0.8), woodB);
      seat.position.set(0, 1.12, -1.05);
      g.add(seat);
      const beam = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.2, 3.5), woodA);
      beam.position.y = 3.3;
      g.add(beam);
      const roofMat = new THREE.MeshStandardMaterial({ map: wrapt(texRoof(), 3, 2), roughness: 0.8 });
      const r1 = new THREE.Mesh(new THREE.ConeGeometry(3.0, 0.85, 4, 1), roofMat);
      r1.rotation.y = Math.PI / 4;
      r1.position.y = 3.72;
      g.add(r1);
      const r2 = new THREE.Mesh(new THREE.ConeGeometry(1.85, 1.0, 4, 1), roofMat);
      r2.rotation.y = Math.PI / 4;
      r2.position.y = 4.55;
      g.add(r2);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.55, 8), new THREE.MeshStandardMaterial({ color: 0x8a4a2c, roughness: 0.65 }));
      tip.position.y = 5.28;
      g.add(tip);
      g.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
        }
      });
      g.position.set(gx, 0, gz);
      g.rotation.y = -0.22;
      scene.add(g);
      return g;
    }

    const centerH = block(19, 9, 0, -11, 0, 4);
    tiledRoof(19.6, 9.6, 0, centerH + 0.1, -11);
    block(9, 15, -14, -1, 1, 3);
    tiledRoof(9.6, 15.6, -14, fh * 3 + 0.1, -1, Math.PI / 2);
    block(9, 15, 14, -1, -1, 3);
    tiledRoof(9.6, 15.6, 14, fh * 3 + 0.1, -1, Math.PI / 2);

    box(5.2, 3.05, 0.34, 0, 1.52, -6.42, null, 1, 1, 0x1f2f42);
    paneStrip(4.6, 2.5, 0, 1.62, -6.2);
    box(6.2, 0.26, 1.9, 0, 3.2, -5.6, null, 1, 1, 0x2f86c8);
    [
      [-7.6, -6.35],
      [7.6, -6.35],
    ].forEach((p) => {
      box(1.15, 0.85, 0.55, p[0], fh * 2 + 2.55, p[1], null, 1, 1, 0xdadfe5);
      box(1.15, 0.85, 0.55, p[0], fh * 3 + 2.55, p[1], null, 1, 1, 0xdadfe5);
    });
    [
      [-9.45, -6.3],
      [9.45, -6.3],
    ].forEach((p) => {
      box(0.2, fh * 4, 0.2, p[0], fh * 2, p[1], null, 1, 1, 0xc7ccd3);
    });

    const gable = new THREE.Mesh(
      new THREE.ExtrudeGeometry(
        (() => {
          const s = new THREE.Shape();
          s.moveTo(-5.8, 0);
          s.lineTo(5.8, 0);
          s.lineTo(0, 3.5);
          s.lineTo(-5.8, 0);
          return s;
        })(),
        { depth: 0.5, bevelEnabled: false }
      ),
      new THREE.MeshStandardMaterial({ map: gableT, roughness: 0.85 })
    );
    gable.position.set(0, centerH + 0.1, -6.32);
    gable.castShadow = true;
    scene.add(gable);

    const sign = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 1.3), new THREE.MeshStandardMaterial({ map: signT, roughness: 0.45, transparent: true }));
    sign.position.set(0, centerH + 0.88, -5.78);
    scene.add(sign);
    const logoPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(1.75, 1.75),
      new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('/logo-rajasa-512.png'), transparent: true })
    );
    logoPlate.position.set(0, centerH + 2.18, -5.76);
    scene.add(logoPlate);
    const signGlow = new THREE.PointLight(0x9fd4ff, 0, 16);
    signGlow.position.set(0, centerH + 1.4, -4.2);
    scene.add(signGlow);

    box(0.17, 11, 0.17, 9.2, 5.5, 8.5, null, 1, 1, 0xd7dce4);
    const finialMat = new THREE.MeshStandardMaterial({ color: 0xf0c33c, roughness: 0.4, metalness: 0.45 });
    const finialBall = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 14), finialMat);
    finialBall.position.set(9.2, 11.05, 8.5);
    scene.add(finialBall);
    const finialCap = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 12), finialMat);
    finialCap.position.set(9.2, 11.42, 8.5);
    scene.add(finialCap);
    const flagCanvas = cv(128, 128);
    {
      const fx = flagCanvas.getContext('2d');
      fx.fillStyle = '#c8362a';
      fx.fillRect(0, 0, 128, 64);
      fx.fillStyle = '#f6f6f1';
      fx.fillRect(0, 64, 128, 64);
    }
    const flagGeo = new THREE.PlaneGeometry(3.4, 2.25, 26, 16);
    const flagBase = flagGeo.attributes.position.array.slice();
    const flag = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(flagCanvas), side: THREE.DoubleSide, roughness: 0.88 }));
    flag.position.set(10.95, 9.3, 8.5);
    flag.castShadow = true;
    scene.add(flag);

    gazebo(-7.8, 3.6);
    gazebo(7.8, 3.6);

    const lamps = [];
    [
      [-11.5, 10.5],
      [11.5, 10.5],
    ].forEach((p) => {
      box(0.18, 5.4, 0.18, p[0], 2.7, p[1], null, 1, 1, 0x9aa1ab);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffe9b0 }));
      bulb.position.set(p[0], 5.5, p[1]);
      scene.add(bulb);
      const light = new THREE.PointLight(0xffd79a, 0, 20);
      light.position.set(p[0], 5.3, p[1]);
      scene.add(light);
      lamps.push({ bulb, light });
    });

    [
      [-19, 13],
      [19, 13],
      [-21, -3],
      [21, -3],
    ].forEach((p) => {
      box(0.6, 2.6, 0.6, p[0], 1.3, p[1], null, 1, 1, 0x6b5340);
      [
        [0, 3.6, 2.3],
        [0.9, 4.5, 1.7],
        [-0.8, 4.4, 1.6],
      ].forEach((f) => {
        const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(f[2], 1), new THREE.MeshStandardMaterial({ color: 0x4f7b3a, roughness: 0.9, flatShading: true }));
        leaf.position.set(p[0] + f[0], f[1], p[1]);
        leaf.castShadow = true;
        scene.add(leaf);
      });
    });

    [
      [-8, 5.5, 0.4],
      [-6.6, 5.5, 0.4],
      [7.2, 5.2, -0.3],
      [8.6, 5.2, -0.3],
    ].forEach((p) => {
      box(1.5, 0.5, 0.55, p[0], 0.8, p[1], null, 1, 1, 0x2c3138);
      box(0.55, 0.5, 0.5, p[0] - 0.5, 1.15, p[1], null, 1, 1, 0x9aa4b2);
      [-0.55, 0.6].forEach((o) => {
        const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.11, 8, 16), new THREE.MeshStandardMaterial({ color: 0x1a1d22, roughness: 0.8 }));
        wheel.position.set(p[0] + o, 0.36, p[1]);
        wheel.rotation.y = Math.PI / 2;
        wheel.castShadow = true;
        scene.add(wheel);
      });
    });

    const skins = [0xe0b48c, 0xc98f65, 0xf0c9a3, 0xb07a52];
    const crowd = [];
    const paths = [
      [
        [2, 22],
        [1.5, 8],
        [0, 1],
      ],
      [
        [-3, 22],
        [-2, 9],
        [-5, 2],
      ],
      [
        [5, 21],
        [4, 10],
        [6, 3],
      ],
      [
        [-6, 20],
        [-6, 11],
        [-9, 4],
      ],
      [
        [8, 22],
        [7, 12],
        [9, 5],
      ],
      [
        [-1, 23],
        [-1, 10],
        [2, 4],
      ],
      [
        [4, 19],
        [5, 9],
        [11, 2],
      ],
      [
        [-9, 21],
        [-8, 10],
        [-11, 1],
      ],
      [
        [1, 20],
        [0, 12],
        [-3, 5],
      ],
      [
        [7, 23],
        [6, 13],
        [4, 6],
      ],
    ];
    for (let i = 0; i < 10; i++) {
      const one = makeHuman(i % 3 === 0 ? 0xf3f5fa : 0xe7edf7, 0x25334a, skins[i % 4], 0x1d1a18, 0.96 + Math.random() * 0.1);
      one.position.set(paths[i][0][0], 0, paths[i][0][1]);
      scene.add(one);
      crowd.push({ g: one, path: paths[i], step: 0, seed: Math.random() * 6 });
    }
    const mentor = makeHuman(0x2a4a74, 0x1b2634, skins[0], 0x17130f, 1.05);
    mentor.position.set(3, 0, 4);
    scene.add(mentor);
    const mentor2 = makeHuman(0x7a5230, 0x24262c, skins[2], 0x241d16, 1.02);
    mentor2.position.set(-4, 0, 6);
    scene.add(mentor2);
    const guard = makeHuman(0x5a6472, 0x2a2f38, skins[1], 0x191510, 1.03);
    guard.position.set(0, 0, 12);
    scene.add(guard);
    const torch = new THREE.PointLight(0xffe1a0, 0, 12);
    torch.position.set(0, 1.2, 12);
    scene.add(torch);

    function fade(group, v) {
      group.userData.parts.forEach((p) => {
        p.material.opacity = v;
        p.visible = v > 0.02;
      });
    }
    function walk(group, phase, moving) {
      const amt = moving ? 0.62 : 0.05;
      group.userData.limbs[0].rotation.x = Math.sin(phase) * amt;
      group.userData.limbs[1].rotation.x = -Math.sin(phase) * amt;
      group.userData.arms[0].rotation.x = -Math.sin(phase) * amt * 0.8;
      group.userData.arms[1].rotation.x = Math.sin(phase) * amt * 0.8;
      group.position.y = moving ? Math.abs(Math.sin(phase)) * 0.045 : 0;
    }
    function glide(group, tx, tz, rate) {
      const dx = tx - group.position.x;
      const dz = tz - group.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist > 0.12) {
        group.position.x += dx * rate;
        group.position.z += dz * rate;
        group.rotation.y = Math.atan2(dx, dz);
      }
      return dist;
    }

    // Canvas adalah replaced element: kalau CSS width/height dibiarkan
    // 'auto', ukurannya dipatok dari atribut width/height intrinsiknya
    // sendiri (bukan diregangkan oleh top+bottom+left+right) — jadi kita
    // HARUS set canvas.style.width/height eksplisit dari ukuran wrapper
    // (host), bukan dari canvas.getBoundingClientRect() sendiri. Kalau
    // dibaca dari canvas sendiri, tiap resize() akan membaca ukuran hasil
    // renderer.setSize() sebelumnya lalu membesarkannya lagi — feedback
    // loop yang bikin canvas membengkak sampai jutaan piksel.
    const host = canvas.parentElement;
    const BLEED_X = 30 + 230; // left + right, lihat README §1.2
    const BLEED_Y = 150 + 150; // top + bottom
    function resize() {
      const rect = host.getBoundingClientRect();
      const w = (rect.width || 620) + BLEED_X;
      const h = (rect.height || 480) + BLEED_Y;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(host);
    window.addEventListener('resize', resize);

    const span = 120000;
    const begin = performance.now() - (7.2 / 24) * span;
    let raf;

    function frame() {
      raf = requestAnimationFrame(frame);
      const now = performance.now();
      const hour = ((now - begin) % span) / span * 24;
      const secs = now / 1000;

      const ang = (hour / 24) * Math.PI * 2 - Math.PI / 2;
      const rad = 80;
      solball.position.set(Math.cos(ang) * rad, Math.sin(ang) * rad, -26);
      lunaball.position.set(Math.cos(ang + Math.PI) * rad, Math.sin(ang + Math.PI) * rad, -26);
      const up = solball.position.y > 0;
      solball.visible = up;
      lunaball.visible = !up;
      const alt = Math.max(0, Math.sin(ang));
      sol.position.copy(up ? solball.position : lunaball.position).multiplyScalar(0.55);
      sol.intensity = up ? 0.7 + alt * 2.1 : 0.22;
      sol.color.set(up ? (alt < 0.28 ? 0xffb070 : 0xfff3e2) : 0x93a9dd);
      ambient.intensity = 0.22 + alt * 0.5;
      hemi.intensity = 0.24 + alt * 0.5;
      renderer.toneMappingExposure = 0.92 + alt * 0.22;

      const dark = Math.min(1, Math.max(0, 1 - alt * 2.6));
      litMats.forEach((m) => {
        m.emissiveIntensity = dark * 1.5;
      });
      stars.material.opacity = dark * 0.95;
      lamps.forEach((l) => {
        l.light.intensity = dark * 26;
        l.bulb.material.color.setHex(dark > 0.4 ? 0xffe9b0 : 0x6b6f78);
      });
      signGlow.intensity = dark * 12;
      const fpos = flagGeo.attributes.position;
      for (let i = 0; i < fpos.count; i++) {
        const bx = flagBase[i * 3];
        const by = flagBase[i * 3 + 1];
        const k = (bx + 1.7) / 3.4;
        fpos.setZ(i, Math.sin(k * 6.4 - secs * 4.4) * 0.34 * k * k + Math.sin(by * 3.2 + secs * 2.4) * 0.09 * k);
        fpos.setY(i, by - Math.sin(k * 3.2 - secs * 3.1) * 0.06 * k);
      }
      fpos.needsUpdate = true;
      flagGeo.computeVertexNormals();

      const arrive = hour >= 6.4 && hour < 7.9;
      const brk = hour >= 11.5 && hour < 12.9;
      const leave = hour >= 15 && hour < 16.5;

      crowd.forEach((one, i) => {
        const phase = secs * 5.4 + one.seed;
        let tx;
        let tz;
        let vis = 0;
        if (arrive) {
          tx = one.path[2][0];
          tz = one.path[2][1];
          vis = 1;
        } else if (brk) {
          tx = one.path[1][0] + Math.sin(secs * 0.5 + i) * 2.4;
          tz = one.path[1][1] + Math.cos(secs * 0.4 + i) * 2.0;
          vis = 1;
        } else if (leave) {
          tx = one.path[0][0];
          tz = one.path[0][1];
          vis = 1;
        } else {
          tx = one.path[2][0];
          tz = one.path[2][1];
          vis = 0;
        }
        const dist = glide(one.g, tx, tz, 0.006);
        walk(one.g, phase, vis > 0.5 && dist > 0.4);
        fade(one.g, THREE.MathUtils.lerp(one.g.userData.parts[0].material.opacity, vis, 0.04));
      });

      const active = arrive || brk || leave;
      glide(mentor, 3.4, 5, 0.01);
      walk(mentor, secs * 3.2, false);
      fade(mentor, THREE.MathUtils.lerp(mentor.userData.parts[0].material.opacity, active ? 1 : 0, 0.04));
      const m2x = Math.sin(secs * 0.22) * 7;
      const dist2 = glide(mentor2, m2x, 7.5, 0.02);
      walk(mentor2, secs * 4.4, dist2 > 0.4);
      fade(mentor2, THREE.MathUtils.lerp(mentor2.userData.parts[0].material.opacity, hour > 6.2 && hour < 16.8 ? 1 : 0, 0.04));

      const nightShift = hour >= 18.6 || hour < 5.6;
      const gx = Math.sin(secs * 0.16) * 9;
      const gdist = glide(guard, gx, 11.5, 0.02);
      walk(guard, secs * 3.6, gdist > 0.4);
      fade(guard, THREE.MathUtils.lerp(guard.userData.parts[0].material.opacity, nightShift ? 1 : 0, 0.04));
      torch.position.set(guard.position.x + 0.5, 1.3, guard.position.z);
      torch.intensity = nightShift ? 14 : 0;

      controls.update();
      renderer.render(scene, camera);
    }
    frame();

    return {
      dispose() {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', resize);
        resizeObserver.disconnect();
        controls.dispose();
        renderer.dispose();
        scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m) => {
              if (m.map) m.map.dispose();
              if (m.emissiveMap) m.emissiveMap.dispose();
              if (m.alphaMap) m.alphaMap.dispose();
              m.dispose();
            });
          }
        });
      },
    };
  } catch (err) {
    console.error('SchoolScene init failed:', err);
    return { dispose() {} };
  }
}

const SchoolScene = ({ className = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const handle = initScene(canvasRef.current);
    return () => handle.dispose();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute block touch-none cursor-grab ${className}`}
      style={{ top: '-150px', left: '-30px' }}
      aria-label="Ilustrasi 3D gedung SMKS Rajasa Surabaya, siklus siang-malam"
      role="img"
    />
  );
};

export default SchoolScene;
