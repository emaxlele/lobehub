import subprocess
from pathlib import Path

repo = Path(r'C:\Users\emanuele.gallo\Projects\Mio\lobehub')

def run(cmd):
    r = subprocess.run(cmd, cwd=repo, capture_output=True, text=True, shell=True)
    out = r.stdout.strip() or r.stderr.strip()
    print(f">>> {cmd}\n{out}\n")
    return r.returncode

# File da rimuovere dal tracking git (ma non da disco se in .gitignore)
to_remove = [
    'fix_pr.py',
    'fixPatch/check_pr_branch.py',
    'fixPatch/fix_pr_14581.py',
    'fixPatch/post_comment.py',
    'fixPatch/comment_14700.md',
    '.github/workflows/sync-upstream.yml',
    '.github/workflows/sync-upstream-main.yml',
]

for f in to_remove:
    full = repo / f.replace('/', '\\')
    run(f'git rm --cached --ignore-unmatch "{f}"')
    if full.exists():
        full.unlink()
        print(f"    [deleted] {f}")

# Commit cleanup
run('git add -A')
run('git commit -m "chore: cleanup temp scripts and fork-only workflow files"')
run('git push origin emaxlele-dev')

print("=== CLEANUP DONE ===")
