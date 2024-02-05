import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    // dont keep original name as it is file may overwrite
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
