const PDFDocument = require('pdfkit');

/**
 * Generate a professional invoice PDF for the given order.
 *
 * @param {Object} order - The order document (populated with user & items)
 * @param {string}  order._id                  - Order ID
 * @param {Object}  order.user                 - User object with name, email
 * @param {Object}  order.shippingAddress       - { address, city, state, postalCode, country }
 * @param {Array}   order.orderItems           - [{ title, quantity, price, image }]
 * @param {number}  order.totalPrice           - Grand total
 * @param {string}  order.paymentMethod        - e.g. "Razorpay", "COD"
 * @param {boolean} order.isPaid               - Payment status
 * @param {Date}    order.paidAt               - Payment date
 * @param {Date}    order.createdAt            - Order creation date
 * @returns {Promise<Buffer>} PDF file as a buffer
 */
const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      // ── Header ──────────────────────────────────────────────
      doc
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('BOOKSTORE', { align: 'center' });

      doc
        .fontSize(10)
        .font('Helvetica')
        .text('Your one-stop shop for books', { align: 'center' });

      doc.moveDown(0.5);

      // Divider
      doc
        .strokeColor('#333333')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(50 + pageWidth, doc.y)
        .stroke();

      doc.moveDown(1);

      // ── Invoice Meta ────────────────────────────────────────
      const invoiceNumber = `INV-${String(order._id).slice(-8).toUpperCase()}`;
      const invoiceDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : new Date().toLocaleDateString('en-IN');

      doc
        .fontSize(14)
        .font('Helvetica-Bold')
        .text('INVOICE', { align: 'left' });

      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Invoice No : ${invoiceNumber}`);
      doc.text(`Date       : ${invoiceDate}`);
      doc.text(`Order ID   : ${order._id}`);

      doc.moveDown(1);

      // ── Customer Info ───────────────────────────────────────
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Bill To:');

      doc.fontSize(10).font('Helvetica');

      const user = order.user || {};
      doc.text(`Name  : ${user.name || 'N/A'}`);
      doc.text(`Email : ${user.email || 'N/A'}`);

      if (order.shippingAddress) {
        const addr = order.shippingAddress;
        const parts = [
          addr.address,
          addr.city,
          addr.state,
          addr.postalCode,
          addr.country,
        ].filter(Boolean);
        doc.text(`Address : ${parts.join(', ')}`);
      }

      doc.moveDown(1.5);

      // ── Items Table ─────────────────────────────────────────
      const tableTop = doc.y;
      const colX = {
        index: 50,
        title: 80,
        qty: 340,
        price: 410,
        total: 490,
      };

      // Table header background
      doc
        .rect(50, tableTop - 2, pageWidth, 18)
        .fill('#333333');

      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#FFFFFF');

      doc.text('#', colX.index, tableTop, { width: 25 });
      doc.text('Item', colX.title, tableTop, { width: 250 });
      doc.text('Qty', colX.qty, tableTop, { width: 60, align: 'center' });
      doc.text('Price', colX.price, tableTop, { width: 70, align: 'right' });
      doc.text('Total', colX.total, tableTop, { width: 60, align: 'right' });

      doc.fillColor('#000000');
      doc.moveDown(0.5);

      let y = tableTop + 22;

      const items = order.orderItems || [];
      items.forEach((item, idx) => {
        const itemTotal = (item.price || 0) * (item.quantity || 1);

        // Alternate row shading
        if (idx % 2 === 0) {
          doc.rect(50, y - 2, pageWidth, 18).fill('#F5F5F5');
          doc.fillColor('#000000');
        }

        doc.fontSize(9).font('Helvetica');
        doc.text(String(idx + 1), colX.index, y, { width: 25 });
        doc.text(item.title || item.name || 'Untitled', colX.title, y, { width: 250 });
        doc.text(String(item.quantity || 1), colX.qty, y, { width: 60, align: 'center' });
        doc.text(`₹${(item.price || 0).toFixed(2)}`, colX.price, y, { width: 70, align: 'right' });
        doc.text(`₹${itemTotal.toFixed(2)}`, colX.total, y, { width: 60, align: 'right' });

        y += 20;
      });

      // Bottom border for table
      doc
        .strokeColor('#333333')
        .lineWidth(0.5)
        .moveTo(50, y)
        .lineTo(50 + pageWidth, y)
        .stroke();

      y += 10;

      // ── Totals ──────────────────────────────────────────────
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Grand Total: ₹${(order.totalPrice || 0).toFixed(2)}`, colX.price - 40, y, {
        width: 150,
        align: 'right',
      });

      y += 30;

      // ── Payment Info ────────────────────────────────────────
      doc.fontSize(10).font('Helvetica');
      doc.text(`Payment Method : ${order.paymentMethod || 'N/A'}`, 50, y);
      doc.text(
        `Payment Status : ${order.isPaid ? 'Paid' : 'Unpaid'}`,
        50,
        y + 15
      );

      if (order.isPaid && order.paidAt) {
        const paidDate = new Date(order.paidAt).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        doc.text(`Paid On        : ${paidDate}`, 50, y + 30);
      }

      // ── Footer ──────────────────────────────────────────────
      doc
        .fontSize(8)
        .font('Helvetica-Oblique')
        .text(
          'Thank you for shopping with BookStore! This is a computer-generated invoice.',
          50,
          doc.page.height - 80,
          { align: 'center', width: pageWidth }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateInvoice;
