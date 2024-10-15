const User = require("../../model/user");
const { Order } = require("../../model/order");
const mongoose = require("mongoose");
const Product = require("../../model/productmanagement");
const Category = require("../../model/category");
const Coupon = require("../../model/coupon");
const session = require("express-session");
const { request } = require("express");
const path = require("path");
const { findOne } = require("../../model/otp");
const exceljs = require("exceljs");
const { error } = require("console");
const PDFDocument = require('pdfkit');
const { pipeline } = require("stream");


const dashboard = async (req, res) => {
  try {
    // Sales data per year
    const salesDataYearly = await Order.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Sales data per month
    const salesDataMonthly = await Order.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top 10 categories
    const topCategories = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "category",
          localField: "products.product",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name",
          totalSales: { $sum: "$products.totalPrice" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
    ]);

    // Top 10 products
    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails._id",
          name: { $first: "$productDetails.ProductName" },
          totalQuantitySold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 10 },
    ]);
    
    // Calculate total quantity sold for all products
    const totalQuantitySold = topProducts.reduce((sum, product) => sum + product.totalQuantitySold, 0);

    // Payment methods overview
    const paymentMethods = await Order.aggregate([
      {
        $group: {
          _id: "$paymentInfo.method",
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.render("admin/dashboard", {
      topProducts,
      // topCategories,
      salesDataYearly,
      salesDataMonthly,
      paymentMethods,
      totalQuantitySold,
    });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Server Error");
  }
};

const getFilteredData = async (req, res) => {
  const filterType = req.query.filterType || "yearly";

  try {
    let matchStage = {};

    if (filterType === "monthly") {
      matchStage = {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$totalAmount" },
        },
      };
    } else if (filterType === "weekly") {
      matchStage = {
        $group: {
          _id: { $week: "$createdAt" },
          totalSales: { $sum: "$totalAmount" },
        },
      };
    } else {
      matchStage = {
        $group: {
          _id: { $year: "$createdAt" },
          totalSales: { $sum: "$totalAmount" },
        },
      };
    }

    const salesData = await Order.aggregate([
      matchStage,
      { $sort: { _id: 1 } },
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $group: {
          _id: "$productDetails._id",
          name: { $first: "$productDetails.ProductName" },
          totalQuantitySold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalQuantitySold: -1 } },
      { $limit: 10 },
    ]);

    const topCategories = await Order.aggregate([
      { $unwind: "$products" },
      {
        $lookup: {
          from: "categories",
          localField: "products.product",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $group: {
          _id: "$category.name",
          totalSales: { $sum: "$products.totalPrice" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
    ]);

    const paymentMethods = await Order.aggregate([
      {
        $group: {
          _id: "$paymentInfo.method",
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.json({ salesData, topProducts, topCategories, paymentMethods });
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Server Error");
  }
};

const usermanagement = async (req, res) => {
  const users = await User.find({});
  res.render("admin/usermanagement", { users });
};

const adminblock = async (req, res) => {
  const id = req.params.id;
  console.log(id);
  try {
    const user = await User.findById(id);

    if (user.blocked) {
      const block = await User.updateOne(
        { _id: id },
        { $set: { blocked: false } }
      );
      return res.redirect("/admin/usermanagement");
    } else {
      const result = await User.updateOne(
        { _id: id },
        { $set: { blocked: true } }
      );
      return res.redirect("/admin/usermanagement");
    }
  } catch (error) {
    res.status(404).send("User not found or already blocked");
  }
};

const deleteImgEdit = async (req, res) => {
  try {
    const id = req.params.id;
    const index = parseInt(req.params.index, 10); 
    console.log(id, index);

    const productDelete = await Product.findById(id);

    if (!productDelete) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log(productDelete.image);

    // Filter out the image at the specified index
    const updatedImg = productDelete.image.filter((_, i) => i !== index);

    productDelete.image = updatedImg;
    await productDelete.save();

    return res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getSalesReport = async (req, res) => {
  let startDate = req.query.startDate
    ? new Date(req.query.startDate)
    : new Date();
  let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).json({ message: "Invalid date format" });
  }

  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);

  try {
    const orders = await Order.aggregate([

     
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$products" }, // Unwind products array to filter at the product level
      {
        $match: {
          "products.orderStatus": "Delivered", // Filter for delivered products only
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $group: {
          _id: "$_id",
          customer: { $first: "$customer" },
          shippingAddress: { $first: "$address.address" },
          paymentMethod: { $first: "$paymentInfo.method" },
          status: { $first: "$products.orderStatus" },
          totalAmount: { $first: "$totalAmount" },
          createdAt: { $first: "$createdAt" },
          orderedItems: {
            $push: {
              product_name: {
                $arrayElemAt: ["$productDetails.ProductName", 0],
              },
              price: "$products.price",
              quantity: "$products.quantity",
              itemTotal: {
                $multiply: ["$products.price", "$products.quantity"],
              },
            },
          },
        },
      },
    ]);

    // startDate = startDate.toISOString().split("T")[0];
    // endDate = endDate.toISOString().split("T")[0];
    startDate =
    startDate.getFullYear() +
    "-" +
    ("0" + (startDate.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + startDate.getUTCDate()).slice(-2);

endDate =
    endDate.getFullYear() +
    "-" +
    ("0" + (endDate.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + endDate.getUTCDate()).slice(-2);
 
    res.render("admin/salesreport", { orders, startDate, endDate });
  } catch (error) {
    console.error("Error retrieving sales report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const exportToExcel = async (req, res) => {
  let startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : new Date();
  let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  console.log(startDate, endDate);

  try {
    const orders = await Order.aggregate([

     
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$products" }, // Unwind products array to filter at the product level
      {
        $match: {
          "products.orderStatus": "Delivered", // Filter for delivered products only
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$products" },
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $group: {
          _id: "$_id",
          customer: { $first: "$customer.firstname" },
          shippingAddress: { $first: "$shippingAddress" },
          paymentMethod: { $first: "$paymentInfo.method" },
          status: { $first: "$products.orderStatus" },
          totalAmount: { $first: "$totalAmount" },
          createdAt: { $first: "$createdAt" },
          orderedItems: {
            $push: {
              product_name: {
                $arrayElemAt: ["$productDetails.ProductName", 0],
              },
              price: "$products.price",
              quantity: "$products.quantity",
              itemTotal: {
                $multiply: ["$products.price", "$products.quantity"],
              },
            },
          },
        },
      },
    ]);
    const workBook = new exceljs.Workbook();
    const worksheet = workBook.addWorksheet("Sales Report");

    worksheet.columns = [
      { header: "Order ID", key: "_id" },
      { header: "Customer", key: "customer" },
      { header: "Product Name", key: "productName" },
      { header: "Model", key: "model" },
      { header: "Price", key: "price" },
      { header: "Quantity", key: "quantity" },
      { header: "Total Amount", key: "totalAmount" },
      { header: "Shipping Address", key: "shippingAddress" },
      { header: "Payment Method", key: "paymentMethod" },
      { header: "Status", key: "status" },
      { header: "Date", key: "createdAt" },
    ];

    orders.forEach((order) => {
      order.customer = Array.isArray(order.customer) ? order.customer[0] : '';
      order.orderedItems.forEach((item) => {
        const rowData = {
          _id: order._id.toString().slice(-7).toUpperCase(),
          customer: order.customer,
          productName: item.product_name,
          model: item.model,
          price: item.price,
          quantity: item.quantity,
          totalAmount: order.totalAmount,
          shippingAddress: order.shippingAddress,
          paymentMethod: order.paymentMethod,
          status: order.status,
          createdAt: order.createdAt,
        };
        worksheet.addRow(rowData);
      });
    });

    worksheet.eachRow({ includeEmpty: false, skipHeader: true }, (row) => {
      row.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE5E6DE' },
        };
      });
    });

    worksheet.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF3CF696' },
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=orders.xlsx"
    );

    await workBook.xlsx.write(res);
    res.status(200).end();
  } catch (err) {
    console.error("Error generating Excel file:", err);
    res.status(500).json({ message: "Error generating Excel file" });
  }
};

const exportToPdf = async (req, res) => {
  let startDate = req.query.startDate ? new Date(req.query.startDate) : new Date();
  let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
  startDate.setUTCHours(0, 0, 0, 0);
  endDate.setUTCHours(23, 59, 59, 999);

  try {
    const orders = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$products" },
      {
        $match: {
          "products.orderStatus": "Delivered",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: "$customer" }, // Unwind the customer to use directly in the next stages
      {
        $lookup: {
          from: "products",
          localField: "products.product",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $group: {
          _id: "$_id",
          customer: { $first: "$customer.firstname" },
          shippingAddress: { $first: "$shippingAddress" },
          paymentMethod: { $first: "$paymentInfo.method" },
          status: { $first: "$products.orderStatus" },
          totalAmount: { $first: "$totalAmount" },
          createdAt: { $first: "$createdAt" },
          orderedItems: {
            $push: {
              productName: { $arrayElemAt: ["$productDetails.ProductName", 0] },
              price: "$products.price",
              quantity: "$products.quantity",
              itemTotal: { $multiply: ["$products.price", "$products.quantity"] },
            },
          },
        },
      },
    ]);
    
      // Create a new PDF document
      const doc = new PDFDocument();

      // Set response headers for PDF
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');

      // Pipe the PDF to the response
      doc.pipe(res);

      // Add content to the PDF
      doc.fontSize(16).text('Sales Report', { align: 'center', underline: true, lineGap: 10, width: 500 }).moveDown();

      // Add items with numbering
      doc.font('Helvetica');

      orders.forEach((order, index) => {
        doc.text(`Order ${index + 1}`, { underline: true });
        order.orderedItems.forEach(item => {
          doc.text(`Product Name: ${item.productName}`);
          doc.text(`Price: ₹${item.price.toFixed(2)}`);
          doc.text(`Quantity: ${item.quantity}`);
          doc.text(`Item Total: ₹${item.itemTotal.toFixed(2)}`);
          doc.moveDown();
        });
        doc.text(`Shipping Address: ${order.shippingAddress}`);
        doc.text(`Payment Method: ${order.paymentMethod}`);
        doc.text(`Order Status: ${order.status}`);
        doc.text(`Order Total: ₹${order.totalAmount.toFixed(2)}`);
        doc.moveDown();
      });
      

      // Finalize the PDF
      doc.end();
  } catch (err) {
      console.log(err);
      res.status(500).send('Internal Server Error');
    }
};


const catgorywisales = async (req, res) => {
  try {
    const categoryWiseSales = await Order.aggregate([
      { $unwind: "$products" }, // Deconstruct the products array
      {
        $lookup: {
          from: "categories",
          localField: "products.product",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" }, // Unwind category
      {
        $group: {
          _id: "$category.name", // Group by category name
          totalSales: { $sum: "$products.totalPrice" }, // Sum of total price per category
        },
      },
      { $sort: { totalSales: -1 } }, // Sort by sales
    ]);

    res.json(categoryWiseSales);
  } catch (error) {
    console.error("Error fetching category-wise sales:", error);
    res.status(500).send("Server Error");
  }
};

const getWeeklySales = async (req, res) => {
  try {
    const weeklySales = await Order.aggregate([
      {
        $group: {
          _id: { $week: "$createdAt" }, // Group by the week of the year
          totalSales: { $sum: "$totalAmount" }, // Sum of total sales per week
          totalOrders: { $sum: 1 }, // Total orders per week
        },
      },
      { $sort: { _id: 1 } }, // Sort by week
    ]);

    res.json(weeklySales);
  } catch (error) {
    console.error("Error fetching weekly sales:", error);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  dashboard,
  usermanagement,
  adminblock,
  getSalesReport,
  exportToExcel,
  deleteImgEdit,
  catgorywisales,
  getWeeklySales,
  getFilteredData,
  exportToPdf,
};
