import * as THREE from '../jsm/three.module.js';

// 点材质
let pointTexture = new THREE.TextureLoader().load(require('./img/water.png'));

let Sprayp1 = { x: 0, y: 40, z: -18 },// 贝塞尔控制点坐标
    Sprayp2 = { x: 0, y: -20, z: -85 };// 终点坐标

let curtainsTime = 100;

let MudScale = 150;

// 思路：创建1024条水流贝塞尔曲线，每条曲线分为200个点
// 不停更新点的位置，到200后，返回为0，重复即可实现流水效果
// 其中流水的点位从小到大要有缩放，越大点与点之间的间隙也要越大
function Spray() {

    let attributeNum = 1024; // BufferAttribute长度

    let pointsNum = 200; // 每条水曲线上的总计的顶点数

    let createTick, animateTick, changeBlendingTick; // 创建过程计时器，动画计时器, 定时改变Blending

    let particleContainer = []; // 容器最大容量是 1024

    let range1 = 4, range2 = 10; // 贝塞尔控制点和终点的扩大范围【使其看起来半径逐渐扩大】

    // 随机化顶点函数
    function randomVec(v) {
        let num = 0.4;
        return new THREE.Vector3(
            Math.sin(Math.random()) * num + v.x,
            Math.sin(Math.random()) * num + v.y,
            Math.sin(Math.random()) * num + v.z
        );
    }

    // 创建随机粒子线函数 : 创建1024个水流路线 【用于随机取点，实现1024个粒子的流动效果】
    function createParticles() {
        if (particleContainer.length >= 1024) {
            clearInterval(createTick);
            createTick = null;
        } else {
            particleContainer.push([
                // 随机计算贝塞尔控制点
                Math.sin(Math.random()) * range1 + Sprayp1.x,
                Math.sin(Math.random()) * range1 + Sprayp1.y,
                Math.sin(Math.random()) * range1 + Sprayp1.z,
                // 随机计算贝塞尔终点
                Math.sin(Math.random()) * range2 + Sprayp2.x,
                Math.sin(Math.random()) * range2 + Sprayp2.y,
                Math.sin(Math.random()) * range2 + Sprayp2.z,
                0 // 缩放系数 
            ]);
        }
    };

    // 计算移动的水粒子位置
    function getParticlePoint(params) {
        let curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(params[0], params[1], params[2]),
            new THREE.Vector3(params[3], params[4], params[5])
        );

        // 前部分数据，过于密集，需要随机范围随机打算，样式不至于过于死板
        if (params[6] < pointsNum / 4) {
            return randomVec(curve.getPoints(pointsNum)[params[6]]);
        } else {
            return curve.getPoints(pointsNum)[params[6]];
        }
    }

    // 粒子动画
    const particleAnimate = () => {

        let positions = this.object.geometry.attributes.position.array;
        let scales = this.object.geometry.attributes.scale.array;

        for (let i = 0, len = particleContainer.length; i < len; i++) {
            let elm = particleContainer[i];
            let p = getParticlePoint(elm); // 获取点的粒子的点位
            positions[i * 3] = p.x;
            positions[i * 3 + 1] = p.y;
            positions[i * 3 + 2] = p.z;
            scales[i] = elm[6] * 0.02;

            elm[6] = (elm[6] < pointsNum) ? elm[6] + 1 : 0;
        }

        this.object.geometry.attributes.position.needsUpdate = true;
        this.object.geometry.attributes.scale.needsUpdate = true;
    }


    // 启用
    this.enable = () => {
        this.object.visible = true;

        createTick = setInterval(createParticles, 5);
        animateTick = setInterval(particleAnimate, 1000 / 120);

        changeBlendingTick = setTimeout(() => { this.object.material.blending = THREE.NormalBlending; }, 18000)

    };

    // 禁用
    this.disable = () => {
        clearInterval(createTick);
        clearInterval(animateTick);

        clearTimeout(changeBlendingTick);

        // 隐藏对象
        this.object.visible = false;

        // 材质融合属性还原
        this.object.material.blending = THREE.AdditiveBlending;
        // this.object.material.blending = THREE.NoBlending;

        // 更改顶点
        let positions = this.object.geometry.attributes.position.array;
        let scales = this.object.geometry.attributes.scale.array;

        for (let i = 0, len = particleContainer.length; i < len; i++) {
            positions[i * 3] = 0;
            positions[i * 3 + 1] = 0;
            positions[i * 3 + 2] = 0;
            scales[i] = 0;
        }

        this.object.geometry.attributes.position.needsUpdate = true;
        this.object.geometry.attributes.scale.needsUpdate = true;

        // 清空顶点数组
        particleContainer.splice(0, particleContainer.length);

    }

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Array(attributeNum * 3).fill(0), 3));
    geometry.setAttribute('scale', new THREE.Float32BufferAttribute(new Array(attributeNum), 1));

    let shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            opacity: { value: 1 }, // 透明度
            color: { value: new THREE.Color(0x6C685F) }, // 颜色
            pointTexture: { value: pointTexture }, // 贴图
        },
        vertexShader: `
            attribute float scale;
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                gl_PointSize = scale * ( 300.0 / -mvPosition.z );
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture;
            uniform vec3 color;
            uniform float opacity;
            void main() {
                gl_FragColor = vec4( color, opacity );
                gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
    });

    this.object = new THREE.Points(geometry, shaderMaterial); // 三维对象本身

    this.object.visible = false;
}

// 冲舱口
function Watering(transforms) {

    let animateTick; // 创建过程计时器，动画计时器

    let mats = [];

    let pointsNum = 0; // 点数
    let linePointsNum = 25; // 一条线上得点数

    // 启用
    this.enable = () => {
        this.object.visible = true;
        animateTick = setInterval(particleAnimate, 1000 / 30);
    };

    // 禁用
    this.disable = () => {
        clearInterval(animateTick);
        this.object.visible = false;
    }

    let steps = 0; // 步数，用以记录是否连续移动了3次，如果是，则返回初始位置
    let vec = new THREE.Vector3(); // 用于计算矩阵的点
    const particleAnimate = () => {
        let positions = this.object.geometry.attributes.position.array;
        steps = (steps > 3) ? 0 : steps + 1;

        for (let i = 0, len = mats.length; i < len; i++) {
            let ii = i * linePointsNum; // 矩阵（几条线）循环数 * 单条线的总点数

            for (let j = 0; j < linePointsNum; j++) {

                let jj = (ii + j) * 3;

                vec.set(0, (j + (steps * 0.2)) / 10, 0).applyMatrix4(mats[i]);

                positions[jj] = vec.x;
                positions[jj + 1] = vec.y;
                positions[jj + 2] = vec.z;

            }

        }

        this.object.geometry.attributes.position.needsUpdate = true;
    }

    let obj3d = new THREE.Object3D();
    for (let i = 0, len = transforms.length; i < len; i++) {
        const transform = transforms[i];
        obj3d.position.set(transform.position.x, transform.position.y, transform.position.z);
        obj3d.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
        obj3d.updateMatrix();
        mats.push(obj3d.matrix.clone());
        pointsNum += linePointsNum * 3; // 总顶点数 = 线数 * 一条线上的顶点数
    }

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Array(pointsNum).fill(0), 3));
    geometry.setAttribute('scale', new THREE.Float32BufferAttribute(new Array(pointsNum / 3).fill(0.2), 1));

    let shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            opacity: { value: 1 }, // 透明度
            color: { value: new THREE.Color(0x00BFFF) }, // 颜色
            pointTexture: { value: pointTexture }, // 贴图
        },
        vertexShader: `
            attribute float scale;
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                gl_PointSize = scale * ( 300.0 / -mvPosition.z );
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture;
            uniform vec3 color;
            uniform float opacity;
            void main() {
                gl_FragColor = vec4( color, opacity );
                gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
    });

    this.object = new THREE.Points(geometry, shaderMaterial);
    this.object.frustumCulled = false;
    this.object.visible = false;

}

// 顶喷 【装舱】
function Curtains(transforms) {

    let animateTick; // 创建过程计时器，动画计时器

    let mats = [];

    let v1 = new THREE.Vector3();
    let v2 = new THREE.Vector3();

    let linePointsNum = 60; // 一条线上得点数
    let pointsNum = 0;

    // 线形状路线数组
    let lineArray = [
        [-0.35, 0, 0, -0.7, -10, 0],
        [-0.225, 0, 0, -0.45, -10, 0],
        [-0.125, 0, 0, -0.25, -10, 0],
        [0, 0, 0, 0, -10, 0],
        [0.125, 0, 0, 0.25, -10, 0],
        [0.225, 0, 0, 0.45, -10, 0],
        [0.35, 0, 0, 0.7, -10, 0],
    ];

    // 启用
    this.enable = () => {
        this.object.visible = true;
        animateTick = setInterval(particleAnimate, curtainsTime);
        // particleAnimate();
    };

    // 禁用
    this.disable = () => {
        // clearInterval(createTick);
        clearInterval(animateTick);

        this.object.visible = false;
    }

    const particleAnimate = () => {

        let positions = this.object.geometry.attributes.position.array;
        let scales = this.object.geometry.attributes.scale.array;

        for (let i = 0, len = mats.length; i < len; i++) {
            const matrix = mats[i];

            let lineLen = lineArray.length;

            let ii = i * lineLen * linePointsNum;  // 7 * 30

            for (let j = 0; j < lineLen; j++) {
                const line = lineArray[j];

                v2.set(line[3], line[4], line[5]);

                let jj = j * linePointsNum; // 7 * 30

                for (let k = 0; k < linePointsNum; k++) {

                    let kk = ii + jj + k;
                    let kk3 = kk * 3;

                    v1.set(line[0], line[1], line[2]);

                    v1.sub(v2).normalize().multiplyScalar((Math.random() / 10 - 0.15) * k);
                    v1.x += line[0];

                    v1.applyMatrix4(matrix);

                    // 赋值位置和缩放
                    positions[kk3] = v1.x;
                    positions[kk3 + 1] = v1.y;
                    positions[kk3 + 2] = v1.z;

                    if (k > 55) scales[kk] = k / 110;

                }

            }
        }

        this.object.geometry.attributes.position.needsUpdate = true;
        this.object.geometry.attributes.scale.needsUpdate = true;
    }

    let obj3d = new THREE.Object3D();
    for (let i = 0, len = transforms.length; i < len; i++) {
        const transform = transforms[i];
        obj3d.position.set(transform.position.x, transform.position.y, transform.position.z);
        // obj3d.rotation.set(transform.rotation.x, transform.rotation.y, transform.rotation.z);
        obj3d.updateMatrix();
        mats.push(obj3d.matrix.clone());
        pointsNum += lineArray.length * linePointsNum; // 总顶点数 = 线数 * 一条线上的顶点数
    }

    // console.log(pointsNum);

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Array(pointsNum * 3).fill(1), 3));
    geometry.setAttribute('scale', new THREE.Float32BufferAttribute(new Array(pointsNum).fill(0.25), 1));

    let shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            opacity: { value: 1 }, // 透明度
            color: { value: new THREE.Color(0x6C685F) }, // 颜色
            pointTexture: { value: pointTexture }, // 贴图
        },
        vertexShader: `
            attribute float scale;
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                gl_PointSize = scale * ( 300.0 / -mvPosition.z );
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture;
            uniform vec3 color;
            uniform float opacity;
            void main() {
                gl_FragColor = vec4( color, opacity );
                gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
            }
        `,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
    });

    this.object = new THREE.Points(geometry, shaderMaterial);
    this.object.frustumCulled = false;
    this.object.visible = false;

}

// 泥门
function Mud(transforms) {

    let animateTick; // 创建过程计时器，动画计时器

    let mats = [];

    let pointsNum = 0;

    let vec = new THREE.Vector3();

    // 启用
    this.enable = () => {
        this.object.visible = true;
        animateTick = setInterval(particleAnimate, 1000 / 10);
        // particleAnimate();
    };

    // 禁用
    this.disable = () => {
        clearInterval(animateTick);
        this.object.visible = false;
    }

    const particleAnimate = () => {

        let positions = this.object.geometry.attributes.position.array;
        let scales = this.object.geometry.attributes.scale.array;

        for (let i = 0, len = mats.length; i < len; i++) {
            const matrix = mats[i];
            let posLen = positionsArray.length / 3;
            let ii = i * posLen;

            for (let j = 0; j < posLen; j++) {
                vec.set(
                    positionsArray[j * 3] + Math.sin(Math.random()) * 2,
                    positionsArray[j * 3 + 1] + Math.sin(Math.random()) * 2,
                    positionsArray[j * 3 + 2] + Math.sin(Math.random()) * 2
                );

                vec.applyMatrix4(matrix);

                let jj = ii + j;

                positions[jj * 3] = vec.x;
                positions[jj * 3 + 1] = vec.y;
                positions[jj * 3 + 2] = vec.z;

                scales[jj] = j / MudScale;

            }

        }

        this.object.geometry.attributes.position.needsUpdate = true;
        this.object.geometry.attributes.scale.needsUpdate = true;
    }

    // 推算泥的点位置
    let positionsArray = [];
    for (let i = 0; i < 25; i += 0.5) {
        if (i === 0) {
            positionsArray.push(0, 0, 0);
        } else {
            let v = Math.sqrt(i) / 2;
            positionsArray.push(
                0, -i, 0,
                v, -i, 0, -v, -i, 0, 0, -i, v, 0, -i, -v,
                -v, -i, v, -v, -i, -v, v, -i, -v, v, -i, v,
            );
        }
    }

    // 计算所在位置的矩阵
    let obj3d = new THREE.Object3D();
    for (let i = 0, len = transforms.length; i < len; i++) {
        const transform = transforms[i];
        obj3d.position.set(transform.position.x, transform.position.y, transform.position.z);
        obj3d.updateMatrix();
        mats.push(obj3d.matrix.clone());
        pointsNum += positionsArray.length; // 总顶点数 = 线数 * 一条线上的顶点数
    }


    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(new Array(pointsNum * 3).fill(1), 3));
    geometry.setAttribute('scale', new THREE.Float32BufferAttribute(new Array(pointsNum).fill(0), 1));

    let shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            opacity: { value: 1 }, // 透明度
            color: { value: new THREE.Color(0x8B4513) }, // 颜色
            pointTexture: { value: pointTexture }, // 贴图
        },
        vertexShader: `
            attribute float scale;
            void main() {
                vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
                gl_PointSize = scale * ( 300.0 / -mvPosition.z );
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform sampler2D pointTexture;
            uniform vec3 color;
            uniform float opacity;
            void main() {
                gl_FragColor = vec4( color, opacity );
                gl_FragColor = gl_FragColor * texture2D( pointTexture, gl_PointCoord );
            }
        `,
        // blending: THREE.NormalBlending,
        depthWrite: false,
        transparent: true,
    });

    this.object = new THREE.Points(geometry, shaderMaterial);
    this.object.frustumCulled = false;
    this.object.visible = false;
    // this.object.renderOrder = 10;

}

// export { Spray, Watering, Curtains, Mud };
// 更新特效动作时间
function updateEffectCoefficient(key, coefficient) {

    if (key === 'Spray') {
        Sprayp1.z = -18 - (coefficient - 1) * 60;
        Sprayp2.z = -45 - (coefficient - 1) * 60;
    } else if (key === 'Curtains') {
        curtainsTime = 100 * coefficient;
    } else if (key === 'Mud') {
        MudScale = 150 - (coefficient - 1) * 100;
    }
}

export { Spray, Watering, Curtains, Mud, updateEffectCoefficient };