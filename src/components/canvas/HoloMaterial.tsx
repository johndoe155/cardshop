'use client';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend, type ThreeElement } from '@react-three/fiber';
import { easing } from 'maath';

/**
 * Shared slab shader.
 *
 * Everything that draws an NFT face (hero slab, Forge preview, Rapier pit)
 * goes through this one material, so a fix lands in all three places:
 *
 *  - uImageAspect / uCardAspect -> cover-fit UV, a square JPEG no longer
 *    stretches across a 3:4 face.
 *  - #include <colorspace_fragment> -> the shader writes into whatever buffer
 *    is bound (screen or the composer's linear HalfFloat target) and encodes
 *    correctly for it. Without this the hero (no composer) rendered darker than
 *    Forge (whose composer's final pass re-encodes).
 *  - uTilt -> view-angle foil: the half-vector/fresnel terms shift the holo
 *    hue as the card (or the phone) tilts, with no pointer motion at all.
 *  - uFinish is damped and every finish is blended by weight, so switching
 *    finish morphs instead of hard-cutting.
 *  - Object-space normal marks the box sides as dark plastic, so a single
 *    material gives a card clean edges instead of smeared image on the rim.
 */

export const FINISH_INDEX: Record<string, number> = {
  base: 0,
  holo: 1,
  'cracked-ice': 2,
  gold: 3,
};

export const finishIndex = (finish?: string) => FINISH_INDEX[finish ?? 'holo'] ?? 1;

export const HOLO_UNIFORMS = {
  uTime: 0,
  uPointer: new THREE.Vector2(0.5, 0.5),
  uTilt: new THREE.Vector2(0, 0),
  uImage: null as THREE.Texture | null,
  uImageAspect: 1, // texture width / height
  uCardAspect: 2.2 / 3.0, // slab width / height
  uFinish: 0, // 0 base, 1 holo, 2 cracked ice, 3 gold — damped, fractional while morphing
  uIntensity: 1,
};

export const HOLO_VERTEX = `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vObjNormal;
    varying vec3 vViewDir;

    void main() {
      vUv = uv;
      vObjNormal = normal;
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vViewDir = normalize(-mvPos.xyz);
      gl_Position = projectionMatrix * mvPos;
    }
`;

export const HOLO_FRAGMENT = `
    uniform float uTime;
    uniform vec2 uPointer;
    uniform vec2 uTilt;
    uniform sampler2D uImage;
    uniform float uImageAspect;
    uniform float uCardAspect;
    uniform float uFinish;
    uniform float uIntensity;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vObjNormal;
    varying vec3 vViewDir;

    // ---------------------------------------------------------------- utils
    float hash21(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    vec2 hash22(vec2 p) {
      return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
    }

    float noise(vec2 st) {
      vec2 i = floor(st);
      vec2 f = fract(st);
      float a = hash21(i);
      float b = hash21(i + vec2(1.0, 0.0));
      float c = hash21(i + vec2(0.0, 1.0));
      float d = hash21(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    // Palette constants are authored as sRGB swatches; the whole shader runs in
    // linear space (textures are decoded on sample, output is encoded at the
    // very end), so convert once here or every tint comes out muddy.
    vec3 srgb(vec3 c) {
      return pow(c, vec3(2.2));
    }

    // Cyclic rainbow: orange -> yellow -> cyan -> magenta -> orange (no seam).
    vec3 holoGradient(float t) {
      vec3 c0 = srgb(vec3(1.0, 0.35, 0.05));
      vec3 c1 = srgb(vec3(1.0, 0.92, 0.28));
      vec3 c2 = srgb(vec3(0.15, 0.95, 0.90));
      vec3 c3 = srgb(vec3(1.0, 0.18, 0.85));
      float x = fract(t) * 4.0;
      float i = floor(x);
      float f = smoothstep(0.0, 1.0, fract(x));
      vec3 a = c0;
      vec3 b = c1;
      if (i >= 3.0) { a = c3; b = c0; }
      else if (i >= 2.0) { a = c2; b = c3; }
      else if (i >= 1.0) { a = c1; b = c2; }
      return mix(a, b, f);
    }

    // Cover-fit: scale the UV box so the image fills the face and the overflow
    // is cropped, instead of squeezing a 1:1 NFT onto a 3:4 slab.
    vec2 coverUv(vec2 uv, float imgAspect, float cardAspect) {
      vec2 s = vec2(1.0);
      if (imgAspect > cardAspect) s.x = cardAspect / imgAspect;
      else s.y = imgAspect / cardAspect;
      return (uv - 0.5) * s + 0.5;
    }

    // Voronoi F1/F2 in one 3x3 pass. x = F1, y = F2, zw = vector to the
    // closest feature point (used both for the shard tint and for refraction).
    vec4 crackedCells(vec2 p) {
      vec2 n = floor(p);
      vec2 f = fract(p);
      float f1 = 8.0;
      float f2 = 8.0;
      vec2 mr = vec2(0.0);
      for (int j = -1; j <= 1; j++) {
        for (int i = -1; i <= 1; i++) {
          vec2 g = vec2(float(i), float(j));
          vec2 o = hash22(n + g);
          vec2 r = g + o - f;
          float d = length(r);
          if (d < f1) { f2 = f1; f1 = d; mr = r; }
          else if (d < f2) { f2 = d; }
        }
      }
      return vec4(f1, f2, mr);
    }

    // Soft finish weights so uFinish can sit anywhere on the 0..3 rail and two
    // finishes cross-fade instead of popping. Weights always sum to 1.
    vec4 finishWeights(float f) {
      vec4 w = vec4(
        max(0.0, 1.0 - f),
        1.0 - abs(f - 1.0),
        1.0 - abs(f - 2.0),
        max(0.0, f - 2.0)
      );
      return clamp(w, 0.0, 1.0);
    }

    void main() {
      vec2 uv = vUv;
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewDir);
      vec4 w = finishWeights(uFinish);

      // ---------------------------------------------------------- optics
      // A view-space light the pointer and the gyro can tilt. It sits off-axis
      // by default: a head-on light would make the half-vector term a constant
      // 1.0 across a flat card (a wash) instead of a highlight that sweeps as
      // the card — or the phone — tilts. That sweep is the view-angle foil:
      // the hue shifts with zero pointer motion.
      vec3 L = normalize(vec3(uTilt.x * 1.6 + 0.55, uTilt.y * 1.6 + 0.45, 1.0));
      vec3 H = normalize(L + V);
      float spec = pow(max(dot(N, H), 0.0), 20.0);
      float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);

      // Aspect-corrected distance so the pointer glow stays round on a 3:4 face
      vec2 aspectUv = vec2(uv.x * uCardAspect, uv.y);
      vec2 aspectPointer = vec2(uPointer.x * uCardAspect, uPointer.y);
      float dist = distance(aspectUv, aspectPointer);
      float pointerGlow = 1.0 - smoothstep(0.0, 0.55, dist);

      // ---------------------------------------------------------- sampling
      vec2 cellScale = vec2(7.0, 10.0);
      vec4 cells = crackedCells(uv * cellScale);
      float edge = cells.y - cells.x;                       // 0 exactly on a cell border
      float grain = noise(uv * 42.0);
      float crack = 1.0 - smoothstep(0.0, 0.045 + 0.035 * grain, edge);
      vec2 cellId = floor(uv * cellScale + cells.zw);
      float shard = hash21(cellId);

      // Shards bend the print a little: offset the sample along the vector to
      // the cell's feature point, scaled by the ice weight so it fades in/out
      // with the finish morph.
      vec2 refractOffset = cells.zw * 0.05 * (0.35 + fres) * w.z;
      vec4 img = texture2D(uImage, coverUv(uv + refractOffset, uImageAspect, uCardAspect));
      vec3 col = img.rgb;

      // ---------------------------------------------------------- HOLO
      float angle = atan(uv.y - uPointer.y, (uv.x - uPointer.x) * uCardAspect);
      float rays = sin(angle * 6.0 + uTime * 0.5 + dist * 9.0) * 0.5 + 0.5;
      float holoPhase = uTime * 0.05
        + fres * 1.35
        + spec * 1.10
        + uTilt.x * 0.55 + uTilt.y * 0.35
        + dist * 0.35
        + rays * 0.15;
      vec3 holoCol = holoGradient(holoPhase);
      float holoMask = (fres * 0.75 + spec * 0.50 + pointerGlow * 0.35 + 0.05)
        * (0.55 + noise(uv * 8.0 + uTime * 0.1) * 0.45);
      col = mix(col, holoCol, clamp(holoMask, 0.0, 1.0) * 0.70 * uIntensity * w.y);
      col += holoCol * (fres * 0.35 + spec * 0.12) * uIntensity * w.y;

      // ---------------------------------------------------------- CRACKED ICE
      vec3 ice = mix(srgb(vec3(0.55, 0.73, 0.93)), srgb(vec3(0.92, 0.97, 1.0)), 0.15 + shard * 0.7);
      float iceMask = crack * 0.35 + fres * 0.45 + spec * 0.35;
      col = mix(col, ice, clamp(iceMask, 0.0, 1.0) * 0.45 * w.z);
      col += srgb(vec3(0.82, 0.93, 1.0)) * crack * (0.22 + pointerGlow * 0.45) * w.z;
      col += vec3(1.0) * fres * 0.28 * w.z;

      // ---------------------------------------------------------- GOLD
      float bands = sin((uv.y * 3.0 + uv.x * 0.7) * 2.2 + uTime * 0.25 + spec * 4.0 + uTilt.x) * 0.5 + 0.5;
      vec3 goldGrad = mix(srgb(vec3(0.85, 0.62, 0.11)), srgb(vec3(1.0, 0.86, 0.32)), bands);
      float goldMask = fres * 0.85 + spec * 0.70 + pointerGlow * 0.20 + noise(uv * 18.0) * 0.08;
      col = mix(col, goldGrad, clamp(goldMask, 0.0, 1.0) * 0.50 * uIntensity * w.w);
      col += goldGrad * (fres * 0.45 + spec * 0.25) * uIntensity * w.w;

      // ---------------------------------------------------------- slab body
      // Clearcoat: purely grazing, so a slab facing the camera keeps clean
      // blacks and only catches a sheen as it turns away. (A constant term
      // here reads as a milky veil over the whole print.)
      col += srgb(vec3(0.90, 0.95, 1.0)) * fres * 0.35;
      float faceMask = smoothstep(0.25, 0.75, abs(vObjNormal.z));
      vec3 plastic = srgb(vec3(0.075)) * (0.55 + fres * 0.9) + srgb(vec3(0.9, 0.95, 1.0)) * spec * 0.6;
      col = mix(plastic, col, faceMask);

      // ---------------------------------------------------------- print finish
      float vignette = 1.0 - smoothstep(0.5, 1.2, length((uv - 0.5) * vec2(uCardAspect, 1.0)) * 1.5);
      col *= 0.85 + vignette * 0.15;
      col *= 0.98 + 0.02 * sin(uv.y * 800.0);

      gl_FragColor = vec4(col, 1.0);

      // Output encode — and deliberately *not* tonemapping. The slab is a
      // print: it has to look like the NFT, so it keeps a 1:1 transfer curve
      // while the plastic around it (real materials, ACES) takes the scene's
      // filmic curve. <colorspace_fragment> is target-aware, so this writes
      // sRGB to the screen on the hero and stays linear inside Forge's
      // HalfFloat composer buffer (whose final pass does the encode). That is
      // what makes hero, Forge and the pit agree.
      #include <colorspace_fragment>
    }
`;

const HoloShaderMaterial = shaderMaterial(HOLO_UNIFORMS, HOLO_VERTEX, HOLO_FRAGMENT);

extend({ HoloShaderMaterial });

// R3F v9 / React 19: augment ThreeElements instead of the legacy global JSX
// namespace, so <holoShaderMaterial> is fully typed (no @ts-ignore at the call
// sites and no `any` leaking into the canvas trees).
declare module '@react-three/fiber' {
  interface ThreeElements {
    holoShaderMaterial: ThreeElement<typeof HoloShaderMaterial>;
  }
}

export type HoloMaterial = InstanceType<typeof HoloShaderMaterial> & {
  uniforms: {
    uTime: { value: number };
    uPointer: { value: THREE.Vector2 };
    uTilt: { value: THREE.Vector2 };
    uImage: { value: THREE.Texture | null };
    uImageAspect: { value: number };
    uCardAspect: { value: number };
    uFinish: { value: number };
    uIntensity: { value: number };
  };
};

/** sRGB decode + crisp filtering for an NFT/source texture. */
export function prepareTexture(texture: THREE.Texture | null | undefined, renderer?: THREE.WebGLRenderer) {
  if (!texture) return;
  if (texture.colorSpace !== THREE.SRGBColorSpace) {
    texture.colorSpace = THREE.SRGBColorSpace;
  }
  // Mipmaps on: the pit draws 40+ slabs at a fraction of their texture size,
  // and anisotropy keeps them crisp as they tumble. (The old LinearFilter/no
  // mipmap setup shimmered badly once a card was small on screen.)
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;
  if (renderer) texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;
}

/** Actual pixel aspect of a loaded texture (1 until the image lands). */
export function textureAspect(texture: THREE.Texture | null | undefined) {
  const img = texture?.image as { width?: number; height?: number } | undefined;
  if (!img?.width || !img?.height) return 1;
  return img.width / img.height;
}

type Ctx = {
  time: number;
  delta: number;
  finish: number;
  intensity: number;
  texture?: THREE.Texture | null;
  pointer: THREE.Vector2;
  tilt: { x: number; y: number };
  init: { current: boolean };
};

/**
 * Per-frame uniform update shared by every card: time, damped finish morph,
 * damped pointer/tilt, texture aspect.
 */
export function updateHoloMaterial(mat: HoloMaterial | null | undefined, ctx: Ctx) {
  if (!mat?.uniforms) return;
  const u = mat.uniforms;
  u.uTime.value = ctx.time;

  // Snap on the first frame (no morph on mount), then damp so finish swaps
  // blend through the weights in finishWeights() instead of hard-cutting.
  if (!ctx.init.current) {
    u.uFinish.value = ctx.finish;
    u.uIntensity.value = ctx.intensity;
    ctx.init.current = true;
  } else {
    easing.damp(u.uFinish, 'value', ctx.finish, 0.35, ctx.delta);
    easing.damp(u.uIntensity, 'value', ctx.intensity, 0.2, ctx.delta);
  }

  easing.damp2(u.uPointer.value, [ctx.pointer.x, ctx.pointer.y], 0.12, ctx.delta);
  easing.damp2(u.uTilt.value, [ctx.tilt.x, ctx.tilt.y], 0.25, ctx.delta);
  u.uImageAspect.value = textureAspect(ctx.texture);
}

export { HoloShaderMaterial };
