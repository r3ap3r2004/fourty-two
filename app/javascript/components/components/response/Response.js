import React, { useState, useEffect, useRef } from "react";

// Response component
const Response = ({
  text,
  audio,
  runtime,
  audioID,
  onFinishedDisplayingResponse,
  children,
}) => {
  const [displayedResponse, setDisplayedResponse] = useState("");
  const audioRef = useRef();

  useEffect(() => {
    // we handle audio separately because it comes back asynchronusly from the text
    // this is required since resemble.ai no longer allows synchronous clips unless
    // you are on the enterprise plan
    if (audioRef?.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play();
    }
  }, [audio]);

  useEffect(() => {
    let typeSpeed = 100;
    if (audioID && !runtime) {
      // we created an audio track, but we don't know how long it is yet
      // this means that it is still being processed by resemble.ai
      // once it is complete we will get a runtime and display the answer
      return;
    }
    if (runtime && text) {
      // we know how long the audio is, so we can calculate the type speed
      typeSpeed = Math.floor(runtime / text.length);
    }
    let timer = null;

    const showText = (message, index) => {
      setDisplayedResponse(message?.substring(0, index + 1));
      timer = setTimeout(() => showText(message, index + 1), typeSpeed);
      if (message && index == message.length - 1) {
        onFinishedDisplayingResponse();
      }
    };
    if (text) {
      timer = setTimeout(() => {
        showText(text, 0);
      }, typeSpeed);
    }

    return () => clearTimeout(timer);
  }, [text, runtime, audioID]);

  const renderAudio = () => {
    if (!audio) return "";
    return (
      <audio id="audio" controls autoPlay volume="0.3" ref={audioRef}>
        <source src={audio} type="audio/mp3" />
      </audio>
    );
  };

  return !displayedResponse ? (
    ""
  ) : (
    <div>
      <p>
        <strong>Answer:</strong> {displayedResponse}
      </p>
      {children}
      {renderAudio()}
    </div>
  );
};

export default Response;