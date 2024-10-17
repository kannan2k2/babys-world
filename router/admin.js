const express=require('express')
const router=express.Router()
const {uploadMiddle}=require('../middilwere/multer')

const admincontroller=require('../controller/adminController/adminController')
const adminloginController=require('../controller/adminController/loginController')
const productController=require('../controller/adminController/productController')
const categoryProduct=require('../controller/adminController/categoryController')
const orderController=require('../controller/adminController/orderController')
const couponController=require('../controller/adminController/couponController')

const admincheck=(req,res,next)=>{
    const admin=req.session.email
    if(!admin){
        return res.redirect('/admin/login')
        
}else{
        next()
    }
}

router.get('/login',adminloginController.login)
router.post('/loginpost',adminloginController.loginpost)


router.get('/dashboard',admincheck,admincontroller.dashboard)
router.get('/getFilteredData',admincheck,admincontroller.getFilteredData)
router.get('/catgorywisales',admincheck,admincontroller.catgorywisales)
router.get('/getWeeklySales',admincheck,admincontroller.getWeeklySales)
router.get('/usermanagement',admincheck,admincontroller.usermanagement)
router.get('/adminblock/:id',admincheck,admincontroller.adminblock)


router.get('/productmanagement',admincheck,productController.productmanagement)
router.get('/addproduct',admincheck,uploadMiddle,productController.addproduct)
router.post('/productpost',admincheck,uploadMiddle,productController.productpost)
router.get('/editaddproduct/:id',admincheck,uploadMiddle,productController.editaddproduct)
router.get('/softdeleteproduct/:id',admincheck,productController.softdeleteproduct)
router.post('/editproductpost',uploadMiddle,admincheck,productController.editproductpost)


router.get('/categorymanagement',admincheck,categoryProduct.categorymanagement)
router.get("/addcategory",admincheck,categoryProduct.addcategory)
router.post('/addcategorypost',admincheck,categoryProduct.addcategorypost)
router.get('/softdeletecategory/:id',admincheck,categoryProduct.softdeletecategory)
router.get('/editaddcategory/:id',admincheck,categoryProduct.editaddcategory)
router.post('/editaddcategory/:id',admincheck,categoryProduct.editcategorypost)


router.get('/ordermanagement',admincheck,orderController.ordermanagement)
router.patch('/updatestatus/:orderId/:itemId',admincheck,orderController.updatestatus)
router.get('/orderDetailsPage/:proId/:_id',admincheck,orderController.OrderDetailsPage)


router.get('/couponsmanagement',admincheck,couponController.couponsmanagement)
router.get('/addCoupons',admincheck,couponController.addcoupens)
router.post('/addCouponPost',admincheck,couponController.addCouponPost)
router.get('/activeDactiveCoupon/:id',admincheck,couponController.softDeleteCoupon)
router.get('/deleteCoupon/:id',admincheck,couponController.deleteCoupon)



router.get('/dashboard',admincheck,admincontroller.dashboard)

router.get('/delete-image/:id/:index',admincheck,admincontroller.deleteImgEdit)


router.get('/sales-report',admincheck,admincontroller.getSalesReport)
router.get('/excel-salesreport',admincheck,admincontroller.exportToExcel)
router.get('/pdf-salesreport',admincheck,admincontroller.exportToPdf)
// router.get('/reportsmanagement',admincontroller.reportsmanagement)






  



module.exports=router