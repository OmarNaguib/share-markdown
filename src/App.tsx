import { useEffect, useState, useCallback, useRef } from "react";
import MDEditor from "@uiw/react-md-editor";
import copy from "copy-to-clipboard";
import "./App.css";
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

export default function App() {
  const [markdown, setMarkdown] = useState<string>(
    "# Hello, world!\n\nStart typing your markdown here..."
  );
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const debounceTimerRef = useRef<number | null>(null);

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
        compressAndUpdateBrowserUrl(newMarkdown, newMode);

        debounceTimerRef.current = null;
      }, 500); // 500ms debounce delay
    },
    [initialLoadComplete]
  );

  const handleCopy = useCallback(() => {
    compressAndUpdateBrowserUrl(markdown, mode);
    copy(window.location.href);
    // Add a temporary "Copied!" message
    const button = document.querySelector(".share-button");
    const originalText = button?.textContent;
    if (button) {
      button.textContent = "Copied!";
      setTimeout(() => {
        if (button && originalText) button.textContent = originalText;
      }, 2000);
    }
  }, [markdown, mode]);

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
        const decodedContent = decompressFromEncodedURIComponent(contentParam);
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
          const decodedContent = decompressFromEncodedURIComponent(newContent);
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

  // Add Ctrl+S shortcut for sharing
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault(); // Prevent browser's default save action
        handleCopy();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleCopy]);

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

const compressAndUpdateBrowserUrl = (
  newMarkdown: string,
  newMode: "edit" | "preview"
) => {
  const encodedMarkdown = compressToEncodedURIComponent(newMarkdown);
  const newHash = `#mode=${newMode}&content=${encodedMarkdown}`;
  window.location.hash = newHash;
};
