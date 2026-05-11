import subprocess, os
from pathlib import Path

repo = Path(r'C:\Users\emanuele.gallo\Projects\Mio\lobehub')

def run(cmd):
    r = subprocess.run(cmd, cwd=repo, capture_output=True, text=True, shell=True)
    out = r.stdout.strip() or r.stderr.strip()
    print(f">>> {cmd}\n{out}\n")
    return r.returncode

# Torna su emaxlele-dev
run("git checkout emaxlele-dev")

# Stage patch_12
run("git add fixPatch/patches/patch_12_patchdiff_normalized_path.py")

# Commit
run('git commit -m "chore(fixPatch): add patch_12 — normalize absolute paths in editFile diff header"')

# Push
run("git push origin emaxlele-dev")

print("=== DONE ===")
