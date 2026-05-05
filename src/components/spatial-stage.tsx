"use client";

import { useEffect, useRef } from "react";

type Rgb = [number, number, number];

const VERTEX_SHADER = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_scroll;
uniform float u_reduce;
uniform vec3 u_grad1;
uniform vec3 u_grad2;
uniform vec3 u_grad3;
uniform vec3 u_line;

#define PI 3.141592653589793

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * noise(p);
    p = mat2(1.62, 1.18, -1.18, 1.62) * p;
    amp *= 0.52;
  }
  return value;
}

float sdSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

vec2 nodePos(float id, float t, float scroll) {
  float a = id * 2.399963 + scroll * 1.15;
  float r = 0.18 + 0.68 * hash21(vec2(id, 7.31));
  vec2 p = vec2(cos(a), sin(a * 0.83 + id * 0.31)) * r;
  p.x += sin(t * (0.18 + id * 0.013) + id) * 0.045;
  p.y += cos(t * (0.15 + id * 0.017) + id * 1.7) * 0.035;
  p += vec2(sin(scroll * PI * 2.0) * 0.08, cos(scroll * PI * 1.6) * 0.045);
  return p;
}

float linePulse(float d, float t, float offset) {
  float core = exp(-d * d * 1800.0);
  float breath = 0.68 + 0.32 * sin(t * 1.9 + offset);
  return core * breath;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = (frag - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  vec2 st = frag / u_resolution;
  float t = u_time * mix(1.0, 0.08, u_reduce);
  float scroll = u_scroll;

  vec3 col = vec3(0.0);

  float vignette = smoothstep(1.05, 0.18, length(uv * vec2(0.86, 1.06)));
  float grain = hash21(frag + floor(t * 32.0)) - 0.5;

  vec2 focus = vec2(
    mix(0.30, -0.22, smoothstep(0.08, 0.90, scroll)) + sin(t * 0.14) * 0.045,
    mix(-0.20, 0.18, smoothstep(0.15, 0.88, scroll)) + cos(t * 0.11) * 0.035
  );

  float aura1 = exp(-length((uv - focus) * vec2(0.82, 1.18)) * 2.25);
  float aura2 = exp(-length((uv + vec2(0.48, -0.25)) * vec2(1.08, 0.74)) * 2.05);
  float aura3 = exp(-length((uv - vec2(-0.35, 0.32)) * vec2(0.9, 1.15)) * 2.55);
  col += u_grad1 * aura1 * 0.18;
  col += u_grad2 * aura2 * 0.10;
  col += u_grad3 * aura3 * 0.09;

  vec2 warp = uv;
  warp.x += fbm(uv * 1.8 + vec2(t * 0.035, scroll * 2.0)) * 0.18;
  warp.y += fbm(uv * 1.4 + vec2(scroll * 1.6, -t * 0.025)) * 0.12;

  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float lane = -0.58 + fi * 0.22 + sin(warp.x * (2.2 + fi * 0.18) + t * (0.32 + fi * 0.025) + scroll * 4.0) * 0.085;
    lane += (fbm(vec2(warp.x * 1.6 + fi * 3.1, t * 0.055 + scroll * 1.8)) - 0.5) * 0.16;
    float d = abs(warp.y - lane);
    float ribbon = exp(-d * (20.0 + fi * 1.8)) * smoothstep(-1.15, -0.12, warp.x) * smoothstep(1.18, 0.12, warp.x);
    vec3 ribbonColor = mix(u_grad1, u_grad2, 0.5 + 0.5 * sin(fi + t * 0.38 + scroll * 2.0));
    ribbonColor = mix(ribbonColor, u_grad3, 0.22 + 0.18 * sin(fi * 1.7));
    col += ribbonColor * ribbon * (0.105 + 0.026 * sin(fi + scroll * PI));
  }

  vec2 mesh = uv * vec2(1.05, 0.82);
  mesh.x += scroll * 0.24;
  mesh.y += sin(mesh.x * 1.8 + t * 0.18) * 0.06;
  float diagonalA = abs(fract((mesh.x * 0.78 + mesh.y * 1.34 + t * 0.018) * 9.0) - 0.5);
  float diagonalB = abs(fract((mesh.x * -0.92 + mesh.y * 1.16 - t * 0.014) * 8.0) - 0.5);
  float meshLines = smoothstep(0.022, 0.0, diagonalA) + smoothstep(0.018, 0.0, diagonalB);
  col += mix(u_grad2, u_grad1, st.x) * meshLines * 0.022 * vignette;

  vec3 network = vec3(0.0);
  for (int i = 0; i < 16; i++) {
    float fi = float(i);
    vec2 a = nodePos(fi, t, scroll);
    vec2 b = nodePos(mod(fi + 5.0, 16.0), t, scroll);
    vec2 c = nodePos(mod(fi + 9.0, 16.0), t, scroll);

    float da = sdSegment(uv, a, b);
    float db = sdSegment(uv, a, c);
    float node = exp(-length(uv - a) * length(uv - a) * 380.0);
    float ring = exp(-pow(abs(length(uv - a) - (0.035 + 0.025 * fract(t * 0.08 + fi * 0.13))), 2.0) * 2400.0);

    vec3 nc = mix(u_grad1, u_grad2, hash21(vec2(fi, 1.0)));
    nc = mix(nc, u_grad3, hash21(vec2(fi, 3.0)) * 0.42);
    network += nc * linePulse(da, t, fi) * 0.075;
    network += u_line * linePulse(db, t, fi + 3.0) * 0.025;
    network += nc * node * (0.20 + 0.12 * sin(t * 1.2 + fi));
    network += nc * ring * 0.045;
  }
  col += network * (0.62 + scroll * 0.18);

  float scan = smoothstep(0.018, 0.0, abs(fract(st.y * 34.0 + t * 0.08 + scroll * 1.7) - 0.5));
  col += mix(u_grad2, u_grad3, st.x) * scan * 0.014 * smoothstep(0.95, 0.05, abs(uv.x));

  float prism = pow(max(0.0, 1.0 - abs(uv.x * 0.68 + uv.y * 0.22 - 0.12 * sin(t * 0.2))), 14.0);
  col += mix(u_grad1, u_grad2, 0.55 + 0.45 * sin(t * 0.17)) * prism * 0.09;

  col *= vignette;
  col += grain * 0.012;
  col = max(col, vec3(0.0));

  float alpha = clamp(max(max(col.r, col.g), col.b) * 1.35, 0.0, 0.92);
  gl_FragColor = vec4(pow(col, vec3(0.92)), alpha);
}
`;

function readRgbVar(name: string, fallback: Rgb): Rgb {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const values = raw.split(/\s+/).map(Number).filter(Number.isFinite);
  if (values.length >= 3) return [values[0], values[1], values[2]];
  return fallback;
}

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn("[spatial-stage] Shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn("[spatial-stage] Program link failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function SpatialStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    }) as WebGLRenderingContext | null;

    if (!gl) return;

    const program = createProgram(gl);
    if (!program) return;

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    const scrollLocation = gl.getUniformLocation(program, "u_scroll");
    const reduceLocation = gl.getUniformLocation(program, "u_reduce");
    const grad1Location = gl.getUniformLocation(program, "u_grad1");
    const grad2Location = gl.getUniformLocation(program, "u_grad2");
    const grad3Location = gl.getUniformLocation(program, "u_grad3");
    const lineLocation = gl.getUniformLocation(program, "u_line");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.65);
    let raf = 0;
    let scroll = 0;
    let scrollTarget = 0;
    let grad1 = readRgbVar("--grad-1", [183, 148, 255]);
    let grad2 = readRgbVar("--grad-2", [108, 227, 255]);
    let grad3 = readRgbVar("--grad-3", [255, 143, 177]);
    let line = readRgbVar("--line", [255, 255, 255]);

    const readColors = () => {
      grad1 = readRgbVar("--grad-1", [183, 148, 255]);
      grad2 = readRgbVar("--grad-2", [108, 227, 255]);
      grad3 = readRgbVar("--grad-3", [255, 143, 177]);
      line = readRgbVar("--line", [255, 255, 255]);
    };

    const updateScroll = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollTarget = Math.max(0, Math.min(1, window.scrollY / max));
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.65);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      readColors();
      updateScroll();
    };

    const render = (time: number) => {
      scroll += (scrollTarget - scroll) * (reduce ? 1 : 0.085);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, time * 0.001);
      gl.uniform1f(scrollLocation, scroll);
      gl.uniform1f(reduceLocation, reduce ? 1 : 0);
      gl.uniform3fv(grad1Location, new Float32Array(grad1.map((v) => v / 255)));
      gl.uniform3fv(grad2Location, new Float32Array(grad2.map((v) => v / 255)));
      gl.uniform3fv(grad3Location, new Float32Array(grad3.map((v) => v / 255)));
      gl.uniform3fv(lineLocation, new Float32Array(line.map((v) => v / 255)));
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!reduce) raf = requestAnimationFrame(render);
    };

    const observer = new MutationObserver(readColors);
    const onResize = () => resize();
    const onScroll = () => updateScroll();

    resize();
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("load", onResize);
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("load", onResize);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div className="spatial-stage" aria-hidden>
      <canvas ref={canvasRef} />
    </div>
  );
}
