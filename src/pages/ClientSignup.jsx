
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User as UserIcon, MapPin, Phone, CreditCard, AlertCircle } from 'lucide-react';

export default function ClientSignupPage() {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        full_name: '',
        street_address: '',
        city: '',
        state: '',
        zip_code: '',
        phone_number: '',
        yard_acreage: '',
        client_payment_method: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
                // Pre-fill name if available
                if (currentUser) {
                    setFormData(prev => ({
                        ...prev,
                        full_name: currentUser.full_name || ''
                    }));
                }
            } catch (e) {
                // User not logged in - that's okay, show login button
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.full_name || !formData.street_address || !formData.city || !formData.state || !formData.zip_code || !formData.phone_number || !formData.yard_acreage || !formData.client_payment_method) {
            setError('Please fill out all fields.');
            return;
        }
        setError('');
        setIsSubmitting(true);

        try {
            await User.updateMyUserData({
                user_type: 'client',
                street_address: formData.street_address,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zip_code,
                phone_number: formData.phone_number,
                yard_acreage: parseFloat(formData.yard_acreage),
                client_payment_method: formData.client_payment_method
            });
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
                            <UserIcon className="w-16 h-16 mx-auto text-green-600 mb-4" />
                            <CardTitle className="text-3xl font-bold">Client Signup</CardTitle>
                            <CardDescription>
                                First, you'll need to sign in with your Google account to continue with your client profile setup.
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

    return (
        <div className="bg-gray-50 py-12">
            <div className="container mx-auto max-w-2xl px-4">
                <Card>
                    <CardHeader className="text-center">
                        <UserIcon className="w-16 h-16 mx-auto text-green-600 mb-4" />
                        <CardTitle className="text-3xl font-bold">Client Setup</CardTitle>
                        <CardDescription>Complete your profile to start posting jobs and hiring workers.</CardDescription>
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
                                <label className="font-medium flex items-center gap-2">
                                    <UserIcon className="w-4 h-4"/>
                                    Full Name
                                </label>
                                <Input
                                    placeholder="Enter your full name"
                                    value={formData.full_name}
                                    onChange={e => handleChange('full_name', e.target.value)}
                                />
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <label className="font-medium">Total Yard Acreage</label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        placeholder="e.g., 0.25"
                                        value={formData.yard_acreage}
                                        onChange={e => handleChange('yard_acreage', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="font-medium flex items-center gap-2">
                                    <CreditCard className="w-4 h-4"/>
                                    Preferred Payment Method
                                </label>
                                <Select onValueChange={value => handleChange('client_payment_method', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="credit_card">Credit Card</SelectItem>
                                        <SelectItem value="debit_card">Debit Card</SelectItem>
                                        <SelectItem value="paypal">PayPal</SelectItem>
                                        <SelectItem value="cashapp">CashApp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" size="lg" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating Profile...' : 'Complete Profile & Start Hiring'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
