import subprocess
import os
import sys

repo_dir = os.path.join(os.environ['USERPROFILE'], 'Projects', 'Mio', 'lobehub')
os.chdir(repo_dir)

def run(cmd, check=True):
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print(f"CMD: {cmd}")
    print(f"STDOUT: {result.stdout}")
    print(f"STDERR: {result.stderr}")
    print(f"RC: {result.returncode}")
    print("---")
    if check and result.returncode != 0:
        print("FAILED - aborting")
        sys.exit(1)
    return result

# Stato attuale
run("git status")
run("git branch -a | findstr mcp-stdio", check=False)
run("git log --oneline -5")
