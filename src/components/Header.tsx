
import React from 'react';
import { Gavel } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-jury-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Gavel size={28} />
          <h1 className="text-xl font-bold">AI Jury</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm opacity-80">Logged in as:</span>
          <span className="font-semibold">Super Admin</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
