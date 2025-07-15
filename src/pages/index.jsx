import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/Layout';
import { createPageUrl } from '@/utils';

// Import all page components
import AboutPage from './About';
import AdminAnalyticsPage from './AdminAnalytics';
import ClientSignupPage from './ClientSignup';
import DashboardPage from './Dashboard';
import DasherSignupPage from './DasherSignup';
import EditProfilePage from './EditProfile';
import FindWorkPage from './FindWork';
import GenerateIconsPage from './GenerateIcons';
import HomePage from './Home';
import MapViewPage from './MapView';
import PostJobPage from './PostJob';


// This array maps the page names (used in createPageUrl) to their components.
const pages = [
  { path: 'About', Component: AboutPage },
  { path: 'AdminAnalytics', Component: AdminAnalyticsPage },
  { path: 'ClientSignup', Component: ClientSignupPage },
  { path: 'Dashboard', Component: DashboardPage },
  { path: 'DasherSignup', Component: DasherSignupPage },
  { path: 'EditProfile', Component: EditProfilePage },
  { path: 'FindWork', Component: FindWorkPage },
  { path: 'GenerateIcons', Component: GenerateIconsPage },
  { path: 'Home', Component: HomePage },
  { path: 'MapView', Component: MapViewPage },
  { path: 'PostJob', Component: PostJobPage },
];

export default function Pages() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><HomePage /></Layout>} />
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
