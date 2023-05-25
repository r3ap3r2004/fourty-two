import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const location = useLocation().pathname;
  const homeClass =
    location === "/" || location === "/books"
      ? "navigation-link w-nav-link w--current"
      : "navigation-link w-nav-link";
  const aboutClass =
    location === "/about"
      ? "navigation-link w-nav-link w--current"
      : "navigation-link w-nav-link";
  const contactClass =
    location === "/contact"
      ? "navigation-link w-nav-link w--current"
      : "navigation-link w-nav-link";

  return (
    <>
      <div
        data-collapse="medium"
        data-animation="default"
        data-duration="400"
        data-easing="ease"
        data-easing2="ease"
        role="banner"
        className="navigation-bar w-nav"
      >
        <div className="w-container">
          <Link to={"/"} className="w-nav-brand w--current">
            <div className="site-name">Ask A Book</div>
          </Link>
          <nav role="navigation" className="navigation-menu w-nav-menu">
            <Link to={"/"} className={homeClass}>
              Home
            </Link>
            <Link to={"/about"} className={aboutClass}>
              About
            </Link>
            <Link to={"/contact"} className={contactClass}>
              Contact
            </Link>
          </nav>
          <div className="menu-button w-nav-button" onClick={toggleMenu}>
            <div className="w-icon-nav-menu"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
