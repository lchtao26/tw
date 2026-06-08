import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const ptyScript = String.raw`
import os, pty, select, time, re, sys

repo = sys.argv[1]
playground = sys.argv[2]

pid, fd = pty.fork()
if pid == 0:
    os.chdir(repo)
    os.execvp('node', ['node', 'bin/tw.js', 'dev', playground])
else:
    buf = b''
    deadline = time.time() + 5
    while time.time() < deadline:
        if select.select([fd], [], [], 0.2)[0]:
            chunk = os.read(fd, 4096)
            if not chunk:
                break
            buf += chunk

    if b'Editor:' not in buf and b'Shortcuts' not in buf:
        sys.stderr.write(buf.decode('utf-8', errors='replace'))
        sys.exit(2)

    os.write(fd, b'e')
    time.sleep(0.3)
    while select.select([fd], [], [], 0.05)[0]:
        os.read(fd, 4096)

    os.write(fd, b'\x03')
    time.sleep(0.5)
    while select.select([fd], [], [], 0.05)[0]:
        os.read(fd, 4096)

    os.write(fd, b'o')
    time.sleep(1.2)
    out = b''
    while select.select([fd], [], [], 0.5)[0]:
        out += os.read(fd, 4096)

    sys.stdout.write(out.decode('utf-8', errors='replace'))

    os.write(fd, b'\x03')
    time.sleep(0.3)
    os.close(fd)
    os.waitpid(pid, 0)
`;

test('Ctrl-C during editor prompt keeps dev shortcuts working', async (t) => {
  if (process.env.CI) {
    t.skip('PTY integration test is flaky in CI');
  }

  await new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', ptyScript, repoRoot, 'card'], {
      cwd: repoRoot,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk;
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });

    child.on('error', reject);

    child.on('close', (code) => {
      if (code === 2) {
        reject(new Error(`dev server failed to start:\n${stderr}`));
        return;
      }

      if (code !== 0) {
        reject(new Error(`PTY script exited ${code}\n${stderr}`));
        return;
      }

      resolve(stdout);
    });
  }).then((stdout) => {
    assert.match(stdout, /opened http:\/\//);
  });
});
