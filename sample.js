const pdfdownload = async (req, res) => {

    const data = req.body;

    const fonts = {
        Roboto: {
            normal: 'Helvetica',
            bold: 'Helvetica-Bold',
            italics: 'Helvetica-Oblique',
            bolditalics: 'Helvetica-BoldOblique'
        }
    };


    const printer = new pdfmake(fonts);

    const tableBody = [
        ["Date", "Product Name", "Total Quantity", "Count Orders", "Total Sales"]
    ];

    data.forEach((item) => {
        tableBody.push([
            item._id.date,
            item._id.productName,
            item.totalQuantity,
            item.countOrders,
            Math.floor(item.totalSales)
        ]);
    });

    const table = {
        body: tableBody
    };

    const pdfDoc = printer.createPdfKitDocument({
        content: [
            {
                text: `Sales Report (${data[0]._id.date} - ${data[data.length - 1]._id.date}) `,
                style: 'header'
            },
            {
                table: {
                    headerRows: 1,
                    widths: [100, '*', 80, 80, 80], // Adjust column widths as needed
                    body: tableBody,

                },
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 1 : 1;
                    },
                    vLineWidth: function (i) {
                        return i ? 1 : 1;
                    },
                    hLineColor: function (i) {
                        return i === 0 ? '#555' : '#aaa';
                    },
                    vLineColor: function () {
                        return '#aaa';
                    }
                },
                style: 'tableStyle'
            }
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                alignment: 'center',
                margin: [0, 0, 0, 10]
            },
            tableStyle: {
                margin: [0, 10, 0, 10],
                fontSize: 12,
                color: '#333',
                alignment: 'center',
            }
        }
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");

    pdfDoc.pipe(res);
    pdfDoc.end();

}








// ----------------------------------------------------------

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
            // customer: { $first: "$customer.firstname" },
            // shippingAddress: { $first: "$address" },
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