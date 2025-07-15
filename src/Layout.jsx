import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
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
import { Menu, Leaf, Home, Search, PlusCircle, LayoutDashboard, LogOut, UserCircle, MapPin, Star, ShieldCheck, Image as ImageIcon, Download } from 'lucide-react';
import SplashScreen from '@/components/ui/SplashScreen';

const Logo = () => (
  <Link to={createPageUrl("Home")} className="flex items-center gap-2 text-green-600">
    <Leaf className="w-7 h-7" />
    <span className="text-2xl font-bold text-gray-800">Yardash</span>
  </Link>
);

const NavLinks = ({ inSheet, onLinkClick }) => {
  const links = [
    { name: 'Home', href: createPageUrl('Home'), icon: Home },
    { name: 'About', href: createPageUrl('About'), icon: UserCircle },
    { name: 'Map View', href: createPageUrl('MapView'), icon: MapPin },
    { name: 'Find Work', href: createPageUrl('FindWork'), icon: Search },
    { name: 'Post a Job', href: createPageUrl('PostJob'), icon: PlusCircle },
    { name: 'Dashboard', href: createPageUrl('Dashboard'), icon: LayoutDashboard },
  ];

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
  const [isSplashActive, setIsSplashActive] = useState(true);
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

  const handleSplashComplete = () => {
    setIsSplashActive(false);
  };

  const handleLogout = async () => {
    await User.logout();
    navigate(createPageUrl('Home'));
    setUser(null);
  };
  
  const handleSheetLinkClick = () => {
    setIsSheetOpen(false);
  }

  if (isSplashActive) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />
            <NavLinks />
            <div className="flex items-center gap-4">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profile_picture_url} alt={user.full_name} />
                        <AvatarFallback>{user.full_name?.[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <div className="flex justify-between items-center">
                            <p className="text-sm font-medium leading-none">{user.full_name}</p>
                            {user.user_type === 'dasher' && user.average_rating > 0 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>
                                    <span>{user.average_rating.toFixed(1)}</span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Dashboard')} className="flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('EditProfile')} className="flex items-center">
                        <UserCircle className="mr-2 h-4 w-4" />
                        <span>Edit Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    {user.role === 'admin' && (
                        <>
                        <DropdownMenuItem asChild>
                            <Link to={createPageUrl('AdminAnalytics')} className="flex items-center">
                                <ShieldCheck className="mr-2 h-4 w-4" />
                                <span>Admin Analytics</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={createPageUrl('GenerateIcons')} className="flex items-center">
                                <ImageIcon className="mr-2 h-4 w-4" />
                                <span>App Icon Generator</span>
                            </Link>
                        </DropdownMenuItem>
                        </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-600 focus:bg-red-50">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button onClick={() => User.loginWithRedirect(window.location.href)}>Login / Sign Up</Button>
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
                            <NavLinks inSheet onLinkClick={handleSheetLinkClick} />
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
