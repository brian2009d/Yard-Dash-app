import Layout from "./Layout.jsx";

import Home from "./Home";

import FindWork from "./FindWork";

import PostJob from "./PostJob";

import Dashboard from "./Dashboard";

import MapView from "./MapView";

import ClientSignup from "./ClientSignup";

import DasherSignup from "./DasherSignup";

import AdminAnalytics from "./AdminAnalytics";

import About from "./About";

import GenerateIcons from "./GenerateIcons";

import EditProfile from "./EditProfile";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Home: Home,
    
    FindWork: FindWork,
    
    PostJob: PostJob,
    
    Dashboard: Dashboard,
    
    MapView: MapView,
    
    ClientSignup: ClientSignup,
    
    DasherSignup: DasherSignup,
    
    AdminAnalytics: AdminAnalytics,
    
    About: About,
    
    GenerateIcons: GenerateIcons,
    
    EditProfile: EditProfile,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Home />} />
                
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/FindWork" element={<FindWork />} />
                
                <Route path="/PostJob" element={<PostJob />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/MapView" element={<MapView />} />
                
                <Route path="/ClientSignup" element={<ClientSignup />} />
                
                <Route path="/DasherSignup" element={<DasherSignup />} />
                
                <Route path="/AdminAnalytics" element={<AdminAnalytics />} />
                
                <Route path="/About" element={<About />} />
                
                <Route path="/GenerateIcons" element={<GenerateIcons />} />
                
                <Route path="/EditProfile" element={<EditProfile />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}