import React, { useEffect, useState } from "react";

// Question component
const Question = ({
  onFeelingLucky,
  prePopulatedQuestion,
  onSubmit,
  children,
}) => {
  const [question, setQuestion] = useState(prePopulatedQuestion || "");

  const handleChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(question);
  };

  const handleFeelingLucky = (event) => {
    event.preventDefault();
    onFeelingLucky();
  };

  useEffect(() => {
    setQuestion(prePopulatedQuestion);
  }, [prePopulatedQuestion]);

  const renderButton = () => {
    if (question) {
      return (
        <button className="button w-button" type="submit">
          Submit
        </button>
      );
    } else {
      return (
        <button
          onClick={handleFeelingLucky}
          className="button w-button"
          type="submit"
        >
          I'm feeling lucky
        </button>
      );
    }
  };

  return (
    <>
      <div>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={question}
            onChange={handleChange}
            placeholder="Ask a question..."
            autoFocus
            className="text-field w-input"
            maxLength="256"
          />
          {renderButton()}
        </form>
        {children}
      </div>
    </>
  );
};

export default Question;
