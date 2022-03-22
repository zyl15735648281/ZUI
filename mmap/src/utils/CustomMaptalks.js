import * as maptalks from "maptalks";
import { ThreeLayer } from "maptalks.three";
import * as THREE from "three";
import { initGui } from "@/utils/gui";
import initStats from "@/utils/stats";
import { isArray, isFunction } from "@/utils";
// maptalks的配置内容
const config = {
  center: [116.4733853, 39.9877147], // 中心点位
  zoom: 11, // 缩放层级，越大放大越大
  pitch: 70, // 倾斜度
  bearing: 180, // 旋转度
  centerCross: false, // 在地图中央显示一个红十字
  doubleClickZoom: false, // 是否允许地图通过双击事件缩放。
  baseLayer: new maptalks.TileLayer("tile", {
    urlTemplate: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", // 地图的链接，可以自定义
    subdomains: ["a", "b", "c", "d"],
    attribution: "",
  }),
  // layers: [
  //   new maptalks.VectorLayer('v', [new maptalks.Marker([116.66800417723653, 39.89748464180056])])
  // ]
};
// 是否展示页面左上角的FPS状态
const showStats = true;
// 是否显示右上角控制台
const showGui = true;

export default class CustomMaptalks {
  static customMaptalks = null;
  constructor(el) {
    this.map = null; // 地图
    this.scene = null;
    this.camera = null;
    this.effects = []; // 所有使用的插件
    this.stats = null; // 运行状态
    this.el = el; // element元素
  }
  static getCustomMaptalks = function (el) {
    if (!this.customMaptalks) {
      this.customMaptalks = new CustomMaptalks(el);
    }
    return this.customMaptalks;
  };

  /**
   * 初始化所有组件
   * @param effects
   */
  initEffects(...Effects) {
    const timer = "所有效果加载时间";
    this.threeLayer.prepareToDraw = (gl, scene, camera) => {
      console.time(timer);
      this.scene = scene;
      this.camera = camera;
      // const light = new THREE.DirectionalLight(0xffffff, 2)// 创建平行光(颜色，光照的强度)
      // light.position.set(0, -10, 10)
      // // light.castShadow = true
      // scene.add(light)
      // const pl = new THREE.PointLight(0xffffff, 2, 0)// 创建点光源(颜色，光照强度)
      // pl.position.set(0, -10, 10)
      // camera.add(pl)
      // const light = new THREE.DirectionalLight(0xffffff)
      const light = new THREE.AmbientLight(0xcccccc, 2); // 环境光 1.5ff)
      light.position.set(0, -10, 10).normalize();
      scene.add(light);
      camera.add(new THREE.PointLight("#fff", 2));
      this.addEffects(...Effects);
      if (showStats) {
        // 左上角的状态栏
        this.stats = initStats(this);
      }
      if (showGui) {
        // 右上角配置
        initGui(this);
      }
      this.animation(this);
      console.timeEnd(timer);
    };
    setTimeout(() => {
      this.changeView([116.66954405171134, 39.8974015468543]);
    }, 3000);
  }

  /**
   * 加入的组件
   * @param effects
   */
  addEffects(...Effects) {
    Effects.forEach((Effect, index) => {
      const effectName = `${index + 1}-${Effect.name || "效果"}`;
      console.time(effectName);
      let effect;
      if (isFunction(Effect)) {
        effect = new Effect(this);
      } else if (isArray(Effect)) {
        effect = new Effect[0](this, Effect[1]);
      }
      this.effects.push(effect);
      const meshes = effect.getMeshes && effect.getMeshes();
      if (meshes) {
        this.threeLayer.addMesh(meshes);
      }
      console.timeEnd(effectName);
    });
  }

  /**
   * 初始化创建maptalks
   * @param option
   */
  initMapTalks(option) {
    option = Object.assign(config, option);
    this.map = new maptalks.Map(this.el, option); // 创建地图
    this.map.on("click", (e) => {
      console.log(e.coordinate.toArray()); // 获取点击坐标
    });

    // 创建图层
    const threeLayer = new ThreeLayer("t", {
      forceRenderOnMoving: true, // 地图移动时强制渲染图层
      forceRenderOnRotating: true, // 地图旋转时强制渲染图层
    });

    threeLayer.addTo(this.map); // 将地图加入图层
    this.threeLayer = threeLayer;
    this.markerLayer = new maptalks.VectorLayer("vector").addTo(this.map);
  }

  changeView(point, duration = 5000) {
    this.animateTo(
      {
        center: point,
        zoom: 18,
        pitch: 70,
        bearing: 90,
      },
      duration
    );
    // setTimeout(() => {
    //   this.animateTo({
    //     center: [116.72327853854938, 39.87871632215976],
    //     zoom: 13,
    //     pitch: 45,
    //     bearing: 90
    //   }, 5000)
    // }, 5000)
  }

  animateTo(view, duration, step) {
    this.map.animateTo(
      view,
      {
        duration,
      },
      step ||
        function (frame) {
          if (frame.state.playState === "finished") {
            console.log("animation finished");
          }
        }
    );
  }

  animation() {
    // layer animation support Skipping frames
    if (!this.map.isInteracting()) {
      this.threeLayer._needsUpdate = !this.threeLayer._needsUpdate;
      if (this.threeLayer._needsUpdate) {
        this.threeLayer.renderScene();
      }
    }
    if (showStats && this.stats) {
      // 左上角的状态栏
      this.stats.update();
    }
    this.effects.forEach((effect) => {
      if (effect._animation) {
        effect._animation();
      }
    });
    requestAnimationFrame(() => {
      this.animation();
    });
  }
}
