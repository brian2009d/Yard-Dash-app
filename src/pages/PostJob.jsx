
import React, { useState, useEffect } from 'react';
import { Job } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { DollarSign, MapPin, Tag, Type, MessageSquare, AlertCircle, Phone, AlertTriangle, Paperclip } from 'lucide-react'; // Added Paperclip
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PostJobPage() {
    const [jobDetails, setJobDetails] = useState({
        title: '',
        description: '',
        category: '',
        street_address: '', // Changed from 'location' to structured address fields
        city: '',          // New field
        state: '',         // New field
        zip_code: '',      // New field
        client_phone: '',
        special_instructions: '',
        budget: '',
        photo_url: '', // New: Will store the URL of the uploaded photo
    });
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState(null); // For the actual file object selected by user
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // For displaying image preview

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                // Pre-fill fields from user profile
                setJobDetails(prev => ({ 
                    ...prev, 
                    client_phone: currentUser.phone_number || '',
                    street_address: currentUser.street_address || '',
                    city: currentUser.city || '',
                    state: currentUser.state || '',
                    zip_code: currentUser.zip_code || '',
                }));
            } catch (e) {
                // User not logged in, redirect to login
                User.loginWithRedirect(window.location.href);
            }
        };
        checkUser();
    }, []);

    const handleChange = (field, value) => {
        setJobDetails(prev => ({ ...prev, [field]: value }));
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setImagePreviewUrl(URL.createObjectURL(file)); // Create a local URL for preview
        } else {
            setSelectedFile(null);
            setImagePreviewUrl(null);
        }
    };

    // Helper function to simulate file upload to a backend/storage
    const uploadFile = async (file) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // In a real application, this would be an actual API call, e.g.:
                // const formData = new FormData();
                // formData.append('file', file);
                // const response = await fetch('/api/upload-photo', {
                //     method: 'POST',
                //     body: formData,
                // });
                // if (!response.ok) {
                //     // Handle specific upload errors from backend
                //     const errorData = await response.json();
                //     throw new Error(errorData.message || 'File upload failed');
                // }
                // const data = await response.json();
                // resolve(data.url); // Assuming backend returns a URL

                // For demonstration, resolve with a dummy external URL
                const dummyUrl = `https://picsum.photos/seed/${Date.now()}/400/300`; // A dynamic dummy URL
                resolve(dummyUrl);
            }, 1500); // Simulate network delay
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Updated validation for structured address fields
        if (!jobDetails.title || !jobDetails.description || !jobDetails.category || 
            !jobDetails.street_address || !jobDetails.city || !jobDetails.state || !jobDetails.zip_code || 
            !jobDetails.client_phone || !jobDetails.budget) {
            setError('Please fill out all required fields.');
            return;
        }
        setError('');
        setIsSubmitting(true);

        try {
            let finalPhotoUrl = jobDetails.photo_url; // Starts empty, will be updated if a new file is selected

            if (selectedFile) {
                // Upload the selected photo first
                try {
                    finalPhotoUrl = await uploadFile(selectedFile);
                } catch (uploadError) {
                    setError(`Failed to upload photo: ${uploadError.message}`);
                    setIsSubmitting(false);
                    return;
                }
            }

            await Job.create({ 
                ...jobDetails,
                budget: parseFloat(jobDetails.budget),
                client_id: user.id,
                photo_url: finalPhotoUrl, // Pass the uploaded photo URL
            });
            navigate(createPageUrl('Dashboard'));
        } catch (err) {
            setError(`Failed to post job: ${err.message || err}. Please try again.`);
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return <div className="container mx-auto py-8 text-center">Loading...</div>;
    }

    return (
        <div className="bg-gray-50 py-12">
            <div className="container mx-auto max-w-2xl px-4">
                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold">Post a New Job</CardTitle>
                        <CardDescription>Fill in the details below to find the perfect Dasher for your task.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                             {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            <div className="space-y-2">
                                <label className="font-medium flex items-center gap-2"><Type className="w-4 h-4"/>Job Title*</label>
                                <Input placeholder="e.g., 'Weekly Lawn Mowing'" value={jobDetails.title} onChange={e => handleChange('title', e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <label className="font-medium flex items-center gap-2"><MessageSquare className="w-4 h-4"/>Description*</label>
                                <Textarea placeholder="Describe the work needed, any specific requirements, etc." value={jobDetails.description} onChange={e => handleChange('description', e.target.value)} rows={4} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                     <label className="font-medium flex items-center gap-2"><Tag className="w-4 h-4"/>Category*</label>
                                    <Select onValueChange={value => handleChange('category', value)}>
                                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="lawn_mowing">Lawn Mowing</SelectItem>
                                            <SelectItem value="gardening">Gardening</SelectItem>
                                            <SelectItem value="landscaping">Landscaping</SelectItem>
                                            <SelectItem value="gutter_cleaning">Gutter Cleaning</SelectItem>
                                            <SelectItem value="tree_trimming">Tree Trimming</SelectItem>
                                            <SelectItem value="weeding">Weeding</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <label className="font-medium flex items-center gap-2"><DollarSign className="w-4 h-4"/>Budget ($)*</label>
                                    <Input type="number" placeholder="e.g., 50" value={jobDetails.budget} onChange={e => handleChange('budget', e.target.value)} />
                                </div>
                            </div>
                            {/* Structured address fields */}
                            <div className="space-y-2">
                                <label className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/>Location*</label>
                                <Input 
                                    placeholder="Street Address" 
                                    value={jobDetails.street_address} 
                                    onChange={e => handleChange('street_address', e.target.value)} 
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <Input 
                                        placeholder="City" 
                                        value={jobDetails.city} 
                                        onChange={e => handleChange('city', e.target.value)} 
                                    />
                                    <Input 
                                        placeholder="State" 
                                        value={jobDetails.state} 
                                        onChange={e => handleChange('state', e.target.value)} 
                                    />
                                    <Input 
                                        placeholder="Zip Code" 
                                        value={jobDetails.zip_code} 
                                        onChange={e => handleChange('zip_code', e.target.value)} 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="font-medium flex items-center gap-2"><Phone className="w-4 h-4"/>Your Phone Number*</label>
                                <Input 
                                    type="tel" 
                                    placeholder="(555) 123-4567" 
                                    value={jobDetails.client_phone} 
                                    onChange={e => handleChange('client_phone', e.target.value)} 
                                />
                                <p className="text-xs text-gray-500">Contractors will use this to contact you directly</p>
                            </div>
                            {/* Photo Upload Field */}
                            <div className="space-y-2">
                                <label className="font-medium flex items-center gap-2"><Paperclip className="w-4 h-4"/>Job Photo (Optional)</label>
                                <Input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handlePhotoChange} 
                                />
                                {imagePreviewUrl && (
                                    <div className="mt-4">
                                        <img src={imagePreviewUrl} alt="Job Preview" className="max-w-xs h-auto rounded-md shadow-sm" />
                                        <p className="text-sm text-gray-500 mt-1">Photo Preview</p>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500">A picture helps Dashers understand the job site better.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="font-medium flex items-center gap-2"><AlertTriangle className="w-4 h-4"/>Special Instructions</label>
                                <Textarea 
                                    placeholder="Gate code, parking instructions, pet warnings, key location, etc." 
                                    value={jobDetails.special_instructions} 
                                    onChange={e => handleChange('special_instructions', e.target.value)} 
                                    rows={3} 
                                />
                                <p className="text-xs text-gray-500">Help contractors prepare for the job site</p>
                            </div>
                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Posting Job...' : 'Post Job'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
