"use client";

import { useEffect, useRef } from "react";

// The animated dot-matrix backdrop for the auth screens, written against raw
// WebGL2 so no third-party script or dependency is pulled onto the login page.
const VERTEX_SHADER = `#version 300 es
precision mediump float;
in vec2 position;
uniform vec2 u_resolution;
out vec2 fragCoord;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
  fragCoord = (position + 1.0) * 0.5 * u_resolution;
  fragCoord.y = u_resolution.y - fragCoord.y;
}`;

const FRAGMENT_SHADER = `#version 300 es
precision mediump float;
in vec2 fragCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform float u_total_size;
uniform float u_dot_size;
uniform float u_opacities[10];
uniform vec3 u_colors[6];
out vec4 fragColor;

const float PHI = 1.61803398874989484820459;

float random(vec2 xy) {
  return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
}

void main() {
  vec2 st = fragCoord.xy;
  st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
  st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));

  float opacity = step(0.0, st.x) * step(0.0, st.y);
  vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));

  float frequency = 5.0;
  float show_offset = random(st2);
  float rand = random(st2 * floor((u_time / frequency) + show_offset + frequency));
  opacity *= u_opacities[int(rand * 10.0)];
  opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
  opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));

  vec3 color = u_colors[int(show_offset * 6.0)];

  float animation_speed_factor = 3.0;
  vec2 center_grid = u_resolution / 2.0 / u_total_size;
  float dist_from_center = distance(center_grid, st2);
  float timing_offset = dist_from_center * 0.01 + (random(st2) * 0.15);
  opacity *= step(timing_offset, u_time * animation_speed_factor);
  opacity *= clamp((1.0 - step(timing_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
  opacity *= 0.85;

  fragColor = vec4(color * opacity, opacity);
}`;

// Mostly soft white dots with the occasional emerald one to match the desk.
const DOT_COLORS = new Float32Array([
  0.88, 0.96, 0.91, 0.88, 0.96, 0.91, 0.88, 0.96, 0.91, 0.88, 0.96, 0.91,
  0.33, 0.9, 0.63, 0.33, 0.9, 0.63,
]);
const DOT_OPACITIES = new Float32Array([
  0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1.0,
]);

export function DotGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    // Without WebGL2 the page quietly keeps its CSS gradient backdrop.
    if (!gl) return;

    function compile(type: number, source: string) {
      const shader = gl!.createShader(type);
      if (!shader) return null;
      gl!.shaderSource(shader, source);
      gl!.compileShader(shader);
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertex = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertex || !fragment) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTotalSize = gl.getUniformLocation(program, "u_total_size");
    const uDotSize = gl.getUniformLocation(program, "u_dot_size");
    gl.uniform1fv(gl.getUniformLocation(program, "u_opacities"), DOT_OPACITIES);
    gl.uniform3fv(gl.getUniformLocation(program, "u_colors"), DOT_COLORS);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(canvas!.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas!.clientHeight * dpr));
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width;
        canvas!.height = height;
      }
      gl!.viewport(0, 0, width, height);
      gl!.uniform2f(uResolution, width, height);
      gl!.uniform1f(uTotalSize, 10 * dpr);
      gl!.uniform1f(uDotSize, 2.6 * dpr);
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const startTime = performance.now();
    let animationFrame = 0;

    function draw(timeSeconds: number) {
      gl!.uniform1f(uTime, timeSeconds);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
    }

    function animate() {
      draw((performance.now() - startTime) / 1000);
      animationFrame = requestAnimationFrame(animate);
    }

    resize();
    if (reduceMotion) {
      // A single settled frame: intro finished, no flicker.
      draw(60);
    } else {
      animate();
    }

    // Track layout size rather than window size so the buffer stays correct
    // even when styles land after mount or the pane is resized.
    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(60);
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas className="auth-canvas" ref={canvasRef} aria-hidden="true" />;
}
