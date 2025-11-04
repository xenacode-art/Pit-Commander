
import React from 'react';

const PitCommanderLogo = () => (
    <svg width="40" height="40" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
        <rect width="200" height="200" rx="20" fill="#1A202C"/>
        <path d="M40 160V40L100 90V160H40Z" fill="#EB0A1E"/>
        <path d="M100 90L160 40V160L100 110V90Z" fill="#E53E3E"/>
        <path d="M100 90L40 40" stroke="white" strokeWidth="10"/>
        <path d="M100 90L160 40" stroke="white" strokeWidth="10"/>
    </svg>
);


const Header: React.FC = () => {
    return (
        <header className="flex items-center p-4 bg-gray-800 rounded-lg shadow-lg">
            <PitCommanderLogo />
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-red-500 tracking-wider">PIT COMMANDER</h1>
                <p className="text-sm text-gray-400">Toyota GR Cup - Indianapolis Race Analytics</p>
            </div>
        </header>
    );
};

export default Header;
