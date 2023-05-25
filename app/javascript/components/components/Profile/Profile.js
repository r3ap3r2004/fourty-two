import React from "react";
import Social33 from "images/social-33.svg";
import Social18 from "images/social-18.svg";
import Social09 from "images/social-09.svg";
import Avatar from "images/avatar.jpg";

const Profile = () => {
  return (
    <div className="white-wrapper">
      <img src={Avatar} alt="" className="circle-profile" />
      <p className="site-description">My name is Chris Miller.</p>
      <p>
        I am a software engineer who can help you turn your vision into reality.
      </p>
      <div className="grey-rule"></div>
      <div className="social-link-group">
        <a
          href="https://github.com/r3ap3r2004/fourty-two"
          className="social-icon-link w-inline-block"
          rel="nofollow"
        >
          <img src={Social33} width="25" alt="" />
        </a>
        <a
          href="https://twitter.com/chrisinsights"
          className="social-icon-link w-inline-block"
          rel="nofollow"
        >
          <img src={Social18} width="25" alt="" />
        </a>
        <a
          href="https://www.linkedin.com/in/chris-miller-749a6a7/"
          className="social-icon-link w-inline-block"
          rel="nofollow"
        >
          <img src={Social09} width="25" alt="" />
        </a>
      </div>
    </div>
  );
};

export default Profile;
