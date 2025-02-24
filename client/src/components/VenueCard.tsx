import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type IVenue } from "@shared/schema";
import { categorizeVenue, formatPrice } from "@/lib/venues";
import { getVenueCoverImage } from "@/lib/venueImages";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Users2, MapPin } from "lucide-react";

interface VenueCardProps {
  venue: IVenue;
}

export function VenueCard({ venue }: VenueCardProps) {
  const category = categorizeVenue(Number(venue.price));
  // Ensure we have a valid string ID
  const venueId = typeof venue._id === 'object' ? venue._id.toString() : venue._id;
  
  if (!venueId) {
    console.error('Invalid venue ID:', venue);
    return null;
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-[16/9] w-full">
        <img 
          src={getVenueCoverImage(venue.name)} 
          alt={venue.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error(`Failed to load image for venue "${venue.name}" (${venueId})`);
            e.currentTarget.src = '/default-venue.jpg';
          }}
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold line-clamp-1">{venue.name}</h3>
          <Badge variant={category === "High" ? "destructive" : category === "Middle" ? "default" : "secondary"}>
            {category}
          </Badge>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Users2 className="h-4 w-4 text-primary" />
            <span className="text-sm">Capacity: {venue.capacity} guests</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm line-clamp-1">{venue.address}</span>
          </div>
        </div>
        <div className="mt-2">
          <span className="font-semibold text-primary">{formatPrice(Number(venue.price))}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link 
          href={`/venue/${venueId}`} 
          className="w-full"
        >
          <Button 
            className="w-full"
            variant={venue.email ? "default" : "secondary"}
          >
            {venue.email ? 'Book Now' : 'View Details'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
