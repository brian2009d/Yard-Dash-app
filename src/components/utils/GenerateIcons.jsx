import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UploadCloud, Download, Image as ImageIcon } from 'lucide-react';

const iconSizes = [
  { name: 'icon-72x72.png', size: 72 },
  { name: 'icon-96x96.png', size: 96 },
  { name: 'icon-128x128.png', size: 128 },
  { name: 'icon-144x144.png', size: 144 },
  { name: 'icon-152x152.png', size: 152 },
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-384x384.png', size: 384 },
  { name: 'icon-512x512.png', size: 512 },
];

export default function GenerateIcons() {
  const [sourceImage, setSourceImage] = useState(null);
  const [generatedIcons, setGeneratedIcons] = useState([]);
  const canvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSourceImage(e.target.result);
        generate(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generate = (imageUrl) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const icons = iconSizes.map(({ name, size }) => {
        canvas.width = size;
        canvas.height = size;
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        return { name, dataUrl: canvas.toDataURL('image/png') };
      });
      setGeneratedIcons(icons);
    };
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>1. Upload Your Base Icon</CardTitle>
          <CardDescription>
            Choose a high-resolution square image (at least 512x512 pixels) to be used as your base icon.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="w-48 h-48 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50">
            {sourceImage ? (
              <img src={sourceImage} alt="Source Preview" className="max-w-full max-h-full" />
            ) : (
              <ImageIcon className="w-16 h-16 text-gray-300" />
            )}
          </div>
          <Button asChild variant="outline">
            <label htmlFor="icon-upload" className="cursor-pointer">
              <UploadCloud className="w-4 h-4 mr-2" />
              Upload Image
            </label>
          </Button>
          <Input id="icon-upload" type="file" accept="image/png, image/jpeg" className="hidden" onChange={handleImageUpload} />
          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </CardContent>
      </Card>
      
      {generatedIcons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Download Your Generated Icons</CardTitle>
            <CardDescription>
              These are the icons required for your app manifest and store listing. Download them all.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {generatedIcons.map((icon) => (
                <div key={icon.name} className="flex flex-col items-center space-y-2 p-2 border rounded-lg">
                  <img src={icon.dataUrl} alt={icon.name} className="w-20 h-20" />
                  <p className="text-xs text-center">{icon.name}</p>
                  <Button asChild size="sm" variant="ghost">
                    <a href={icon.dataUrl} download={icon.name}>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}