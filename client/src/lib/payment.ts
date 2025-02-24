import { isMobile } from './utils';

export interface PaymentDetails {
  venueId: string;
  venueName: string;
  amount: number;
  mobileNumber: string;
  bookingReference: string;
}

export function generateBookingReference(venueId: string): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 6);
  return `BK-${venueId.substring(0, 4)}-${timestamp}-${randomStr}`.toUpperCase();
}

export function generateEasyPaisaLink(details: PaymentDetails): string {
  const params = new URLSearchParams({
    number: details.mobileNumber,
    amount: details.amount.toString(),
    reference: details.bookingReference,
    description: `Booking for ${details.venueName}`
  });

  // If on mobile, return deep link, otherwise return mobile number
  if (isMobile()) {
    return `easypaisa://payment?${params.toString()}`;
  }
  return `tel:${details.mobileNumber}`;
}

// Format price for display
export function formatPrice(price: number): string {
  return price.toLocaleString('en-PK', {
    style: 'currency',
    currency: 'PKR'
  });
}

// Generate a QR code URL for the payment
export function generateQRCode(details: PaymentDetails): string {
  const text = `EasyPaisa Payment\nNumber: ${details.mobileNumber}\nAmount: PKR ${details.amount}\nReference: ${details.bookingReference}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
}
