import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const keysDir = path.resolve(__dirname, '../../keys');

// Create keys directory if it doesn't exist
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

const privateKeyPath = path.join(keysDir, 'private.pem');
const publicKeyPath = path.join(keysDir, 'public.pem');

// Check if keys already exist
if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
  console.log('🔑 RSA keys already exist. Skipping generation.');
  console.log(`   Private: ${privateKeyPath}`);
  console.log(`   Public:  ${publicKeyPath}`);
  process.exit(0);
}

console.log('🔑 Generating RSA-2048 key pair for JWT RS256...');

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

fs.writeFileSync(privateKeyPath, privateKey);
fs.writeFileSync(publicKeyPath, publicKey);

console.log('✅ RSA keys generated successfully!');
console.log(`   Private: ${privateKeyPath}`);
console.log(`   Public:  ${publicKeyPath}`);
console.log('');
console.log('⚠️  NEVER commit these keys to version control!');
