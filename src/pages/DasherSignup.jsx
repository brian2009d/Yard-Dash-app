
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Briefcase, MapPin, Phone, Calendar, DollarSign, Car, AlertCircle } from 'lucide-react';
import ImageUploader from '@/components/ui/ImageUploader';

export default function DasherSignupPage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        full_name: '',
        profile_picture_url: null, // New field for photo upload
        street_address: '',        // New structured address field
        city: '',                  // New structured address field
        state: '',                 // New structured address field
        zip_code: '',              // New structured address field
        phone_number: '',
        date_of_birth: '',
        bio: '',
        skills: '',
        vehicle_description: '',
        payment_method: '',
        routing_number: '',
        account_number: '',
        cashapp_handle: '',
        paypal_email: '',
        venmo_handle: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                if (currentUser) {
                    setFormData(prev => ({
                        ...prev,
                        full_name: currentUser.full_name || ''
                    }));
                }
            } catch (e) {
                setUser(null);
            }
            setIsLoading(false);
        };
        checkUser();
    }, []);

    const handleLogin = () => {
        User.loginWithRedirect(window.location.href);
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (url) => {
        setFormData(prev => ({ ...prev, profile_picture_url: url }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        const requiredFields = ['full_name', 'street_address', 'city', 'state', 'zip_code', 'phone_number', 'date_of_birth', 'bio', 'skills', 'vehicle_description', 'payment_method'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            setError('Please fill out all required fields.');
            return;
        }

        // Validate payment method specific fields
        if (formData.payment_method === 'routing_account' && (!formData.routing_number || !formData.account_number)) {
            setError('Please provide routing and account numbers for bank account payments.');
            return;
        }
        if (formData.payment_method === 'cashapp' && !formData.cashapp_handle) {
            setError('Please provide your CashApp handle.');
            return;
        }
        if (formData.payment_method === 'paypal' && !formData.paypal_email) {
            setError('Please provide your PayPal email.');
            return;
        }
        if (formData.payment_method === 'venmo' && !formData.venmo_handle) {
            setError('Please provide your Venmo handle.');
            return;
        }

        setError('');
        setIsSubmitting(true);

        try {
            const updateData = {
                user_type: 'dasher',
                profile_picture_url: formData.profile_picture_url, // Add profile picture URL
                street_address: formData.street_address, // Use structured address
                city: formData.city,
                state: formData.state,
                zip_code: formData.zip_code,
                phone_number: formData.phone_number,
                date_of_birth: formData.date_of_birth,
                bio: formData.bio,
                skills: formData.skills.split(',').map(s => s.trim()),
                vehicle_description: formData.vehicle_description,
                payment_method: formData.payment_method,
                average_rating: 0
            };

            // Add payment method specific fields
            if (formData.payment_method === 'routing_account') {
                updateData.routing_number = formData.routing_number;
                updateData.account_number = formData.account_number;
            } else if (formData.payment_method === 'cashapp') {
                updateData.cashapp_handle = formData.cashapp_handle;
            } else if (formData.payment_method === 'paypal') {
                updateData.paypal_email = formData.paypal_email;
            } else if (formData.payment_method === 'venmo') {
                updateData.venmo_handle = formData.venmo_handle;
            }

            await User.updateMyUserData(updateData);
            navigate(createPageUrl('Dashboard'));
        } catch (err) {
            console.error('Failed to create profile:', err);
            setError('Failed to create profile. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto max-w-2xl px-4 text-center">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-gray-50 py-12">
                <div className="container mx-auto max-w-2xl px-4">
                    <Card>
                        <CardHeader className="text-center">
                            <Briefcase className="w-16 h-16 mx-auto text-green-600 mb-4" />
                            <CardTitle className="text-3xl font-bold">Worker Signup</CardTitle>
                            <CardDescription>
                                First, you'll need to sign in with your Google account to continue with your worker profile setup.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <Button onClick={handleLogin} className="bg-green-600 hover:bg-green-700" size="lg">
                                Sign In with Google
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const renderPaymentFields = () => {
        switch (formData.payment_method) {
            case 'routing_account':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="font-medium">Routing Number</label>
                            <Input 
                                placeholder="123456789" 
                                value={formData.routing_number} 
                                onChange={e => handleChange('routing_number', e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="font-medium">Account Number</label>
                            <Input 
                                placeholder="1234567890" 
                                value={formData.account_number} 
                                onChange={e => handleChange('account_number', e.target.value)} 
                            />
                        </div>
                    </div>
                );
            case 'cashapp':
                return (
                    <div className="space-y-2">
                        <label className="font-medium">CashApp Handle</label>
                        <Input 
                            placeholder="$YourHandle" 
                            value={formData.cashapp_handle} 
                            onChange={e => handleChange('cashapp_handle', e.target.value)} 
                        />
                    </div>
                );
            case 'paypal':
                return (
                    <div className="space-y-2">
                        <label className="font-medium">PayPal Email</label>
                        <Input 
                            type="email"
                            placeholder="your@email.com" 
                            value={formData.paypal_email} 
                            onChange={e => handleChange('paypal_email', e.target.value)} 
                        />
                    </div>
                );
            case 'venmo':
                return (
                    <div className="space-y-2">
                        <label className="font-medium">Venmo Handle</label>
                        <Input 
                            placeholder="@YourHandle" 
                            value={formData.venmo_handle} 
                            onChange={e => handleChange('venmo_handle', e.target.value)} 
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-gray-50 py-12">
            <div className="container mx-auto max-w-2xl px-4">
                <Card>
                    <CardHeader className="text-center">
                        <Briefcase className="w-16 h-16 mx-auto text-green-600 mb-4" />
                        <CardTitle className="text-3xl font-bold">Worker Setup</CardTitle>
                        <CardDescription>Join our community of skilled yard work professionals.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            
                            <ImageUploader 
                                onUpload={handleImageUpload} 
                                userName={formData.full_name}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="font-medium">Full Name</label>
                                    <Input 
                                        placeholder="Enter your full name" 
                                        value={formData.full_name} 
                                        onChange={e => handleChange('full_name', e.target.value)} 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="font-medium flex items-center gap-2">
                                        <Calendar className="w-4 h-4"/>
                                        Date of Birth
                                    </label>
                                    <Input 
                                        type="date"
                                        value={formData.date_of_birth} 
                                        onChange={e => handleChange('date_of_birth', e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-medium flex items-center gap-2">
                                    <MapPin className="w-4 h-4"/>
                                    Address
                                </label>
                                <Input 
                                    placeholder="Street Address" 
                                    value={formData.street_address} 
                                    onChange={e => handleChange('street_address', e.target.value)} 
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                            <div className="space-y-2">
                                <label className="font-medium flex items-center gap-2">
                                    <Phone className="w-4 h-4"/>
                                    Phone Number
                                </label>
                                <Input 
                                    type="tel"
                                    placeholder="(555) 123-4567" 
                                    value={formData.phone_number} 
                                    onChange={e => handleChange('phone_number', e.target.value)} 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="font-medium">Bio</label>
                                <Textarea 
                                    placeholder="Tell clients about yourself, your experience, and what makes you a great choice..." 
                                    value={formData.bio} 
                                    onChange={e => handleChange('bio', e.target.value)} 
                                    rows={4} 
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="font-medium">Skills</label>
                                    <Input 
                                        placeholder="Mowing, Edging, Hedge Trimming" 
                                        value={formData.skills} 
                                        onChange={e => handleChange('skills', e.target.value)} 
                                    />
                                    <p className="text-xs text-gray-500">Separate skills with a comma.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="font-medium flex items-center gap-2">
                                        <Car className="w-4 h-4"/>
                                        Vehicle Description
                                    </label>
                                    <Input 
                                        placeholder="Red Ford F-150 Truck" 
                                        value={formData.vehicle_description} 
                                        onChange={e => handleChange('vehicle_description', e.target.value)} 
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="font-medium flex items-center gap-2">
                                        <DollarSign className="w-4 h-4"/>
                                        Funds Received Method
                                    </label>
                                    <Select onValueChange={value => handleChange('payment_method', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="How would you like to receive payments?" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="routing_account">Bank Account (Routing & Account Number)</SelectItem>
                                            <SelectItem value="cashapp">CashApp</SelectItem>
                                            <SelectItem value="paypal">PayPal</SelectItem>
                                            <SelectItem value="venmo">Venmo</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {renderPaymentFields()}
                            </div>

                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating Profile...' : 'Complete Profile & Start Earning'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
