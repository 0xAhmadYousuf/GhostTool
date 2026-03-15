import sys, platform, subprocess, time, logging, os
from threading import Thread, Event

# ── Suppress ALL CLI output ──
logging.disable(logging.CRITICAL)
if not sys.stdout or not hasattr(sys.stdout, 'write'):
    sys.stdout = open(os.devnull, 'w')
    sys.stderr = open(os.devnull, 'w')
try:
    _devnull = open(os.devnull, 'w')
    sys.stdout = _devnull
    sys.stderr = _devnull
except Exception:
    pass

# ── Hide console window on Windows ──
if platform.system() == "Windows":
    try:
        import ctypes
        ctypes.windll.user32.ShowWindow(ctypes.windll.kernel32.GetConsoleWindow(), 0)
    except Exception:
        pass

from flask import Flask, request, jsonify, render_template

logging.getLogger("werkzeug").setLevel(logging.CRITICAL)
logging.getLogger("flask").setLevel(logging.CRITICAL)

BASE = os.path.dirname(os.path.abspath(__file__))
ICON = os.path.join(BASE, "static", "a.ico")
app = Flask(
    __name__,
    template_folder=os.path.join(BASE, "templates"),
    static_folder=os.path.join(BASE, "static"),
)
app.config["DEBUG"] = False

_window = None
_on_top = False

def _set_on_top(val):
    global _on_top
    _on_top = val
    if _window is not None:
        try: _window.on_top = val
        except: pass

class ShutdownTimer:
    def __init__(self):
        self.shutdown_event = Event()
        self.timer_thread = None
        self.remaining = 0
        self.is_paused = False
        self.system = platform.system()

    def start(self, seconds):
        self.cancel()
        self.remaining = seconds
        self.is_paused = False
        self.shutdown_event.clear()
        self.timer_thread = Thread(target=self._run, daemon=True)
        self.timer_thread.start()

    def _run(self):
        while self.remaining > 0 and not self.shutdown_event.is_set():
            if not self.is_paused:
                time.sleep(1)
                self.remaining -= 1
            else:
                time.sleep(0.1)

    def pause(self):  self.is_paused = True
    def resume(self): self.is_paused = False

    def cancel(self):
        self.shutdown_event.set()
        self.remaining = 0
        self.is_paused = False
        if self.system == "Windows":
            try: subprocess.run(["shutdown", "/a"], check=False, capture_output=True)
            except: pass

    def execute_shutdown(self):
        try:
            if self.system == "Windows":
                subprocess.run(["shutdown", "/s", "/t", "0"], check=True, capture_output=True)
            elif self.system == "Linux":
                subprocess.run(["shutdown", "-h", "now"], check=True, capture_output=True)
            elif self.system == "Darwin":
                subprocess.run(["sudo", "shutdown", "-h", "now"], check=True, capture_output=True)
        except: pass

timer = ShutdownTimer()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/start", methods=["POST"])
def api_start():
    secs = (request.get_json() or {}).get("seconds", 0)
    timer.start(int(secs))
    return jsonify({"ok": True})

@app.route("/api/pause",  methods=["POST"])
def api_pause():  timer.pause();  return jsonify({"ok": True})

@app.route("/api/resume", methods=["POST"])
def api_resume(): timer.resume(); return jsonify({"ok": True})

@app.route("/api/cancel", methods=["POST"])
def api_cancel(): timer.cancel(); return jsonify({"ok": True})

@app.route("/api/execute_shutdown", methods=["POST"])
def api_exec():   timer.execute_shutdown(); return jsonify({"ok": True})

@app.route("/api/status", methods=["GET"])
def api_status():
    return jsonify({
        "remaining": timer.remaining,
        "paused": timer.is_paused,
        "running": (timer.timer_thread is not None
                    and timer.timer_thread.is_alive()
                    and not timer.shutdown_event.is_set())
    })

@app.route("/api/ontop", methods=["POST"])
def api_ontop():
    val = (request.get_json() or {}).get("enabled", False)
    _set_on_top(bool(val))
    return jsonify({"ok": True, "on_top": _on_top})

@app.route("/api/ontop", methods=["GET"])
def api_ontop_get():
    return jsonify({"on_top": _on_top})

if __name__ == "__main__":
    try:
        import webview
    except ImportError:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "pywebview", "--break-system-packages", "-q"],
            capture_output=True,
        )
        import webview

    win = webview.create_window(
        "GhostTool",
        url=app,
        width=520,
        height=800,
        resizable=True,
        background_color="#08080f",
        text_select=True,
        zoomable=False,
        confirm_close=False,
        on_top=False,
    )
    _window = win
    webview.start(debug=False, icon=ICON)