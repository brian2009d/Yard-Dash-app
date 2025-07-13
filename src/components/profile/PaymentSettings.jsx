import React, { useState } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Save, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function PaymentSettings({ user, onUpdate }) {
    const [card, setCard] = useState(user.client_payment_info || {});
    const [isEditing, setIsEditing] = useState(!user.client_payment_info?.last_4);
    const [isSaving, setIsSaving] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [error, setError] = useState('');

    const getCardBrand = (number) => {
        if (/^4/.test(number)) return 'Visa';
        if (/^5[1-5]/.test(number)) return 'Mastercard';
        if (/^3[47]/.test(number)) return 'American Express';
        if (/^6011/.test(number)) return 'Discover';
        return 'Card';
    };

    const handleSave = async () => {
        if (cardNumber.length < 15 || expiry.length < 4 || cvc.length < 3) {
            setError('Please enter valid card details.');
            return;
        }
        setError('');
        setIsSaving(true);
        const [exp_month, exp_year_short] = expiry.split('/');
        const exp_year = parseInt(`20${exp_year_short}`);

        const newPaymentInfo = {
            last_4: cardNumber.slice(-4),
            brand: getCardBrand(cardNumber),
            exp_month: parseInt(exp_month),
            exp_year: exp_year,
            stripe_payment_method_id: `pm_sim_${Date.now()}`
        };

        try {
            await User.updateMyUserData({ client_payment_info: newPaymentInfo });
            setCard(newPaymentInfo);
            onUpdate({ ...user, client_payment_info: newPaymentInfo });
            setIsEditing(false);
        } catch (err) {
            setError('Failed to save payment method.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Manage your payment information for jobs.</CardDescription>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="space-y-4">
                        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Card Number</label>
                            <Input placeholder="•••• •••• •••• ••••" value={cardNumber} onChange={e => setCardNumber(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Expiry (MM/YY)</label>
                                <Input placeholder="MM/YY" value={expiry} onChange={e => setExpiry(e.target.value)} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">CVC</label>
                                <Input placeholder="123" value={cvc} onChange={e => setCvc(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</> : <><Save className="mr-2 h-4 w-4"/>Save Card</>}
                            </Button>
                            {card.last_4 && <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                            <CreditCard className="w-8 h-8 text-gray-500" />
                            <div>
                                <p className="font-semibold">{card.brand} ending in {card.last_4}</p>
                                <p className="text-sm text-gray-500">Expires {card.exp_month}/{card.exp_year}</p>
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => setIsEditing(true)}>Edit</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}