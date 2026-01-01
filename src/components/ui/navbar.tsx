// 'use client';

// import React, { useState } from 'react';
// import { ChevronDown, Menu, X } from 'lucide-react';
// import { useRouter } from "next/navigation";

// const Navbar = () => {
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
//   const router = useRouter();

//   const toggleMobileMenu = () => {
//     setMobileMenuOpen(!mobileMenuOpen);
//   };

//   return (
//     <nav className="bg-white border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Left side - Logo and Nav Links */}

//           <div className="flex items-center gap-8">
//             <div
//             className="flex items-center cursor-pointer group"
//             onClick={() => router.push("/")}
//           >
//             <div className="flex items-start w-28 relative">
//               {/* Icon logo */}
//               <div className="w-12 h-12 shrink-0 transition-opacity duration-300 ease-in-out group-hover:opacity-0">
//                 <img
//                   src="/ew-logo.webp"
//                   alt="EstroWork Logo"
//                   className="w-full h-full object-contain"
//                 />
//               </div>
//               {/* Text logo */}
//               <div className="absolute left-1 top-1/2 -translate-y-1/2">
//                 <img
//                   src="/ew-text.webp"
//                   alt="EstroWork Text"
//                   className="h-5 object-contain opacity-0 -translate-x-2 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-x-0"
//                 />
//               </div>
//             </div>
//           </div>

//             {/* Desktop Navigation */}
//             <ul className="hidden md:flex items-center gap-2">
//               <li className="relative group">
//                 <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
//                   Products
//                   <ChevronDown className="w-4 h-4" />
//                 </button>
//               </li>
//               <li className="relative group">
//                 <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
//                   For Work
//                   <ChevronDown className="w-4 h-4" />
//                 </button>
//               </li>
//               <li className="relative group">
//                 <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
//                   Resources
//                   <ChevronDown className="w-4 h-4" />
//                 </button>
//               </li>
//               <li>
//                 <a href="/pricing" className="px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors block">
//                   Pricing
//                 </a>
//               </li>
//               <li>
//                 <a href="/careers" className="px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors block">
//                   Careers
//                 </a>
//               </li>
//             </ul>
//           </div>

//           {/* Right side - Action Buttons */}
//           <div className="hidden md:flex items-center gap-3">
//             <a href="/contact" className="px-4 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
//               Contact sales
//             </a>
//             <a href="/login" className="px-4 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
//               Log in
//             </a>
//             <a href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-[#38b8b1] rounded-md hover:bg-[#0e7670] transition-colors">
//               Create account
//             </a>
//           </div>

//           {/* Mobile menu button */}
//           <button
//             onClick={toggleMobileMenu}
//             className="md:hidden p-2 text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
//           >
//             {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>
//       </div>

//       {/* Mobile Menu */}
//       {mobileMenuOpen && (
//         <div className="md:hidden border-t border-gray-200">
//           <div className="px-4 py-3 space-y-1">
//             <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
//               Products
//               <ChevronDown className="w-4 h-4" />
//             </button>
//             <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
//               For Work
//               <ChevronDown className="w-4 h-4" />
//             </button>
//             <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
//               Resources
//               <ChevronDown className="w-4 h-4" />
//             </button>
//             <a href="/pricing" className="block px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
//               Pricing
//             </a>
//             <a href="/careers" className="block px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
//               Careers
//             </a>
//             <div className="pt-3 space-y-2 border-t border-gray-200 mt-3">
//               <a href="/contact" className="block px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
//                 Contact sales
//               </a>
//               <a href="/login" className="block px-3 py-2 text-sm font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
//                 Log in
//               </a>
//               <a href="/signup" className="block px-3 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 transition-colors text-center">
//                 Create account
//               </a>
//             </div>
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;





'use client';

import React, { useState } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useRouter } from "next/navigation";

const hoverClass =
  "hover:bg-[#0e7670] hover:text-white transition-colors";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Left side */}
          <div className="flex items-center gap-8">
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => router.push("/")}
            >
              <div className="flex items-start w-28 relative">
                <div className="w-12 h-12 shrink-0 transition-opacity duration-300 group-hover:opacity-0">
                  <img src="/ew-logo.webp" alt="Logo" />
                </div>
                <div className="absolute left-1 top-1/2 -translate-y-1/2">
                  <img
                    src="/ew-text.webp"
                    alt="Text Logo"
                    className="h-5 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Nav */}
            <ul className="hidden md:flex items-center gap-2">
              {["Products", "For Work", "Resources"].map((item) => (
                <li key={item}>
                  <button
                    className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md text-gray-900 ${hoverClass}`}
                  >
                    {item}
                    <ChevronDown className="w-4 h-4 group-hover:text-white" />
                  </button>
                </li>
              ))}

              {["Pricing", "Careers"].map((item) => (
                <li key={item}>
                  <a
                    href={`/${item.toLowerCase()}`}
                    className={`px-3 py-2 text-sm font-medium rounded-md block text-gray-900 ${hoverClass}`}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/contact"
              className={`px-4 py-2 text-sm font-medium rounded-md text-gray-900 ${hoverClass}`}
            >
              Contact sales
            </a>
            <a
              href="/login"
              className={`px-4 py-2 text-sm font-medium rounded-md text-gray-900 ${hoverClass}`}
            >
              Log in
            </a>
            <a
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-[#38b8b1] rounded-md hover:bg-[#0e7670] transition-colors"
            >
              Create account
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-md text-gray-900 ${hoverClass}`}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 space-y-1">
            {["Products", "For Work", "Resources"].map((item) => (
              <button
                key={item}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md text-gray-900 ${hoverClass}`}
              >
                {item}
                <ChevronDown className="w-4 h-4" />
              </button>
            ))}

            {["Pricing", "Careers"].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase()}`}
                className={`block px-3 py-2 text-sm font-medium rounded-md text-gray-900 ${hoverClass}`}
              >
                {item}
              </a>
            ))}

            <div className="pt-3 space-y-2 border-t border-gray-200 mt-3">
              <a
                href="/contact"
                className={`block px-3 py-2 text-sm font-medium rounded-md text-gray-900 ${hoverClass}`}
              >
                Contact sales
              </a>
              <a
                href="/login"
                className={`block px-3 py-2 text-sm font-medium rounded-md text-gray-900 ${hoverClass}`}
              >
                Log in
              </a>
              <a
                href="/signup"
                className="block px-3 py-2 text-sm font-medium text-white bg-[#38b8b1] rounded-md hover:bg-[#0e7670] transition-colors text-center"
              >
                Create account
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
