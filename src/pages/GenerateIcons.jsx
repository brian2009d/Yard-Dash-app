import React from 'react';
import GenerateIcons from '../components/utils/GenerateIcons';

export default function GenerateIconsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Generate App Icons</h1>
        <p className="text-gray-600 mt-2">Create the required icons for your mobile app</p>
      </div>
      <GenerateIcons />
    </div>
  );
}