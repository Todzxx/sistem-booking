// ============================================================
// FILE: middleware/imageMagicBytes.js
// Validasi keaslian file gambar dengan membaca magic bytes (signature)
// Mencegah upload file palsu yang hanya ekstensinya .jpg/.png
// ============================================================

const fs = require('fs');
const path = require('path');
const AppError = require('../utils/AppError');

// Daftar signature byte untuk format gambar yang didukung
const MAGIC_BYTES = [
  { bytes: [0xFF, 0xD8, 0xFF], name: 'JPEG' },
  { bytes: [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], name: 'PNG' },
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x37, 0x61], name: 'GIF87a' },
  { bytes: [0x47, 0x49, 0x46, 0x38, 0x39, 0x61], name: 'GIF89a' },
  { bytes: [0x42, 0x4D], name: 'BMP' },
  { bytes: [0x49, 0x49, 0x2A, 0x00], name: 'TIFF-LE' },
  { bytes: [0x4D, 0x4D, 0x00, 0x2A], name: 'TIFF-BE' },
];

// Cek apakah buffer diawali dengan byte tertentu
function matchesMagicBytes(buffer, signature) {
  for (let i = 0; i < signature.length; i++) {
    if (buffer[i] !== signature[i]) return false;
  }
  return true;
}

// WebP punya format RIFF header yang unik
function isWebP(buffer) {
  if (buffer.length < 12) return false;
  return (
    buffer[0] === 0x52 && buffer[1] === 0x49 &&
    buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 &&
    buffer[10] === 0x42 && buffer[11] === 0x50
  );
}

// Middleware — baca 12 byte pertama file, cocokkan dengan magic bytes
function validateImageMagicBytes(req, res, next) {
  if (!req.file) return next();

  const filePath = req.file.path;
  const headerSize = 12;

  try {
    const fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(headerSize);
    fs.readSync(fd, buffer, 0, headerSize, 0);
    fs.closeSync(fd);

    const isValid = MAGIC_BYTES.some((sig) => matchesMagicBytes(buffer, sig)) || isWebP(buffer);

    // Jika tidak cocok format gambar manapun, hapus file dan tolak
    if (!isValid) {
      try { fs.unlinkSync(filePath); } catch {}
      return next(new AppError('Invalid image file: the uploaded file is not a valid image', 400));
    }

    next();
  } catch (error) {
    return next(new AppError('Failed to validate uploaded file', 500));
  }
}

module.exports = validateImageMagicBytes;
