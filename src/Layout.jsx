
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Leaf, Home, Search, PlusCircle, LayoutDashboard, LogOut, UserCircle, MapPin, Shield } from 'lucide-react';
import { User } from '@/entities/User';
import SplashScreen from '@/components/ui/SplashScreen';

const Logo = () => (
  <Link to={createPageUrl("Home")} className="flex items-center gap-2 text-green-600">
    <Leaf className="w-7 h-7" />
    <span className="text-2xl font-bold text-gray-800">Yardash</span>
  </Link>
);

const NavLinks = ({ inSheet, onLinkClick, user }) => {
  const links = [
    { name: 'Home', href: createPageUrl('Home'), icon: Home },
    { name: 'About', href: createPageUrl('About'), icon: UserCircle },
    { name: 'Map View', href: createPageUrl('MapView'), icon: MapPin },
    { name: 'Find Work', href: createPageUrl('FindWork'), icon: Search },
    { name: 'Post a Job', href: createPageUrl('PostJob'), icon: PlusCircle },
    { name: 'Dashboard', href: createPageUrl('Dashboard'), icon: LayoutDashboard },
  ];

  if (user && user.role === 'admin') {
    links.push({ name: 'Admin', href: createPageUrl('AdminAnalytics'), icon: Shield });
  }

  return (
    <nav className={`flex items-center gap-4 ${inSheet ? 'flex-col items-start w-full' : 'hidden md:flex'}`}>
      {links.map((link) => (
        <Link
          key={link.name}
          to={link.href}
          onClick={onLinkClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            inSheet ? 'w-full' : ''
          } hover:bg-green-50 hover:text-green-700`}
        >
          <link.icon className="w-4 h-4" />
          {link.name}
        </Link>
      ))}
    </nav>
  );
};

export default function Layout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSplashActive, setIsSplashActive] = useState(false); // Disabled for now
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [location.pathname]);

  const handleLogout = async () => {
    await User.logout();
    navigate(createPageUrl('Home'));
    setUser(null);
  };
  
  const handleSheetLinkClick = () => {
    setIsSheetOpen(false);
  };

  if (loading) {
      return (
          <div className="w-screen h-screen flex items-center justify-center">
              <p>Loading...</p>
          </div>
      )
  }
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <NavLinks user={user} />
            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profile_picture_url || ''} alt={user.full_name} />
                        <AvatarFallback>{user.full_name?.[0]}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link to={createPageUrl('Dashboard')}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link to={createPageUrl('EditProfile')}>Edit Profile</Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                        <DropdownMenuItem asChild>
                            <Link to={createPageUrl('AdminAnalytics')}>Admin</Link>
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild>
                  <Link to={createPageUrl('ClientSignup')}>Login / Sign Up</Link>
                </Button>
              )}
              
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="outline" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <div className="p-4">
                        <Logo />
                        <div className="mt-8">
                            <NavLinks inSheet user={user} onLinkClick={handleSheetLinkClick} />
                        </div>
                    </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
      <main>
        {children}
      </main>
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
            <Logo />
            <p className="mt-4 text-sm">Your vision deserves action. Yardash makes it happen.</p>
            <p className="mt-2 text-xs">&copy; {new Date().getFullYear()} Yardash. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
