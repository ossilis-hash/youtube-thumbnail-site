function getYoutubeVideoId(url) {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);

    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

function extractThumbnail() {
  const input = document.getElementById("youtubeUrl");
  const errorMessage = document.getElementById("errorMessage");
  const result = document.getElementById("result");
  const thumbnailImage = document.getElementById("thumbnailImage");
  const downloadLink = document.getElementById("downloadLink");

  const url = input.value.trim();
  const videoId = getYoutubeVideoId(url);

  if (!videoId) {
    errorMessage.textContent = "올바른 유튜브 주소를 입력해주세요.";
    result.style.display = "none";
    return;
  }

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  thumbnailImage.src = thumbnailUrl;
  downloadLink.href = thumbnailUrl;

  errorMessage.textContent = "";
  result.style.display = "block";
}

window.addEventListener("DOMContentLoaded", () => {
  loadExtensionData();
});

function loadExtensionData() {
  const params = new URLSearchParams(window.location.search);

  const videoId = params.get("videoId");
  const title = params.get("title");
  const channelName = params.get("channelName");
  const url = params.get("url");
  const thumbnailUrl = params.get("thumbnailUrl");

  if (!videoId) {
    return;
  }

  const extensionResult = document.getElementById("extensionResult");
  const extensionThumbnail = document.getElementById("extensionThumbnail");
  const extensionTitle = document.getElementById("extensionTitle");
  const extensionChannel = document.getElementById("extensionChannel");
  const extensionUrl = document.getElementById("extensionUrl");

  extensionThumbnail.src = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  extensionTitle.textContent = title || "제목 없음";
  extensionChannel.textContent = channelName || "채널명 확인 안 됨";
  extensionUrl.textContent = url || "";

  extensionResult.style.display = "block";
}