import { v2 as cloudinary } from 'cloudinary';

// Use correct Cloudinary credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dgkcmwlsq';
const apiKey = process.env.CLOUDINARY_API_KEY || '354874479559337';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'DUgvbAIVRRjH0ruOD9FBs97tC4M';

console.log('CLOUDINARY_CLOUD_NAME:', cloudName);
console.log('CLOUDINARY_API_KEY:', apiKey);
console.log('CLOUDINARY_API_SECRET:', apiSecret);

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

export default cloudinary; 