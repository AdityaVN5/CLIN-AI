"""Unified Launcher for AI Clinical Documentation Assistant.
Starts the FastAPI Backend (Port 8000) and the React Frontend (Port 3000) simultaneously.
"""
import os
import socket
import subprocess
import sys
import time

def free_port_if_in_use(port: int):
    """Automatically release port if held by a lingering background process."""
    if sys.platform == "win32":
        try:
            output = subprocess.check_output(f"netstat -ano | findstr :{port}", shell=True, text=True)
            for line in output.splitlines():
                if f":{port}" in line and "LISTENING" in line:
                    parts = line.strip().split()
                    pid = parts[-1]
                    if pid.isdigit() and int(pid) != os.getpid():
                        print(f"  [Auto-Clean] Releasing port {port} (was held by PID {pid})...")
                        subprocess.run(f"taskkill /PID {pid} /F", shell=True, capture_output=True)
                        time.sleep(1)
        except Exception:
            pass

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")
    python_exe = sys.executable

    print("=" * 65)
    print("  AI CLINICAL DOCUMENTATION ASSISTANT")
    print("  Full-Stack Integration (FastAPI + Groq + SQLite + React)")
    print("=" * 65)

    # Ensure ports 8000 and 3000 are clear
    free_port_if_in_use(8000)
    free_port_if_in_use(3000)

    # Step 1: Start FastAPI Backend
    print("\n[1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000...")
    backend_proc = subprocess.Popen(
        [python_exe, "-m", "uvicorn", "api_server:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=root_dir,
    )

    time.sleep(2)

    # Step 2: Start React / Vite Express Server
    print("[2/2] Starting React Frontend on http://localhost:3000...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir,
    )

    print("\n" + "=" * 65)
    print("  System is live!")
    print("  - React Application:  http://localhost:3000")
    print("  - FastAPI API Docs:   http://127.0.0.1:8000/docs")
    print("  Press Ctrl+C to terminate both servers.")
    print("=" * 65 + "\n")

    try:
        # Wait for both processes
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                break
            if frontend_proc.poll() is not None:
                break
    except KeyboardInterrupt:
        print("\nShutting down servers...")
    finally:
        try:
            frontend_proc.terminate()
        except Exception:
            pass
        try:
            backend_proc.terminate()
        except Exception:
            pass
        print("Done.")

if __name__ == "__main__":
    main()
