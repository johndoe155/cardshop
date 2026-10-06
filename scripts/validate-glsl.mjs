/**
 * Dev-only sanity check for the slab shader.
 *
 * There is no browser in this sandbox, so instead of shipping a GLSL typo we
 * rebuild the exact source three would hand to the driver (three's ShaderChunk
 * includes resolved + the WebGLProgram prefix a ShaderMaterial gets) and run it
 * through a GLSL ES 1.00 parser. Catches syntax errors and undeclared symbols;
 * it is not a full compiler, so it complements — not replaces — a visual check.
 *
 *   node scripts/validate-glsl.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import { parser } from '@shaderfrog/glsl-parser';
import { preprocess } from '@shaderfrog/glsl-parser/preprocessor/index.js';

const file = path.resolve('src/components/canvas/HoloMaterial.tsx');
const src = fs.readFileSync(file, 'utf8');

function grab(name) {
  const m = src.match(new RegExp(`export const ${name} = \`([\\s\\S]*?)\\n\`;`));
  if (!m) throw new Error(`could not find ${name} in ${file}`);
  return m[1];
}

const vertex = grab('HOLO_VERTEX');
const fragment = grab('HOLO_FRAGMENT');

function resolveIncludes(source) {
  return source.replace(/^[ \t]*#include +<([\w\d./]+)>/gm, (_m, name) => {
    const chunk = THREE.ShaderChunk[name];
    if (chunk === undefined) throw new Error(`unknown ShaderChunk: ${name}`);
    return resolveIncludes(chunk);
  });
}

// Mirrors the uniforms/attributes/precision WebGLProgram prepends for a
// (non-raw) ShaderMaterial, plus the two chunks it always pulls in.
const VERTEX_PREFIX = `
precision highp float;
precision highp int;
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
`;

const FRAGMENT_PREFIX = `
precision highp float;
precision highp int;
uniform mat4 viewMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;

#define TONE_MAPPING
${THREE.ShaderChunk['tonemapping_pars_fragment']}
${THREE.ShaderChunk['colorspace_pars_fragment']}
vec3 toneMapping(vec3 color) { return ACESFilmicToneMapping(color * toneMappingExposure); }
vec4 linearToOutputTexel(vec4 value) { return sRGBTransferOETF(value); }
`;

const targets = [
  { name: 'vertex', source: VERTEX_PREFIX + resolveIncludes(vertex) },
  { name: 'fragment', source: FRAGMENT_PREFIX + resolveIncludes(fragment) },
];

let failed = false;
for (const { name, source } of targets) {
  try {
    const preprocessed = preprocess(source, {
      defines: { TONE_MAPPING: 1 },
      preserve: { version: () => true },
    });
    parser.parse(preprocessed, { quiet: true });
    // Cheap heuristic: every identifier the shader calls must exist somewhere
    const calls = preprocessed.match(/\b(u[A-Z]\w*|v[A-Z]\w*)\b/g) ?? [];
    const declared = new Set([
      ...source.matchAll(/\b(?:uniform|varying|attribute|float|vec2|vec3|vec4|mat3|mat4|bool)\s+(\w+)/g),
    ].map((m) => m[1]));
    const missing = [...new Set(calls)].filter(
      (c) => !declared.has(c) && !new RegExp(`\\b${c}\\b\\s*(\\(|=|;|,|\\)|\\[)`).test(source)
    );
    console.log(`✓ ${name} parsed (${preprocessed.split('\n').length} lines, ${calls.length} uniform/varying refs)`);
    if (missing.length) console.log(`  ! unresolved symbols: ${missing.join(', ')}`);
  } catch (e) {
    failed = true;
    console.error(`✗ ${name} failed: ${e.message}`);
    if (e.location) console.error(JSON.stringify(e.location));
  }
}

fs.writeFileSync('/tmp/holo.fragment.glsl', FRAGMENT_PREFIX + resolveIncludes(fragment));
fs.writeFileSync('/tmp/holo.vertex.glsl', VERTEX_PREFIX + resolveIncludes(vertex));
console.log('wrote /tmp/holo.fragment.glsl and /tmp/holo.vertex.glsl');
process.exit(failed ? 1 : 0);
