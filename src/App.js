import React from 'react';
import logo from './logo.svg';
import './App.css';
import {
  Renderer, Camera, Orbit, Transform, Geometry, Vec3, Color, Polyline,
} from 'ogl';
import Particles from "react-particles-js";

function App() {

  React.useEffect(() => {

    const renderer = new Renderer({dpr: 2});
    const gl = renderer.gl;
    const App = document.getElementById('App');
    App.appendChild(gl.canvas);

    function resize() {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
      if (polyline) polyline.resize();
    }
    window.addEventListener("resize", resize, false);

    const vertex = `
            attribute vec3 position;
            attribute vec3 next;
            attribute vec3 prev;
            attribute vec2 uv;
            attribute float side;

            uniform vec2 uResolution;
            uniform float uDPR;
            uniform float uThickness;

            vec4 getPosition() {
                vec2 aspect = vec2(uResolution.x / uResolution.y, 1);
                vec2 nextScreen = next.xy * aspect;
                vec2 prevScreen = prev.xy * aspect;

                vec2 tangent = normalize(nextScreen - prevScreen);
                vec2 normal = vec2(-tangent.y, tangent.x);
                normal /= aspect;
                normal *= 1.0 - pow(abs(uv.y - 0.5) * 2.0, 2.0);

                float pixelWidth = 1.0 / (uResolution.y / uDPR);
                normal *= pixelWidth * uThickness;

                // When the points are on top of each other, shrink the line to avoid artifacts.
                float dist = length(nextScreen - prevScreen);
                normal *= smoothstep(0.0, 0.02, dist);

                vec4 current = vec4(position, 1);
                current.xy -= normal * side;
                return current;
            }

            void main() {
                gl_Position = getPosition();
            }
        `;

    const camera = new Camera(gl);
    camera.position.z = 3;

    const scene = new Transform();

    const count = 30;
    const points = [];

    gl.clearColor(.2, .03, .3, 1);

    for (let i = 0; i < count; i++) {
      const x = i / (count - 1) - 0.5;
      const y = 0;
      const z = 0;

      points.push(new Vec3(x, y, z));
    }

    const mouse = new Vec3();
    if ("ontouchstart" in window) {
      window.addEventListener("touchstart", updateMouse, false);
      window.addEventListener("touchmove", updateMouse, false);
    } else {
      window.addEventListener("mousemove", updateMouse, false);
    }

    function updateMouse(e) {
      if (e.changedTouches && e.changedTouches.length) {
        e.x = e.changedTouches[0].pageX;
        e.y = e.changedTouches[0].pageY;
      }
      if (e.x === undefined) {
        e.x = e.pageX;
        e.y = e.pageY;
      }

      // Get mouse value in -1 to 1 range, with y flipped
      mouse.set(
          (e.x / gl.renderer.width) * 2 - 1,
          (e.y / gl.renderer.height) * -2 + 1,
          0
      );
    }

    const polyline = new Polyline(gl, {
      points,
      vertex,
      uniforms: {
        uColor: {value: new Color('#750AC6')},
        uThickness: {value: 40},
      },
    });

    const polyline2 = new Polyline(gl, {
      points,
      vertex,
      uniforms: {
        uColor: {value: new Color('#7101B4')},
        uThickness: {value: 15},
      },
    });

    resize();

    polyline.mesh.setParent(scene);

    function update(t) {
      requestAnimationFrame(update);

      // Update polyline input points
      for (let i = points.length - 1; i >= 0; i--) {
        if (!i) {
          // Ease the first point to the mouse
          points[i].lerp(mouse, 0.3);
        } else {
          // Ease to the previous point
          points[i].lerp(points[i - 1], 0.7);
        }
      }
      polyline.updateGeometry();
      polyline2.updateGeometry();
      renderer.render({scene, camera});
    }
    update();
  }, []);

  return (
    <div className="App" id={'App'}>
      <Particles
          style={{position: 'fixed', top: 0, left: 0}}
          params={{
            "particles": {
              "number": {
                "value": 280,
                "density": {
                  "enable": true,
                  "value_area": 1500
                }
              },
              "line_linked": {
                "enable": true,
                "opacity": 0
              },
              "move": {
                "direction": "right",
                "speed": 0.05
              },
              "size": {
                "value": 1.2
              },
              "opacity": {
                "anim": {
                  "enable": true,
                  "speed": 1,
                  "opacity_min": 0.05
                }
              }
            },
            "interactivity": {
              "events": {
                "onclick": {
                  "enable": true,
                  "mode": "push"
                }
              },
              "modes": {
                "push": {
                  "particles_nb": 1
                }
              }
            },
            "retina_detect": true
          }} />
          <div className={'container'}>
        <div className={'texto'}>
          <h1><span>Hyped</span> Software</h1>
          <h2>A melhor solução em desenvolvimento para você</h2>
          <div>
            <button onClick={() => {
              window.open('https://api.whatsapp.com/send?phone=556194485601&text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20os%20servi%C3%A7os%20da%20HypedSoftware','_blank');
            }}>Fale conosco pelo WhatsApp</button>
            <button>Fale conosco pelo Discord</button>
          </div>
        </div>
        <div className={'imagem'}>
          <img src={require('./hyped_logo.png')} />
        </div>
      </div>
    </div>
  );
}

export default App;
