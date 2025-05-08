import { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import copy from "copy-to-clipboard";
import "./App.css";

function App() {
  const [markdown, setMarkdown] = useState<string>(
    "# Hello, world!\n\nStart typing your markdown here..."
  );
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Base64 utility functions
  const encodeContent = (content: string): string => {
    return btoa(unescape(encodeURIComponent(content)));
  };

  const decodeContent = (encoded: string): string => {
    try {
      return decodeURIComponent(escape(atob(encoded)));
    } catch (error) {
      console.error("Failed to decode base64 content", error);
      return "";
    }
  };

  // Load content and mode from URL on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const contentParam = params.get("content");

    if (modeParam === "edit" || modeParam === "preview") {
      setMode(modeParam);
    }

    if (contentParam) {
      try {
        const decodedContent = decodeContent(contentParam);
        if (decodedContent) {
          setMarkdown(decodedContent);
        }
      } catch (error) {
        console.error("Failed to decode content from URL", error);
      }
    }

    setInitialLoadComplete(true);
  }, []);

  // Update URL when content or mode changes, but only after initial load
  useEffect(() => {
    if (!initialLoadComplete) return;

    const encodedMarkdown = encodeContent(markdown);
    const newUrl = `${window.location.pathname}?mode=${mode}&content=${encodedMarkdown}`;
    window.history.replaceState({}, "", newUrl);
  }, [markdown, mode, initialLoadComplete]);

  const toggleMode = () => {
    setMode(mode === "edit" ? "preview" : "edit");
  };

  const handleCopy = () => {
    copy(window.location.href);
    alert("URL copied to clipboard!");
  };

  return (
    <div className="app-container">
      <header>
        <h1>Share Markdown</h1>
        <div className="controls">
          <button onClick={toggleMode} className="mode-toggle">
            {mode === "edit" ? "Switch to Preview" : "Switch to Edit"}
          </button>
          <button onClick={handleCopy} className="share-button">
            Share
          </button>
        </div>
      </header>
      <main>
        {mode === "edit" ? (
          <MDEditor
            value={markdown}
            onChange={(value) => setMarkdown(value || "")}
            height={500}
            preview="edit"
          />
        ) : (
          <div className="preview-container">
            <MDEditor.Markdown source={markdown} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
