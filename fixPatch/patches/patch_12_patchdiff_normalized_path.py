r"""
PATCH 12 — local-file-shell: normalizza path assoluti nel diff header di editFile
==================================================================================
Quando filePath è assoluto (es: /workspace/src/file.ts), il codice in edit.ts
prepone `a/` e `b/` generando `diff --git a//workspace/...` (doppio slash).
getSingularPatch in @lobehub/ui rifiuta il formato malformato.

Fix: prima di costruire diffText, rimuove il leading `/` da filePath se presente.

File modificato:
  packages/local-file-shell/src/file/edit.ts

PR upstream: #14700 (OPEN)

Idempotente: check() verifica che `normalizedPath` sia già presente.
"""

PATCH_ID    = "patch_12_patchdiff_normalized_path"
description = "local-file-shell editFile: normalizza path assoluti nel diff --git header"

TARGET = "packages/local-file-shell/src/file/edit.ts"

CHECK_STRING  = "normalizedPath"

OLD_LINE = "    const diffText = `diff --git a/${filePath} b/${filePath}\\n${cleanPatch}`;"

NEW_CODE = (
    "    // Normalize absolute paths (remove leading /) to prevent double slashes in diff header\n"
    "    const normalizedPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;\n"
    "    const diffText = `diff --git a/${normalizedPath} b/${normalizedPath}\\n${cleanPatch}`;"
)


def check(repo):
    f = repo / TARGET
    if not f.exists():
        return False
    return CHECK_STRING in f.read_text(encoding="utf-8")


def apply(repo):
    f = repo / TARGET
    if not f.exists():
        print(f"    [WARN] {PATCH_ID}: file non trovato: {TARGET} — skip")
        return
    text = f.read_text(encoding="utf-8")
    if CHECK_STRING in text:
        # Già applicata
        return
    if OLD_LINE not in text:
        print(f"    [WARN] {PATCH_ID}: OLD_LINE non trovata in {TARGET} — upstream potrebbe aver già cambiato il codice. Verifica manuale.")
        return
    new_text = text.replace(OLD_LINE, NEW_CODE, 1)
    assert new_text != text, f"{PATCH_ID}: replace non ha prodotto diff in {TARGET}"
    f.write_text(new_text, encoding="utf-8")
    print(f"    [OK] {PATCH_ID}: normalizedPath applicato in {TARGET}")
