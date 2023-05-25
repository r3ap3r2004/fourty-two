import React from "react";
import BooksSvg from "/app/assets/images/books.svg";

const BookDetail = ({ title, author, children, coverImage, summary }) => {
  const renderImage = () => {
    if (coverImage) {
      return <img src={coverImage} alt="cover image" />;
    } else {
      return <img src={BooksSvg} alt="cover image" />;
    }
  };

  return (
    <>
      <div style={{ padding: "10px" }}>
        <div className="blog-page-image">{renderImage()}</div>
        <div className="post-content">
          <h1>{title}</h1>
          <div className="details-wrapper">
            <div className="post-info">{author}</div>
            <div className="post-info">|</div>
            <div className="post-info">{summary}</div>
          </div>
          <div className="grey-rule"></div>
          <div className="body-copy w-richtext"></div>
          {children}
        </div>
      </div>
    </>
  );
};

export default BookDetail;
