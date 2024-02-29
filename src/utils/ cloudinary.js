import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRECT, 
});

const uploadOnCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      return;
    }
    const res = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(filePath);
    return res
  } catch (error) {
    fs.unlinkSync(filePath);
    return null
    
  }
}


const deleteOnCloudinary = async (publicId) => {
  try {
    if (!publicId) {
      return;
    }
    const res = await cloudinary.uploader.destroy(publicId);
    return res
  } catch (error) {
    return null
  }
}

export {uploadOnCloudinary , deleteOnCloudinary}