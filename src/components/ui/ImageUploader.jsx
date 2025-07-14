import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, X, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dz9dymiev';
const CLOUDINARY_UPLOAD_PRESET = 'yardash_uploads'; // You must create this preset in Cloudinary

export default function ImageUploader({ onUpload, defaultImage = null, userName = '' }) {
    const [isUploading, setIsUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(defaultImage);
    const [error, setError] = useState('');

    // Clean up the object URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (imagePreview && imagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('cloud_name', CLOUDINARY_CLOUD_NAME);

        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Upload failed');
        }

        return await response.json();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError('File size must be less than 10MB');
            return;
        }

        setError('');
        setIsUploading(true);
        
        const localUrl = URL.createObjectURL(file);
        setImagePreview(localUrl);

        try {
            const result = await uploadToCloudinary(file);
            setImagePreview(result.secure_url);
            onUpload(result.secure_url);
            URL.revokeObjectURL(localUrl);
        } catch (err) {
            console.error('Upload error:', err);
            setError(`Upload failed: ${err.message}. Make sure your 'yardash_uploads' preset is set to 'Unsigned' in Cloudinary.`);
            setImagePreview(defaultImage);
            URL.revokeObjectURL(localUrl);
        } finally {
            setIsUploading(false);
        }
    };
    
    const removeImage = () => {
        if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
        }
        setImagePreview(null);
        onUpload(null);
        setError('');
    };

    return (
        <div className="space-y-4 flex flex-col items-center">
            {error && (
                <Alert variant="destructive" className="w-full max-w-md">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            
            <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={imagePreview} alt="Profile Preview" />
                    <AvatarFallback className="text-4xl">{userName?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-white" />
                    </div>
                )}
                 {imagePreview && !isUploading && (
                     <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-1 -right-1 h-7 w-7 rounded-full"
                        onClick={removeImage}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                 )}
            </div>
            
            <div className="relative w-full max-w-sm">
                <Input
                    id="file-upload"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/gif"
                    disabled={isUploading}
                />
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('file-upload').click()}
                    disabled={isUploading}
                >
                    <UploadCloud className="w-4 h-4 mr-2" />
                    {isUploading ? 'Uploading...' : (imagePreview ? 'Change Photo' : 'Upload Photo')}
                </Button>
            </div>
        </div>
    );
}
