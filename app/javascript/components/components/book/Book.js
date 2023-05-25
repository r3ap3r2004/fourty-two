import React from "react";
import { Link } from "react-router-dom";
import BooksSvg from "/app/assets/images/books.svg";

// Book component
const Book = ({ title, author, id, coverImage, summary }) => {
  const renderImage = () => {
    if (coverImage) {
      return (
        <img style={{ height: "100%" }} src={coverImage} alt="cover image" />
      );
    } else {
      return <img src={BooksSvg} alt="cover image" />;
    }
  };
  return (
    <div className="post-wrapper">
      <div className="post-content">
        <div
          className="w-row"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          <div
            className="w-col w-col-4 w-col-medium-4"
            style={{ display: "flex", flexGrow: 1, justifyContent: "center" }}
          >
            <Link
              to={`/books/${id}`}
              className="blog-title-link w-inline-block"
            >
              {renderImage()}
            </Link>
          </div>
          <div
            className="w-col w-col-8 w-col-medium-8"
            style={{
              display: "flex",
              flexGrow: 1,
              flexDirection: "column",
              alignSelf: "center",
              padding: "20px",
            }}
          >
            <Link
              to={`/books/${id}`}
              className="blog-title-link w-inline-block"
            >
              <h2>{title}</h2>
            </Link>
            <div className="details-wrapper">
              <div className="post-info">
                <p className="post-summary">{author}</p>
              </div>
            </div>
            <div className="post-summary-wrapper">
              <p className="post-summary">{summary.slice(0, 500)}</p>
              <Link to={`/books/${id}`} className="read-more-link">
                Read more...
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Book;
