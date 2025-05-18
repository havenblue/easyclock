// worker.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

function generateHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>宇宙时钟</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      height: 100vh;
      background: #000;
      font-family: 'Arial', sans-serif;
    }

    #canvas {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 0;
    }

    .content {
      position: relative;
      z-index: 1;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #fff;
      text-align: center;
    }

    #date {
      font-size: 3vw;
      margin-bottom: 2vh;
      text-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
      opacity: 0.9;
      white-space: nowrap;
    }

    #clock {
      font-size: 8vw;
      display: flex;
      gap: 0.2em;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
    }

    .separator {
      animation: pulse 1s infinite;
    }

    #fullscreenBtn {
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
      padding: 8px 16px;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.3s;
      backdrop-filter: blur(5px);
    }

    #fullscreenBtn:hover {
      background: rgba(255, 255, 255, 0.3);
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    #fullscreenBtn.hidden {
      display: none;
    }

    @media (max-width: 600px) {
      #date { font-size: 5vw; }
      #clock { font-size: 12vw; }
      #fullscreenBtn { padding: 6px 12px; font-size: 14px; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <button id="fullscreenBtn" title="切换全屏">⛶ 全屏</button>
  <div class="content">
    <div id="date"></div>
    <div id="clock"></div>
  </div>

  <script>
    class Starfield {
      constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = [];
        this.resize();
        this.init();
        
        this.resizeHandler = () => {
          this.resize();
          this.init();
        };
        window.addEventListener('resize', this.resizeHandler);
      }

      resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * devicePixelRatio;
        this.canvas.height = this.height * devicePixelRatio;
        this.ctx.scale(devicePixelRatio, devicePixelRatio);
      }

      init() {
        this.stars = Array.from({length: 150}, () => ({
          x: Math.random() * this.width,
          y: Math.random() * this.height,
          size: Math.random() * 1.5,
          opacity: Math.random() * 0.5 + 0.3,
          speed: Math.random() * 0.15 + 0.05
        }));
      }

      update() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.stars.forEach(star => {
          star.y += star.speed;
          if (star.y > this.height) {
            star.y = 0;
            star.x = Math.random() * this.width;
          }
          this.ctx.fillStyle = 'rgba(255, 255, 255, ' + star.opacity + ')';
          this.ctx.beginPath();
          this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          this.ctx.fill();
        });
        requestAnimationFrame(this.update.bind(this));
      }

      destroy() {
        window.removeEventListener('resize', this.resizeHandler);
      }
    }

    class DateTimeManager {
      constructor() {
        this.weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        this.update();
        setInterval(this.update.bind(this), 1000);
      }

      getFormattedDate(now) {
        return \`\${now.getFullYear()}年\${(now.getMonth()+1).toString().padStart(2,'0')}月\${now.getDate().toString().padStart(2,'0')}日 星期\${this.weekDays[now.getDay()]}\`;
      }

      getFormattedTime(now) {
        return [
          now.getHours().toString().padStart(2,'0'),
          now.getMinutes().toString().padStart(2,'0'),
          now.getSeconds().toString().padStart(2,'0')
        ];
      }

      update() {
        const now = new Date();
        document.getElementById('date').textContent = this.getFormattedDate(now);
        const [hours, minutes, seconds] = this.getFormattedTime(now);
        document.getElementById('clock').innerHTML = \`
          <div>\${hours}</div>
          <div class="separator">:</div>
          <div>\${minutes}</div>
          <div class="separator">:</div>
          <div>\${seconds}</div>
        \`;
      }
    }

    class FullscreenControl {
      constructor() {
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.isFullscreen = false;
        
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
        this.handleFullscreenChange = this.handleFullscreenChange.bind(this);
        
        this.init();
      }

      init() {
        this.fullscreenBtn.addEventListener('click', this.toggleFullscreen);
        document.addEventListener('fullscreenchange', this.handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
      }

      toggleFullscreen() {
        if (!document.fullscreenElement) {
          const docEl = document.documentElement;
          if (docEl.requestFullscreen) {
            docEl.requestFullscreen();
          } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen();
          }
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
          }
        }
      }

      handleFullscreenChange() {
        this.isFullscreen = !!document.fullscreenElement;
        this.fullscreenBtn.classList.toggle('hidden', this.isFullscreen);
      }
    }

    // 初始化所有功能
    const canvas = document.getElementById('canvas');
    const starfield = new Starfield(canvas);
    starfield.update();
    new DateTimeManager();
    new FullscreenControl();
  </script>
</body>
</html>
`;
}

async function handleRequest(request) {
  return new Response(generateHTML(), {
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-store, max-age=0'
    }
  })
}
