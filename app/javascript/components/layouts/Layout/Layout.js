import React from "react";
import { Outlet } from "react-router-dom";
import { element } from "prop-types";
import Header from "./Header";

function Layout() {
  return (
    <div className="wrapper">
      <Header />
      <div className="content-wrapper">
        <div className="w-container">
          <div className="w-row">
            <div className="content-column w-col w-col-12">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Layout.propTypes = {
  children: element,
};

export default Layout;
