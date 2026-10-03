export function generateWhatsAppLink(
  phoneNumber: string, 
  providerName: string, 
  cart: { name: string; qty: number; unitPrice: number }[], 
  totalAmount: number
) {
  // Limpiar el número de teléfono para que solo tenga dígitos y el signo +
  const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
  
  // Construir el mensaje de la orden de compra
  const greeting = `Hola ${providerName},\n\nMe gustaría realizar la siguiente orden de compra (generada vía Inventa.ai):\n\n`;
  
  const itemsList = cart.map(item => 
    `▪ *${item.name}*\n  Cantidad: ${item.qty} unds\n  Precio Unit.: $${item.unitPrice}\n  Subtotal: $${(item.qty * item.unitPrice).toFixed(2)}`
  ).join('\n\n');

  const total = `\n\n*TOTAL ESTIMADO:* $${totalAmount.toFixed(2)}\n\nPor favor confírmame la recepción de este pedido y los tiempos de entrega. ¡Gracias!`;

  const fullMessage = encodeURIComponent(greeting + itemsList + total);

  return `https://wa.me/${cleanPhone}?text=${fullMessage}`;
}
