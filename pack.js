const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

// Read version from manifest.json
const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
const version = manifest.version;
console.log(`Packaging version ${version}...`);

// List of files to pack
const files = [
  'manifest.json',
  'background.js',
  'content.js',
  'helper.js',
  'popup.html',
  'popup.js',
  'reminder.html',
  'reminder.js',
  'icons/icon16.png',
  'icons/icon48.png',
  'CHANGELOG.md',
  'README.md'
];

// Create zip file
const output = fs.createWriteStream(`kbutkiew-tools-${version}.zip`);
const archive = archiver('zip', {
  zlib: { level: 9 } // maximum compression
});

output.on('close', () => {
  console.log(`Extension v${version} packed successfully!`);
  console.log('Size:', (archive.pointer() / 1024).toFixed(2), 'KB');
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);

// Adding files to archive
files.forEach(file => {
  archive.file(file, { name: file });
});

archive.finalize(); 