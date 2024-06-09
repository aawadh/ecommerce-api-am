import cloudinaryPackage from "cloudinary";


//configure cloudinary
const cloudinary = cloudinaryPackage.v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET_KEY,
});

// const invoiceUpload = async () => {
   
//     console.log();
// }

export async function invoiceUpload() {
    const result = await cloudinary.uploader.upload("output.pdf")
    .then(() => {
        console.log(result.url);
        return result.url;
    })
    .catch(err => console.error('Error:', err));


};



