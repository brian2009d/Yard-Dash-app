
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon } from 'react-leaflet';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, MapPin, Tag, User } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet - using a simpler approach
const createCustomIcon = () => {
  return L.divIcon({
    html: `<div style="background-color: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
};

const PropertyMarker = ({ job, onJobSelect }) => {
  const position = [job.latitude, job.longitude];
  
  // Create property boundary polygon if available
  const propertyBounds = job.property_boundaries && job.property_boundaries.length > 0 
    ? job.property_boundaries.map(coord => [coord.lat, coord.lng])
    : null;

  return (
    <>
      <Marker position={position} icon={createCustomIcon()}>
        <Popup>
          <Card className="w-64 border-0 shadow-none">
            <CardContent className="p-3">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">{job.title}</h3>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{job.city}, {job.state}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">${job.budget}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {job.category.replace('_', ' ')}
                  </Badge>
                </div>
                {job.estimated_square_feet && (
                  <p className="text-xs text-gray-500">
                    ~{job.estimated_square_feet.toLocaleString()} sq ft
                  </p>
                )}
                <Button 
                  size="sm" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => onJobSelect(job)}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </Popup>
      </Marker>
      
      {propertyBounds && (
        <Polygon
          positions={propertyBounds}
          pathOptions={{
            color: '#10b981',
            weight: 2,
            opacity: 0.8,
            fillColor: '#10b981',
            fillOpacity: 0.1,
          }}
        />
      )}
    </>
  );
};

export default function MapView({ jobs, onJobSelect, center = [40.7128, -74.0060] }) {
  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {jobs.map((job) => (
          job.latitude && job.longitude && (
            <PropertyMarker
              key={job.id}
              job={job}
              onJobSelect={onJobSelect}
            />
          )
        ))}
      </MapContainer>
    </div>
  );
}
