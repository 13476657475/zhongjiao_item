import * as THREE from '../jsm/three.module.js';

import { Water } from '../jsm/objects/Water.js';

let water; // 水

// 初始化水
function initWater(W, H) {

    if (water) return water;

    let waterGeometry = new THREE.PlaneBufferGeometry(W, H);

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load(require('../textures/waternormals.jpg'), function (texture) { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; }),
            alpha: 0.7,
            size: 10,
            sunDirection: new THREE.Vector3(0, 1, 0),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: false
        }
    );

    water.rotation.x = - Math.PI / 2;
    // water.position.y = -4;
    // water.position.oldy = water.position.y;
    water.name = '海水';
    water.material.side = 2;
    water.material.transparent = true;
    // water.material.depthWrite = false;
    // water.renderOrder = 0;

    return water;

}

// 更新潮位
function updateSeaLevel(height) {
    if (water) water.position.y = height;
    //console.log(water)
}

export { initWater, updateSeaLevel };