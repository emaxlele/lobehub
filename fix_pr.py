import subprocess, os, sys

os.chdir(os.path.join(os.environ['USERPROFILE'], 'Projects', 'Mio', 'lobehub'))

def run(cmd):
    r = subprocess.run(cmd, shell=True, capture_output=True, encoding='utf-8', errors='replace')
    print(f"$ {cmd}\n{r.stdout.strip()}")
    if r.stderr.strip(): print("ERR:", r.stderr.strip())
    print()
    return r

run("git fetch origin")
run("git checkout fix/mcp-stdio-precheck-timeout-configurable")
run("git rm --cached .github/workflows/sync-upstream-main.yml")
run("git rm --cached .github/workflows/sync-upstream.yml")
run("git rm .github/workflows/sync-upstream-main.yml")
run("git rm .github/workflows/sync-upstream.yml")
run('git commit -m "chore: remove accidentally included workflow files from PR"')
run("git push origin fix/mcp-stdio-precheck-timeout-configurable")
print("DONE")
