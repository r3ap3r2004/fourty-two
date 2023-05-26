import React, { useState, useEffect, useRef } from "react";
import { useLoaderData, Link } from "react-router-dom";
import {
  useGetBookQuery,
  useAskQuestionMutation,
  useFeelingLuckyQuery,
  useStreamMessagesQuery,
} from "../../../data/api";
import BookDetail from "../../components/book/BookDetail";
import Question from "../../components/question/Question";
import Response from "../../components/response/Response";

const ShowBook = () => {
  const { bookID } = useLoaderData();

  const progressMessage = "Processing.";
  // need to fetch the books from the backend
  const {
    data: streamData,
    error: streamError,
    isLoading: streamLoading,
  } = useStreamMessagesQuery();
  const {
    data: bookData,
    error: bookError,
    isLoading: bookLoading,
  } = useGetBookQuery(bookID);
  const [askQuestion, { data: questionData, isLoading: isUpdating }] =
    useAskQuestionMutation();
  const {
    refetch: feelingLuckyRefetch,
    data: feelingLuckyData,
    isLoading: isFeelingLucky,
  } = useFeelingLuckyQuery({ bookID: bookID });

  const [answer, setAnswer] = useState("");
  const [audio, setAudio] = useState("");
  const [audioID, setAudioID] = useState("");
  const [runtime, setRuntime] = useState(null);
  const [askAnother, setAskAnother] = useState(false);
  const [key, setKey] = useState("");
  const [luckyQuestion, setLuckyQuestion] = useState("");
  const [progress, setProgress] = useState(progressMessage);
  const progressTimeout = useRef(null);
  const audioProcessTimeout = useState(null);
  const [questionID, setQuestionID] = useState(null);

  const handleQuestionSubmit = (question) => {
    askQuestion({ id: bookID, question: question });
  };

  const handleFinishedDisplayingResponse = () => {
    setAskAnother(true);
  };

  const handleAskAnother = () => {
    setAskAnother(false);
    setAnswer("");
    setLuckyQuestion("");
    setAudio("");
    setAudioID("");
    setRuntime(null);
    setKey(Math.random());
    feelingLuckyRefetch();
  };

  const updateProgress = () => {
    setProgress(progress + ".");
  };

  const handleFeelingLucky = () => {
    if (feelingLuckyData?.id) {
      setQuestionID(feelingLuckyData?.id);
      setLuckyQuestion(feelingLuckyData?.question);
      setRuntime(feelingLuckyData.runtime);
      setAnswer(feelingLuckyData.answer);
      setAudio(feelingLuckyData.audio_src_url);
      setAudioID(feelingLuckyData.audio_id);
    } else {
      feelingLuckyRefetch();
    }
  };

  useEffect(() => {
    if (
      streamData &&
      streamData.model_type === "question" &&
      streamData.id == questionID
    ) {
      if (streamData.audio_src_url != audio) {
        setAudio(streamData.audio_src_url);
      }
      if (streamData.audio_id != audioID) {
        setAudioID(streamData.audio_id);
      }
      if (streamData.runtime != runtime) {
        setRuntime(streamData.runtime);
      }
      if (streamData.answer != answer) {
        setAnswer(streamData.answer);
      }
    }
    if (
      streamData &&
      streamData.model_type === "book" &&
      streamData.id == bookID
    ) {
      if (!streamData.processing && progressTimeout.current) {
        // make sure we stop updating the progress if we have received the answer
        clearInterval(progressTimeout.current);
        progressTimeout.current = null;
      }
    }
  }, [streamData]);

  useEffect(() => {
    if (!questionData?.runtime && bookData && !bookData.processing) {
      audioProcessTimeout.current = setTimeout(() => {
        // if we don't receive the audio file within 3 seconds then tell the response component to display the text
        // by telling it that we don't have an audio file.  This can happen if you send text that violates the TOS
        // for resemble.ai.  For example, if you send the question about the book Adventures of Huckleberry Finn
        // that is: "Who was the slave?", then resemble.ai will reject the request and not send back an audio file.
        setAudioID("");
        // reset the progress message
        setProgress(progressMessage);
      }, 3000);
    }
    if (questionData?.runtime) {
      if (audioProcessTimeout.current) {
        // be sure to clear the timeout if one has been set
        clearTimeout(audioProcessTimeout.current);
        audioProcessTimeout.current = null;
      }
    }
    setRuntime(questionData?.runtime);
    setAnswer(questionData?.answer);
    setAudio(questionData?.audio_src_url);
    setAudioID(questionData?.audio_id);
    setQuestionID(questionData?.id);
  }, [questionData, bookData]);

  if (bookLoading || !bookData)
    return (
      <div className="w-dyn-empty">
        <p>Loading...</p>
      </div>
    );

  if (bookError)
    return (
      <div className="w-dyn-empty">
        <p>{bookError}</p>
      </div>
    );

  const renderResponse = () => {
    if (
      isUpdating ||
      isFeelingLucky ||
      (audioID && !runtime) ||
      bookData.processing
    ) {
      progressTimeout.current = setTimeout(updateProgress, 300);
      return (
        <div className="post-content">
          <p style={{ wordWrap: "break-word" }}>{progress}</p>
        </div>
      );
    } else {
      if (progressTimeout.current) {
        // make sure we stop updating the progress if we have received the answer
        clearInterval(progressTimeout.current);
        progressTimeout.current = null;
        // reset the progress message
        setProgress(progressMessage);
      }

      return (
        <Response
          text={answer}
          runtime={runtime}
          audioID={audioID}
          audio={audio}
          key={`ans_${questionID}`}
          onFinishedDisplayingResponse={handleFinishedDisplayingResponse}
        >
          <>
            {askAnother ? (
              <button
                className="button w-button"
                onClick={() => handleAskAnother()}
              >
                Ask another question
              </button>
            ) : (
              ""
            )}
          </>
        </Response>
      );
    }
  };

  const renderQuestion = () => {
    if (bookData.processing) {
      return "";
    } else {
      return (
        <Question
          key={`question_${key}`}
          prePopulatedQuestion={luckyQuestion}
          onSubmit={handleQuestionSubmit}
          onFeelingLucky={handleFeelingLucky}
        />
      );
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <div className="button-wrapper" style={{ display: "flex" }}>
          <Link to={"/books"} className="button w-button">
            ← All Books
          </Link>
        </div>
        <div
          className="button-wrapper"
          style={{ display: "flex", alignSelf: "flex-end" }}
        >
          <Link to={`/books/${bookID}/edit`} className="button w-button">
            Edit Book
          </Link>
        </div>
      </div>
      <div className="post-wrapper">
        <BookDetail
          title={bookData.title}
          coverImage={bookData.cover_image}
          author={bookData.author}
          summary={bookData.summary}
          id={bookData.id}
          onQuestionSubmit={handleQuestionSubmit}
          isUpdating={isUpdating}
        />
        <div className="post-content">{renderQuestion()}</div>
        <div className="post-content">{renderResponse()}</div>
      </div>
    </>
  );
};

export default ShowBook;
