import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // send DELETE request to /users/sign_out
    fetch("/users/sign_out", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": document.querySelector('[name="csrf-token"]').content,
      },
    })
      .then((res) => {
        if (res.ok) {
          window.location.href = "/";
        }
      })
      .catch((error) => {
        console.log(error);
      });
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
        <div className="w-container" style={{ position: "relative" }}>
          <Link to={"/"} className="w-nav-brand w--current">
            <div className="site-name">Ask A Book</div>
          </Link>
          <nav
            role="navigation"
            style={{ display: isMenuOpen ? "block" : "" }}
            className="navigation-menu w-nav-menu"
          >
            <Link to={"/"} className={homeClass}>
              Home
            </Link>
            <Link to={"/about"} className={aboutClass}>
              About
            </Link>
            <Link to={"/contact"} className={contactClass}>
              Contact
            </Link>
            <a
              href="#"
              className="navigation-link w-nav-link"
              onClick={handleLogout}
            >
              Logout
            </a>
          </nav>
          <div
            style={{ position: "absolute", right: "10px", top: "0px" }}
            className="menu-button w-nav-button"
            onClick={toggleMenu}
          >
            <div className="w-icon-nav-menu"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
