
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Briefcase, User as UserIcon, MapPin, Phone, Calendar, DollarSign, Car, AlertCircle, Save, Loader2 } from 'lucide-react';
import ImageUploader from '@/components/ui/ImageUploader';
import PaymentSettings from '@/components/profile/PaymentSettings'; // Added import

export default function EditProfilePage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                setFormData({
                    full_name: currentUser.full_name || '',
                    profile_picture_url: currentUser.profile_picture_url || null,
                    street_address: currentUser.street_address || '',
                    city: currentUser.city || '',
                    state: currentUser.state || '',
                    zip_code: currentUser.zip_code || '',
                    phone_number: currentUser.phone_number || '',
                    bio: currentUser.bio || '',
                    skills: currentUser.skills ? currentUser.skills.join(', ') : '',
                    vehicle_description: currentUser.vehicle_description || '',
                });
            } catch (e) {
                navigate(createPageUrl('Home'));
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (url) => {
        setFormData(prev => ({ ...prev, profile_picture_url: url }));
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
    }
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const updateData = { ...formData };
            if (user.user_type === 'dasher' && typeof updateData.skills === 'string') {
                updateData.skills = updateData.skills.split(',').map(s => s.trim());
            }

            await User.updateMyUserData(updateData);
            navigate(createPageUrl('Dashboard'));
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const DasherFields = () => (
        <>
            <div className="space-y-2">
                <label className="font-medium">Bio</label>
                <Textarea placeholder="Tell clients about yourself..." value={formData.bio} onChange={e => handleChange('bio', e.target.value)} rows={4} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="font-medium">Skills</label>
                    <Input placeholder="Mowing, Edging, Hedge Trimming" value={formData.skills} onChange={e => handleChange('skills', e.target.value)} />
                    <p className="text-xs text-gray-500">Separate skills with a comma.</p>
                </div>
                <div className="space-y-2">
                    <label className="font-medium flex items-center gap-2"><Car className="w-4 h-4"/>Vehicle Description</label>
                    <Input placeholder="Red Ford F-150 Truck" value={formData.vehicle_description} onChange={e => handleChange('vehicle_description', e.target.value)} />
                </div>
            </div>
        </>
    );

    if (isLoading) {
        return <div className="container mx-auto py-8 text-center">Loading profile...</div>;
    }

    return (
        <div className="bg-gray-50 py-12">
            <div className="container mx-auto max-w-2xl px-4">
                <div className="space-y-8"> {/* Added div wrapper for spacing between cards */}
                    <Card>
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl font-bold">Edit Profile</CardTitle>
                            <CardDescription>Keep your account information up to date.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-8">
                                 {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                                
                                <ImageUploader 
                                    onUpload={handleImageUpload} 
                                    defaultImage={formData.profile_picture_url}
                                    userName={formData.full_name}
                                />
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="font-medium">Full Name</label>
                                            <Input value={formData.full_name} onChange={e => handleChange('full_name', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="font-medium flex items-center gap-2"><Phone className="w-4 h-4"/>Phone Number</label>
                                            <Input type="tel" value={formData.phone_number} onChange={e => handleChange('phone_number', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="font-medium flex items-center gap-2"><MapPin className="w-4 h-4"/>Address</label>
                                        <Input 
                                            placeholder="Street Address"
                                            value={formData.street_address} onChange={e => handleChange('street_address', e.target.value)} 
                                        />
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2"> {/* Added mt-2 for spacing */}
                                            <Input 
                                                placeholder="City"
                                                value={formData.city} 
                                                onChange={e => handleChange('city', e.target.value)} 
                                            />
                                            <Input 
                                                placeholder="State"
                                                value={formData.state} 
                                                onChange={e => handleChange('state', e.target.value)} 
                                            />
                                            <Input 
                                                placeholder="Zip Code"
                                                value={formData.zip_code} 
                                                onChange={e => handleChange('zip_code', e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                    
                                    {user.user_type === 'dasher' && <DasherFields />}
                                </div>

                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={isSubmitting}>
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : <><Save className="mr-2 h-4 w-4"/> Save Changes</>}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {user.user_type === 'client' && (
                        <PaymentSettings user={user} onUpdate={handleUserUpdate}/>
                    )}
                </div>
            </div>
        </div>
    );
}
