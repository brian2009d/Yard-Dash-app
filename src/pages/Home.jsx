import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle, Leaf, Search, User as UserIcon, Briefcase } from 'lucide-react';
import PWASetup from '@/components/utils/PWASetup';

const FeatureCard = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center p-6">
        <div className="flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

export default function HomePage() {
  return (
    <div>
        <PWASetup />
        
        {/* Hero Section */}
        <section className="relative bg-white pt-16 pb-24 sm:pt-24 sm:pb-32">
            <div className="absolute inset-0 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1542622524-c48858b53fc2?q=80&w=2940&auto=format&fit=crop" alt="Lush green lawn" className="w-full h-full object-cover opacity-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
            </div>
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
                    Quality Yard Work, <span className="text-green-600">On Demand</span>
                </h1>
                <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600">
                    Your vision deserves action. Yardash connects you with skilled local workers for all your outdoor needs. From mowing to mulching, get it done right.
                </p>
                
                {/* User Type Selection */}
                <div className="mt-12 mb-8">
                    <h2 className="text-2xl font-bold mb-6">How will you be using Yardash?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <Card className="cursor-pointer hover:shadow-lg hover:border-green-500 transition-all group">
                            <Link to={createPageUrl("ClientSignup")}>
                                <CardHeader className="items-center">
                                    <UserIcon className="w-12 h-12 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                                    <CardTitle>I Want to Hire</CardTitle>
                                    <p className="text-gray-600 text-center">Post jobs, find skilled workers, and get your yard looking great.</p>
                                </CardHeader>
                            </Link>
                        </Card>
                        <Card className="cursor-pointer hover:shadow-lg hover:border-green-500 transition-all group">
                            <Link to={createPageUrl("DasherSignup")}>
                                <CardHeader className="items-center">
                                    <Briefcase className="w-12 h-12 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                                    <CardTitle>Hire Me</CardTitle>
                                    <p className="text-gray-600 text-center">Browse jobs, place bids, and earn money on your own schedule.</p>
                                </CardHeader>
                            </Link>
                        </Card>
                    </div>
                </div>

                <div className="mt-8 flex justify-center gap-4 flex-wrap">
                    <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                        <Link to={createPageUrl("FindWork")}>
                            <Search className="mr-2 h-5 w-5" />
                            Find Work
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700">
                         <Link to={createPageUrl("PostJob")}>
                            <Leaf className="mr-2 h-5 w-5" />
                            Post a Job
                        </Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
                    <p className="text-lg text-gray-600 mt-2">Simple steps to a beautiful yard.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Leaf className="w-8 h-8 text-green-600" />}
                        title="1. Post Your Job"
                        description="Describe the task, set your budget, and post it for local Dashers to see."
                    />
                    <FeatureCard
                        icon={<Search className="w-8 h-8 text-green-600" />}
                        title="2. Choose Your Dasher"
                        description="Receive bids from skilled workers. Review their profiles, ratings, and choose the best fit."
                    />
                    <FeatureCard
                        icon={<CheckCircle className="w-8 h-8 text-green-600" />}
                        title="3. Job Done"
                        description="Your Dasher completes the job. Pay securely through the app and leave a review."
                    />
                </div>
            </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-white py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="bg-green-600 text-white shadow-xl overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                        <div className="p-8 md:p-12">
                            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
                            <p className="mt-4 text-green-100">Join the Yardash community today. Whether you need help or want to earn, we've got you covered.</p>
                            <Button asChild size="lg" variant="secondary" className="mt-6 bg-white text-green-700 hover:bg-green-50">
                                <Link to={createPageUrl("DasherSignup")}>
                                    Sign Up Now
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                        <div className="hidden md:block h-full">
                            <img src="https://images.unsplash.com/photo-1617096205333-5054311b0a13?q=80&w=2940&auto=format&fit=crop" alt="Gardener at work" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </Card>
            </div>
        </section>
    </div>
  );
}
