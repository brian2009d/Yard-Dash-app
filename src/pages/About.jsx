import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Leaf, Users, Clock, MapPin, DollarSign, Shield, ArrowRight, User } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
    <Card className="h-full">
        <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full mx-auto">
                {icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </CardContent>
    </Card>
);

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-white py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <Leaf className="w-12 h-12 text-green-600" />
                        <h1 className="text-4xl font-bold text-gray-900">About Yardash</h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Yardash is a platform that connects homeowners with skilled local contractors, 
                        making yard work and landscaping solutions simple, fast, and reliable.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0">
                            <CardContent className="p-8">
                                <h2 className="text-3xl font-bold text-center mb-6">Our Mission</h2>
                                <p className="text-lg text-gray-700 text-center leading-relaxed">
                                    We believe that maintaining a beautiful yard shouldn't be a hassle. 
                                    Yardash was created to save homeowners time by providing an easy way to find, 
                                    hire, and work with trusted local contractors for all their landscaping needs.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* What We Do Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">What Yardash Can Do</h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Our platform makes it easy to get yard work done right, whether you're hiring or looking for work.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        <FeatureCard
                            icon={<Users className="w-8 h-8 text-green-600" />}
                            title="Connect People"
                            description="Match homeowners with skilled local contractors in their area for all types of yard work."
                        />
                        <FeatureCard
                            icon={<Clock className="w-8 h-8 text-green-600" />}
                            title="Save Time"
                            description="Skip the endless searching and phone calls. Post a job and get bids from qualified contractors."
                        />
                        <FeatureCard
                            icon={<MapPin className="w-8 h-8 text-green-600" />}
                            title="Location-Based"
                            description="Find contractors in your neighborhood using our map view and GPS integration."
                        />
                        <FeatureCard
                            icon={<DollarSign className="w-8 h-8 text-green-600" />}
                            title="Fair Pricing"
                            description="Get competitive bids and choose the contractor that fits your budget and needs."
                        />
                        <FeatureCard
                            icon={<Shield className="w-8 h-8 text-green-600" />}
                            title="Quality Assurance"
                            description="Review system helps maintain quality standards and builds trust in our community."
                        />
                        <FeatureCard
                            icon={<Leaf className="w-8 h-8 text-green-600" />}
                            title="All Services"
                            description="From lawn mowing to landscaping, tree trimming to gutter cleaning - we cover it all."
                        />
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
                    </div>
                    
                    <div className="max-w-4xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* For Homeowners */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl text-center">For Homeowners</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                                        <p>Post your yard work job with details and budget</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                                        <p>Receive bids from local contractors</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                                        <p>Choose your contractor and get the work done</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                                        <p>Pay securely and leave a review</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* For Contractors */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl text-center">For Contractors</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                                        <p>Browse available jobs in your area</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                                        <p>Place competitive bids on jobs you want</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                                        <p>Complete the work and get paid</p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                                        <p>Build your reputation with good reviews</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Developer Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <Card className="bg-gradient-to-r from-gray-50 to-green-50">
                            <CardContent className="p-8">
                                <div className="flex items-center justify-center mb-6">
                                    <User className="w-12 h-12 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">About the Developer</h2>
                                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                                    Yardash was developed by <span className="font-semibold text-green-700">Brian Doyley</span>, 
                                    an independent developer passionate about creating solutions that save people time and connect communities. 
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    Recognizing the challenge homeowners face in finding reliable contractors for yard work, 
                                    Brian built Yardash to bridge the gap between those who need landscaping services 
                                    and skilled professionals who provide them.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-16">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join the Yardash community today and experience a better way to handle your yard work needs.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                            <Link to={createPageUrl("ClientSignup")}>
                                I Want to Hire
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link to={createPageUrl("DasherSignup")}>
                                I Want to Work
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}