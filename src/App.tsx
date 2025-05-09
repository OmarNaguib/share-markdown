import { useEffect, useState, useCallback, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import copy from "copy-to-clipboard";
import "./App.css";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string'

function App() {
  const [markdown, setMarkdown] = useState<string>(
    "# Hello, world!\n\nStart typing your markdown here..."
  );
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);

  // Base64 utility functions
  const encodeContent = (content: string): string => {
    return compressToEncodedURIComponent(content);
  };

  const decodeContent = (encoded: string): string => {
    try {
      return decompressFromEncodedURIComponent(encoded);
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
        const newHash = `#mode=${newMode}&content=${encodedMarkdown}`;
        window.location.hash = newHash;
        debounceTimerRef.current = null;
      }, 500); // 500ms debounce delay
    },
    [initialLoadComplete]
  );

  // Load content and mode from URL hash on initial load
  useEffect(() => {
    // Remove the leading # if present
    const hashContent = window.location.hash.substring(1);
    const params = new URLSearchParams(hashContent);
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
        console.error("Failed to decode content from URL hash", error);
      }
    }

    setInitialLoadComplete(true);

    // Add hash change listener to update state when hash changes
    const handleHashChange = () => {
      const newHashContent = window.location.hash.substring(1);
      const newParams = new URLSearchParams(newHashContent);
      const newMode = newParams.get("mode");
      const newContent = newParams.get("content");

      if (newMode === "edit" || newMode === "preview") {
        setMode(newMode);
      }

      if (newContent) {
        try {
          const decodedContent = decodeContent(newContent);
          if (decodedContent) {
            setMarkdown(decodedContent);
          }
        } catch (error) {
          console.error("Failed to decode content from URL hash", error);
        }
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
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
    // Add a temporary "Copied!" message
    const button = document.querySelector('.share-button');
    const originalText = button?.textContent;
    if (button) {
      button.textContent = 'Copied!';
      setTimeout(() => {
      if (button && originalText) button.textContent = originalText;
      }, 2000);
    }
    
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
