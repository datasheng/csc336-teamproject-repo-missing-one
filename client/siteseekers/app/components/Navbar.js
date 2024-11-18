import React from "react";

const Navbar = () => {
  return (
    <>
      <header className="flex items-center justify-between p-6 mx-10 h-20">
        <div className="text-lg font-bold">SiteSeekers</div>
        <div className="flex gap-5">
          <h2 className="hover:cursor-pointer hover:text-white p-3 rounded-md hover:bg-orange-500">
            Home
          </h2>
          <h2 className="hover:cursor-pointer hover:text-white p-3 rounded-md hover:bg-orange-500">
            Profile
          </h2>
        </div>
      </header>
      <hr></hr>
    </>
  );
};

export default Navbar;
