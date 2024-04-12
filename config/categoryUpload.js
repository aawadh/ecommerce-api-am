import cloudinaryPackage from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";



const cloudinary = cloudinaryPackage.v2;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

// Create storage engine
const storage = new CloudinaryStorage({
    cloudinary,
    allowedFormats:['jpg','png','jpeg'],
    params:{
        folder: "Ecommerce-api",
    },
});

//inint multer with storage engine
const categoryFileUpload = multer({
    storage,
});

export default categoryFileUpload;