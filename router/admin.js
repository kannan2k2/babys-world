const express=require('express')
const router=express.Router()
const {uploadMiddle}=require('../middilwere/multer')

const admincontroller=require('../controller/adminController/adminController')
const adminloginController=require('../controller/adminController/loginController')
const productController=require('../controller/adminController/productController')
const categoryProduct=require('../controller/adminController/categoryController')
const orderController=require('../controller/adminController/orderController')
const couponController=require('../controller/adminController/couponController')



router.get('/login',adminloginController.login)
router.post('/loginpost',adminloginController.loginpost)


router.get('/dashboard',admincontroller.dashboard)
router.get('/getFilteredData',admincontroller.getFilteredData)
router.get('/catgorywisales',admincontroller.catgorywisales)
router.get('/getWeeklySales',admincontroller.getWeeklySales)
router.get('/usermanagement',admincontroller.usermanagement)
router.get('/adminblock/:id',admincontroller.adminblock)


router.get('/productmanagement',productController.productmanagement)
router.get('/addproduct',uploadMiddle,productController.addproduct)
router.post('/productpost',uploadMiddle,productController.productpost)
router.get('/editaddproduct/:id',uploadMiddle,productController.editaddproduct)
router.get('/softdeleteproduct/:id',productController.softdeleteproduct)
router.post('/editproductpost',uploadMiddle,productController.editproductpost)


router.get('/categorymanagement',categoryProduct.categorymanagement)
router.get("/addcategory",categoryProduct.addcategory)
router.post('/addcategorypost',categoryProduct.addcategorypost)
router.get('/softdeletecategory/:id',categoryProduct.softdeletecategory)
router.get('/editaddcategory/:id',categoryProduct.editaddcategory)
router.post('/editaddcategory/:id',categoryProduct.editcategorypost)


router.get('/ordermanagement',orderController.ordermanagement)
router.patch('/updatestatus/:orderId/:itemId',orderController.updatestatus)
router.get('/orderDetailsPage/:proId/:_id',orderController.OrderDetailsPage)


router.get('/couponsmanagement', couponController.couponsmanagement)
router.get('/addCoupons', couponController.addcoupens)
router.post('/addCouponPost', couponController.addCouponPost)
router.get('/activeDactiveCoupon/:id', couponController.softDeleteCoupon)
router.get('/deleteCoupon/:id', couponController.deleteCoupon)



router.get('/dashboard',admincontroller.dashboard)

router.get('/delete-image/:id/:index',admincontroller.deleteImgEdit)


router.get('/sales-report',admincontroller.getSalesReport)
router.get('/excel-salesreport', admincontroller.exportToExcel)
router.get('/pdf-salesreport',admincontroller.exportToPdf)
// router.get('/reportsmanagement',admincontroller.reportsmanagement)






  



module.exports=router