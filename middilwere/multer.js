const multer = require("multer");
const path = require("path");
const Category = require("../model/category");
const Product = require("../model/productmanagement");

const uploadMiddle = async (req, res, next) => {
  // const categoryData = await categoryModel.find({});
  const storage = multer.diskStorage({
    destination: "./public/uploads/",
    filename: function (req, file, cb) {
      cb(
        null,
        // file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      );
    },
  });

  const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 },
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  }).array("image", 4);

  function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: Images only");
    }
  }

  upload(req, res, (err) => {
    const category = Category.find({});
    const product = Product.find({});
    if (err) {
      res.render("admin/addproduct", {
        errors: "",
        mes: "",
        category,
        product,
      });
    } else {
      next();
    }
    // next();
  });
};

module.exports = { uploadMiddle };
