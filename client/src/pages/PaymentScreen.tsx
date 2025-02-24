import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { type IVenue } from "@shared/schema";
import { ArrowLeft, Copy, QrCode, Smartphone } from "lucide-react";
import {
  generateBookingReference,
  generateEasyPaisaLink,
  generateQRCode,
  formatPrice,
  type PaymentDetails
} from "@/lib/payment";
import { copyToClipboard, isMobile, isLandlineNumber, isPaymentDisabled } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

export default function PaymentScreen() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [bookingReference] = useState(() => generateBookingReference(id || ""));

  const { data: venue, isLoading } = useQuery<IVenue>({
    queryKey: ["venue", id],
    queryFn: async () => {
      const response = await fetch(`/api/venues/${id}`);
      if (!response.ok) throw new Error("Failed to fetch venue");
      return response.json();
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (venue && isPaymentDisabled(venue.name)) {
      toast({
        title: "Direct Payment Required",
        description: "Please contact the venue directly to make a booking.",
        duration: 5000,
      });
      window.history.back();
    }
  }, [venue, toast]);

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      toast({
        title: `${label} copied!`,
        description: "You can now paste it in your EasyPaisa app",
      });
    }
  };

  const paymentDetails: PaymentDetails = {
    venueId: id || "",
    venueName: venue?.name || "",
    amount: venue?.price ? Number(venue.price) : 0,
    mobileNumber: venue?.phone || "",
    bookingReference,
  };

  if (isLoading || !venue) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-4 h-4 bg-gray-900 rounded-full animate-ping"></div>
      </div>
    );
  }

  const easyPaisaLink = generateEasyPaisaLink(paymentDetails);
  const qrCodeUrl = generateQRCode(paymentDetails);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Venue
          </Button>
        </div>
      </div>

      <div className="py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl font-bold mb-2">Payment Details</h1>
            <p className="text-gray-600">
              Please complete your payment to confirm booking for {venue.name}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 space-y-6">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Booking Details</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Venue</p>
                    <p className="font-medium">{venue.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Amount</p>
                    <p className="font-medium">{formatPrice(Number(venue.price))}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Reference</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{bookingReference}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopy(bookingReference, "Reference")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Method</h3>
                {!isLandlineNumber(venue.phone) ? (
                  <div className="flex flex-col items-center gap-6 py-4">
                    <img 
                      src="/easypaisa-logo.png" 
                      alt="EasyPaisa" 
                      className="h-16 w-auto object-contain mb-2"
                      style={{ filter: 'brightness(1.1) contrast(1.1)' }}
                    />
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{venue.phone}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopy(venue.phone, "Phone number")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-600">
                    <p>Please contact the venue directly at</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <p className="font-medium">{venue.phone}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopy(venue.phone, "Phone number")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Code Section */}
              {!isLandlineNumber(venue.phone) && (
                <motion.div 
                  className="border-t pt-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-center mb-4">
                    Quick Payment via QR Code
                  </h3>
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative group">
                      <motion.div
                        className="absolute -inset-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg opacity-40 blur group-hover:opacity-60 transition-opacity"
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                      />
                      <motion.img
                        src={qrCodeUrl}
                        alt="Payment QR Code"
                        className="relative w-48 h-48 rounded-lg shadow-lg bg-white p-2"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      />
                    </div>
                    <div className="space-y-3 text-center max-w-sm mx-auto">
                      <p className="text-sm font-medium text-gray-900">
                        How to pay using QR code:
                      </p>
                      <ol className="text-sm text-gray-600 text-left space-y-2">
                        <li>1. Open your EasyPaisa app</li>
                        <li>2. Tap on "Scan QR Code"</li>
                        <li>3. Point your camera at this QR code</li>
                        <li>4. Verify the amount and complete payment</li>
                      </ol>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col md:flex-row gap-4 mt-8">
                {!isLandlineNumber(venue.phone) && isMobile() ? (
                  <a
                    href={easyPaisaLink}
                    className="w-full"
                  >
                    <Button
                      className="w-full bg-[#4caf50] hover:bg-[#43a047] text-lg font-medium py-6 shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Open in EasyPaisa App
                    </Button>
                  </a>
                ) : (
                  <Button
                    className="w-full text-lg font-medium py-6"
                    onClick={() => handleCopy(venue.phone, "Phone number")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Number
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="w-full text-lg font-medium py-6"
                  onClick={() => handleCopy(bookingReference, "Reference ID")}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Reference ID
                </Button>
              </div>
            </Card>
          </motion.div>

          <div className="text-center text-sm text-gray-500">
            <p>After making the payment, please keep the transaction ID safe.</p>
            <p>Your booking will be confirmed once the payment is verified.</p>
          </div>

          {/* Support Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-600">
              Having trouble? Contact venue support at{" "}
              <a 
                href={`tel:${venue.phone}`}
                className="text-primary hover:underline font-medium"
              >
                {venue.phone}
              </a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
