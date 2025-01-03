import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("multer.diskStorage--", file);
    cb(null, "uploads");
  },
  filename: function (req: any, file: any, cb: any) {
    cb(null, file.originalname);
  },
});

// const fileFilter = (req: any, file: any, cb: any) => {
//     if (file.mimetype === "image/jpg" ||
//         file.mimetype === "image/jpeg" ||
//         file.mimetype === "image/png") {

//         cb(null, true);
//     } else {
//         cb(new Error("Image uploaded is not of type jpg/jpeg or png"), false);
//     }
// }
const multerConfig = multer({ storage: storage });
const upload = multerConfig.single("file");
const multiUpload = multerConfig.array("files");

export { upload, multiUpload, multerConfig };