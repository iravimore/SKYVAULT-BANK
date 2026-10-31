# Known Vulnerabilities (Intentional — DevOps Security Practice)

This backend intentionally pins `express` to an exact, slightly outdated version
(`4.19.2` instead of `^4.20.0+`) so that `npm audit` surfaces real, documented
**moderate**-severity findings for practicing a detect → investigate → remediate →
verify workflow in a CI/CD pipeline (e.g. Jenkins). Every other dependency is kept
current for Node.js 24.

Do not "fix" these by editing this file — fix them the way you would in a real job:
bump the dependency, re-run the audit, and confirm the finding is gone.

## What's pinned and why

| Package | Pinned version | Status |
|---|---|---|
| `express` | `4.19.2` (exact, no `^`) | One minor version behind the Sept 2024 Express security release (`4.20.0`) |

## Expected `npm audit` findings

### 1. ReDoS in `path-to-regexp` (bundled transitively by Express's router)
- **Advisory**: CVE-2024-45296
- **Severity**: Moderate
- **Cause**: A crafted set of route parameters can produce a regular expression
  vulnerable to catastrophic backtracking, allowing a denial-of-service via a
  single request.
- **Fixed in**: `express@4.20.0`

### 2. DoS in `body-parser` (bundled transitively by Express)
- **Advisory**: GHSA-qwcr-r2fm-qrc7
- **Severity**: Moderate
- **Cause**: `body-parser` versions before `1.20.3`, when URL-encoding is
  enabled, are vulnerable to denial-of-service via a specially crafted payload.
- **Fixed in**: `express@4.20.0`

Both were fixed in the same upstream Express release, so remediation is a single
version bump — see below.

## How to detect it (what your Jenkins stage should run)

```bash
cd backend
npm ci
npm audit --audit-level=moderate
```

Expect a non-zero exit code and two moderate findings tracing back to `express`.
If your pipeline currently swallows the exit code (e.g. `npm audit || true`),
that's also something worth fixing — a real audit gate should fail the build on
new moderate+ findings, not just log them.

## How to investigate

```bash
npm audit --json > audit-report.json   # machine-readable, good for archiving as a build artifact
npm ls express                          # confirm what's pulling in the vulnerable version
npm view express versions --json        # see what versions are available to upgrade to
```

Cross-reference the advisory IDs above against
[github.com/advisories](https://github.com/advisories) to confirm severity and
the fixed version independently of what `npm audit` tells you — don't take the
tool's word for it in a real investigation.

## How to remediate

```bash
npm install express@^4.21.2   # or whatever the current 4.x line is at the time
npm audit --audit-level=moderate   # should now report 0 vulnerabilities
npm test                             # confirm the app still works — nothing in
                                      # this codebase depends on Express internals
                                      # that changed between 4.19 and 4.21
```

## How to verify in Jenkins

A reasonable pipeline stage:

```groovy
stage('Dependency Audit') {
  steps {
    dir('backend') {
      sh 'npm ci'
      sh 'npm audit --audit-level=moderate'   // non-zero exit fails the stage
    }
  }
}
```

Run it once against the pinned `4.19.2` to see the stage fail red, then bump the
version and re-run to see it go green — that red→green cycle is the actual
exercise.
