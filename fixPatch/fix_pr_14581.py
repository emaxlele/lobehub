import subprocess
import os
import sys

repo_dir = os.path.join(os.environ['USERPROFILE'], 'Projects', 'Mio', 'lobehub')
os.chdir(repo_dir)

def run(cmd, check=True):
    result = subprocess.run(
        cmd, shell=True, capture_output=True,
        encoding='utf-8', errors='replace'
    )
    out = result.stdout.strip() if result.stdout else ''
    err = result.stderr.strip() if result.stderr else ''
    print(f"CMD: {cmd}")
    if out:
        print(f"STDOUT:\n{out}")
    if err:
        print(f"STDERR:\n{err}")
    print(f"RC: {result.returncode}")
    print("---")
    if check and result.returncode != 0:
        print("FAILED - aborting")
        sys.exit(1)
    return result

# 1. Fetch origin
run("git fetch origin")

# 2. Checkout branch PR (tracciato su origin)
run("git checkout fix/mcp-stdio-precheck-timeout-configurable")

# 3. Pull per allineare
run("git pull origin fix/mcp-stdio-precheck-timeout-configurable", check=False)

# 4. Log recente
run("git log --oneline -5")

# 5. File diff vs canary
run("git diff --name-only origin/canary...HEAD")
