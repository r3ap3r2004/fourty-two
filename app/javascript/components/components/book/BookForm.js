import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Book component
const BookForm = ({ onSubmit, book }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");
  const [summary, setSummary] = useState(book?.summary || "");
  const [hint, setHint] = useState(book?.hint || "");
  const [errors, setErrors] = useState({});

  const coverImageChangeHandler = (event) => {
    setCoverImageFile(event.target.files[0]);
  };

  const pdfChangeHandler = (event) => {
    setPdfFile(event.target.files[0]);
  };

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setSummary(book.summary);
      setHint(book.hint);
    }
  }, [book]);

  const handleSubmit = (event) => {
    // Perform validation
    event.preventDefault();
    const validationErrors = {};
    if (title?.trim() === "") {
      validationErrors.title = "Title is required";
    }
    if (author?.trim() === "") {
      validationErrors.author = "Author is required";
    }
    if (!book?.id && pdfFile === null) {
      validationErrors.pdfFile = "PDF is required";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      const formData = new FormData();
      formData.append("book[title]", title.trim());
      formData.append("book[author]", author.trim());
      formData.append("book[hint]", hint.trim());
      formData.append("book[summary]", summary.trim());
      if (coverImageFile) {
        formData.append("book[cover]", coverImageFile);
      }
      if (pdfFile) {
        formData.append("book[pdf]", pdfFile);
      }

      onSubmit(formData);
    }
  };

  const renderImage = () => {
    if (book?.cover_image) {
      return (
        <div className="blog-page-image">
          <img src={book.cover_image} alt="cover image" />
        </div>
      );
    } else {
      return "";
    }
  };

  return (
    <>
      {renderImage()}
      <form onSubmit={handleSubmit}>
        <label htmlFor="title">
          Title *{errors.title && <span className="error">{errors.title}</span>}
        </label>
        <input
          type="text"
          className="text-field w-input"
          maxLength="256"
          name="title"
          data-name="title"
          placeholder="Enter the title of the book"
          id="title"
          onChange={(event) => setTitle(event.target.value)}
          value={title}
        />

        <label htmlFor="author">
          Author *
          {errors.author && <span className="error">{errors.author}</span>}
        </label>
        <input
          type="text"
          className="text-field w-input"
          maxLength="256"
          name="author"
          data-name="author"
          placeholder="Enter the author of the book"
          id="author"
          onChange={(event) => setAuthor(event.target.value)}
          value={author}
        />
        <label htmlFor="summary">Summary</label>
        <textarea
          id="summary"
          name="summary"
          placeholder="Enter a summary of the book"
          maxLength="5000"
          data-name="Summary"
          className="text-field text-area w-input"
          onChange={(event) => setSummary(event.target.value)}
          value={summary}
        ></textarea>
        <label htmlFor="hint">Hints</label>
        <textarea
          id="hint"
          name="hint"
          placeholder="Enter hints for the AI to improve the format of returned answers."
          maxLength="5000"
          data-name="hint"
          className="text-field text-area w-input"
          onChange={(event) => setHint(event.target.value)}
          value={hint}
        ></textarea>
        <label htmlFor="cover_image" className="file-upload">
          Cover Image
          <input
            type="file"
            id="cover_image"
            name="cover_image"
            accept="image/png, image/jpeg, image/gif"
            onChange={coverImageChangeHandler}
          ></input>
        </label>
        {book?.id ? (
          ""
        ) : (
          <label htmlFor="pdf" className="file-upload">
            PDF File *
            {errors.pdfFile && <span className="error">{errors.pdfFile}</span>}
            <input
              type="file"
              id="pdf"
              name="pdf"
              accept="application/pdf"
              onChange={pdfChangeHandler}
            ></input>
          </label>
        )}
        <div style={{ marginTop: "20px" }}>
          <input
            type="submit"
            value="Submit"
            data-wait="Please wait..."
            className="button w-button"
          />
          <div
            className="button-wrapper"
            style={{ display: "inline", marginLeft: "10px" }}
          >
            <Link
              to={`/books${book?.id ? "/" + book.id : ""}`}
              className="button w-button"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </>
  );
};

export default BookForm;
