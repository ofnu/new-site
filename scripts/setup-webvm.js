import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

// Add packages you want pre-installed
const PACKAGES_TO_INSTALL = [
  'vim',
  'git',
  'python3',
  // Add more packages as needed
];

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

async function customizeImage(imagePath) {
  const mountPoint = '/mnt/webvm-temp';
  
  console.log('Customizing debian image...');
  
  try {
    // Create mount point
    execSync(`sudo mkdir -p ${mountPoint}`);
    
    // Mount the image
    execSync(`sudo mount -o loop ${imagePath} ${mountPoint}`);
    
    // Prepare chroot environment
    execSync(`sudo cp /etc/resolv.conf ${mountPoint}/etc/resolv.conf`);
    
    // Install packages
    const installCommand = `sudo chroot ${mountPoint} /bin/bash -c "apt-get update && apt-get install -y ${PACKAGES_TO_INSTALL.join(' ')}"`;
    execSync(installCommand);
    
    // Cleanup
    execSync(`sudo umount ${mountPoint}`);
    execSync(`sudo rm -rf ${mountPoint}`);
    
    console.log('Image customization completed successfully!');
  } catch (error) {
    console.error('Error customizing image:', error);
    // Ensure cleanup even if there's an error
    try {
      execSync(`sudo umount ${mountPoint}`);
      execSync(`sudo rm -rf ${mountPoint}`);
    } catch (e) {
      // Ignore cleanup errors
    }
    throw error;
  }
}

async function main() {
  const publicDir = path.join(process.cwd(), 'public', 'webvm');
  
  // Create directories
  await fs.mkdir(publicDir, { recursive: true });
  
  // Download WebVM files
  for (const [key, url] of Object.entries(WEBVM_FILES)) {
    const filename = path.basename(url);
    const filePath = path.join(publicDir, filename);
    await downloadFile(url, filePath);
    
    // If this is the debian image, customize it
    if (key === 'debian') {
      await customizeImage(filePath);
    }
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
