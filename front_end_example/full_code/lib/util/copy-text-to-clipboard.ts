const copyTextToClipboard = async (text: string) => {
  // navigator clipboard api needs a secure context (https)
  if (navigator.clipboard && window.isSecureContext) {
    // navigator clipboard api method
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi copy");
    }
  } else {
    // text area method
    let textArea = document.createElement("textarea");
    textArea.value = text;

    // make the textarea out of viewport
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";

    // attach into DOM
    document.body.appendChild(textArea);

    // focus and select
    textArea.focus();
    textArea.select();

    if (document.execCommand) {
      // allow run command from copy
      document.execCommand("copy");

      // remove element from DOM
      textArea.remove();
    } else {
      throw new Error("Không thể thực thi lệnh");
    }
  }
};

export default copyTextToClipboard;
