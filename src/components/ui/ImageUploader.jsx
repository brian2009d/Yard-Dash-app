import React, { useState } from 'react';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ImageUploader({ onUpload, defaultImage = null, userName = '' }) {
    const [isUploading, setIsUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(defaultImage);

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            const { file_url } = await UploadFile({ file });
            onUpload(file_url);
        } catch (error) {
            console.error("Image upload failed:", error);
            setImagePreview(defaultImage);
        } finally {
            setIsUploading(false);
        }
    };
    
    const removeImage = () => {
        setImagePreview(null);
        onUpload(null);
    }

    return (
        <div className="space-y-4 flex flex-col items-center">
             <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                    <AvatarImage src={imagePreview} alt="Profile Preview" />
                    <AvatarFallback className="text-4xl">{userName?.[0].toUpperCase()}</AvatarFallback>
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
            <div className="text-center">
                <Button asChild variant="outline" type="button" size="sm">
                    <label htmlFor="file-upload" className="cursor-pointer">
                        <UploadCloud className="w-4 h-4 mr-2"/>
                        {isUploading ? 'Uploading...' : 'Change Picture'}
                    </label>
                </Button>
                <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </div>
        </div>
    );
}