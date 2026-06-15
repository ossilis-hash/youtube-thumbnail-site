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