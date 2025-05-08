import { useEffect, useState, useCallback, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import copy from "copy-to-clipboard";
import "./App.css";

function App() {
  const [markdown, setMarkdown] = useState<string>(
    "# Hello, world!\n\nStart typing your markdown here..."
  );
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);

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

  // Update URL with debouncing
  const updateUrl = useCallback(
    (newMarkdown: string, newMode: "edit" | "preview") => {
      if (!initialLoadComplete) return;

      // Clear any existing timer
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }

      // Set a new timer
      debounceTimerRef.current = window.setTimeout(() => {
        const encodedMarkdown = encodeContent(newMarkdown);
        const newUrl = `${window.location.pathname}?mode=${newMode}&content=${encodedMarkdown}`;
        window.history.replaceState({}, "", newUrl);
        debounceTimerRef.current = null;
      }, 500); // 500ms debounce delay
    },
    [initialLoadComplete]
  );

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

  const handleMarkdownChange = useCallback(
    (value: string | undefined) => {
      const newValue = value || "";
      setMarkdown(newValue);
      updateUrl(newValue, mode);
    },
    [mode, updateUrl]
  );

  const toggleMode = useCallback(() => {
    const newMode = mode === "edit" ? "preview" : "edit";
    setMode(newMode);
    updateUrl(markdown, newMode);
  }, [markdown, mode, updateUrl]);

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
            onChange={handleMarkdownChange}
            height={500}
            preview="edit"
            highlightEnable={false}
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
