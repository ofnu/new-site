import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

const WEBVM_FILES = {
  debian: 'https://webvm.io/fs/debian-minimal.ext2',
  config: 'https://webvm.io/config/default.json'
};

async function downloadFile(url, destination) {
  console.log(`Downloading ${url} to ${destination}...`);
  const response = await fetch(url);
  const buffer = await response.buffer();
  await fs.writeFile(destination, buffer);
}

async function main() {
  const publicDir = path.join(process.cwd(), 'public', 'webvm');
  
  // Create directories
  await fs.mkdir(publicDir, { recursive: true });
  
  // Download WebVM files
  for (const [key, url] of Object.entries(WEBVM_FILES)) {
    const filename = path.basename(url);
    await downloadFile(url, path.join(publicDir, filename));
  }

  // Create CTF challenge files
  const ctfDir = path.join(publicDir, 'ctf');
  await fs.mkdir(ctfDir, { recursive: true });
  
  // Create initial challenge files
  const challengeFiles = {
    '.bashrc': `
# CTF Environment Setup
PS1='\\u@webvm:\\w\\$ '

# Mysterious alias
alias whoami='echo "Loading identity..." && cat ~/.identity 2>/dev/null || echo "Identity not found"'

# Hidden hint
# ヒント：簡単すぎると思った？深く考えてください。
`,
    '.identity.template': '# This file will be populated with CreepJS data at runtime'
  };

  for (const [filename, content] of Object.entries(challengeFiles)) {
    await fs.writeFile(path.join(ctfDir, filename), content);
  }

  console.log('WebVM setup completed successfully!');
}

main().catch(console.error);
