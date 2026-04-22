import { sendMail } from './mailer.js';

const formatMoney = (value = 0) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

const getPaymentText = (order) => {
  if (order.paymentMethod === 'partial_cod') {
    return `We received your advance payment of ${formatMoney(order.amountPaid)}. You will pay ${formatMoney(order.amountDue)} on delivery.`;
  }

  if (order.paymentMethod === 'prepaid') {
    return `We received your full payment of ${formatMoney(order.amountPaid || order.total)}.`;
  }

  return `Your order is confirmed for cash on delivery.`;
};

const getItemsText = (items = []) =>
  items
    .map((item) => `${item.productName} - Size ${item.size} x ${item.quantity}: ${formatMoney(item.price * item.quantity)}`)
    .join('\n');

const getItemsHtml = (items = []) =>
  items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
            <strong>${item.productName}</strong><br />
            <span style="color: #666;">Size ${item.size} x ${item.quantity}</span>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; text-align: right;">
            ${formatMoney(item.price * item.quantity)}
          </td>
        </tr>
      `
    )
    .join('');

export async function sendOrderPaymentEmail(order) {
  if (!order.customerEmail || Number(order.amountPaid || 0) <= 0) {
    return { skipped: true };
  }

  const subject = `Payment received for ${order.orderNumber} - Advik Creations`;
  const paymentText = getPaymentText(order);

  return sendMail({
    to: order.customerEmail,
    subject,
    text: `Hi ${order.customerName},

Thank you for shopping with Advik Creations.

${paymentText}

Order number: ${order.orderNumber}
Order total: ${formatMoney(order.total)}
Paid online: ${formatMoney(order.amountPaid)}
Pay on delivery: ${formatMoney(order.amountDue)}

Items:
${getItemsText(order.items)}

Delivery address:
${order.shippingAddress?.street || ''}
${order.shippingAddress?.addressLine2 || ''}
${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zipCode || ''}

We will process your order shortly.

Advik Creations`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
        <div style="padding: 20px 0; border-bottom: 1px solid #eee;">
          <h1 style="margin: 0; color: #dc2626; font-size: 24px;">Advik Creations</h1>
          <p style="margin: 6px 0 0; color: #666;">Payment confirmation</p>
        </div>

        <div style="padding: 24px 0;">
          <h2 style="margin: 0 0 12px; font-size: 20px;">Hi ${order.customerName},</h2>
          <p style="font-size: 15px; line-height: 1.6;">${paymentText}</p>

          <div style="background: #f9fafb; border: 1px solid #eee; border-radius: 10px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>Order number:</strong> ${order.orderNumber}</p>
            <p style="margin: 0 0 8px;"><strong>Order total:</strong> ${formatMoney(order.total)}</p>
            <p style="margin: 0 0 8px;"><strong>Paid online:</strong> ${formatMoney(order.amountPaid)}</p>
            <p style="margin: 0;"><strong>Pay on delivery:</strong> ${formatMoney(order.amountDue)}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 18px 0;">
            ${getItemsHtml(order.items)}
          </table>

          <div style="margin-top: 20px;">
            <p style="margin: 0 0 6px;"><strong>Delivery address</strong></p>
            <p style="margin: 0; color: #4b5563; line-height: 1.6;">
              ${order.shippingAddress?.street || ''}<br />
              ${order.shippingAddress?.addressLine2 ? `${order.shippingAddress.addressLine2}<br />` : ''}
              ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.zipCode || ''}
            </p>
          </div>

          <p style="margin-top: 24px; color: #4b5563;">We will process your order shortly.</p>
        </div>

        <div style="padding: 16px 0; border-top: 1px solid #eee; color: #777; font-size: 13px;">
          This message was sent by Advik Creations.
        </div>
      </div>
    `,
  });
}
