import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/Layout.jsx';
import { createPageUrl } from '@/utils';

// Import all page components
import AboutPage from './About';
import AdminAnalyticsPage from './AdminAnalytics';
import PostJobPage from './PostJob';
import ClientSignupPage from './ClientSignup';
import DasherSignupPage from './DasherSignup';
import EditProfilePage from './EditProfile';
import GenerateIconsPage from './GenerateIcons';

const pages = [
  { path: 'About', Component: AboutPage },
  { path: 'AdminAnalytics', Component: AdminAnalyticsPage },
  { path: 'PostJob', Component: PostJobPage },
  { path: 'ClientSignup', Component: ClientSignupPage },
  { path: 'DasherSignup', Component: DasherSignupPage },
  { path: 'EditProfile', Component: EditProfilePage },
  { path: 'GenerateIcons', Component: GenerateIconsPage },
];

export default function Pages() {
  return (
    <BrowserRouter>
      <Routes>
        {pages.map(({ path, Component }) => (
          <Route
            key={path}
            path={createPageUrl(path)}
            element={<Layout><Component /></Layout>}
          />
        ))}
      </Routes>
    </BrowserRouter>
  );
}
