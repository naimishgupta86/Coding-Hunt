// ======================================================
// CODING HUNT - ANTI CHEAT SYSTEM
// ======================================================

export function startAntiCheat(onViolation) {
  if (typeof onViolation !== "function") {
    return () => {};
  }

  let alreadyReported = false;

  const report = (type) => {
    // Same violation ko multiple times report nahi karna
    if (alreadyReported) return;

    alreadyReported = true;

    console.warn(
      "🚨 ANTI-CHEAT VIOLATION:",
      type
    );

    onViolation(type);
  };

  // ====================================================
  // TAB SWITCH
  // ====================================================

  const handleVisibilityChange = () => {
    if (document.hidden) {
      report("TAB_SWITCH");
    }
  };

  // ====================================================
  // WINDOW / TAB BLUR
  // ====================================================

  const handleBlur = () => {
    report("WINDOW_BLUR");
  };

  // ====================================================
  // COPY
  // ====================================================

  const handleCopy = (event) => {
    event.preventDefault();

    report("COPY_ATTEMPT");
  };

  // ====================================================
  // PASTE
  // ====================================================

  const handlePaste = (event) => {
    event.preventDefault();

    report("PASTE_ATTEMPT");
  };

  // ====================================================
  // CUT
  // ====================================================

  const handleCut = (event) => {
    event.preventDefault();

    report("CUT_ATTEMPT");
  };

  // ====================================================
  // RIGHT CLICK
  // ====================================================

  const handleContextMenu = (event) => {
    event.preventDefault();

    report("RIGHT_CLICK");
  };

  // ====================================================
  // DRAG
  // ====================================================

  const handleDragStart = (event) => {
    event.preventDefault();

    report("DRAG_ATTEMPT");
  };

  // ====================================================
  // EVENT LISTENERS
  // ====================================================

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  window.addEventListener(
    "blur",
    handleBlur
  );

  document.addEventListener(
    "copy",
    handleCopy
  );

  document.addEventListener(
    "paste",
    handlePaste
  );

  document.addEventListener(
    "cut",
    handleCut
  );

  document.addEventListener(
    "contextmenu",
    handleContextMenu
  );

  document.addEventListener(
    "dragstart",
    handleDragStart
  );

  // ====================================================
  // CLEANUP
  // ====================================================

  return () => {
    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.removeEventListener(
      "blur",
      handleBlur
    );

    document.removeEventListener(
      "copy",
      handleCopy
    );

    document.removeEventListener(
      "paste",
      handlePaste
    );

    document.removeEventListener(
      "cut",
      handleCut
    );

    document.removeEventListener(
      "contextmenu",
      handleContextMenu
    );

    document.removeEventListener(
      "dragstart",
      handleDragStart
    );
  };
}