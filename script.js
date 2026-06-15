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

  const noDataMessage = document.getElementById("noDataMessage");
  const extensionResult = document.getElementById("extensionResult");
  const extensionThumbnail = document.getElementById("extensionThumbnail");
  const extensionTitle = document.getElementById("extensionTitle");
  const extensionChannel = document.getElementById("extensionChannel");
  const extensionUrl = document.getElementById("extensionUrl");

  const finalThumbnailUrl = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  extensionThumbnail.src = finalThumbnailUrl;
  extensionTitle.textContent = title || "제목 없음";
  extensionChannel.textContent = channelName || "채널명 확인 안 됨";
  extensionUrl.textContent = url || `https://www.youtube.com/watch?v=${videoId}`;

  noDataMessage.style.display = "none";
  extensionResult.style.display = "block";
}

function cleanScript() {
  const rawScript = document.getElementById("rawScript").value;
  const cleanedScript = document.getElementById("cleanedScript");

  if (!rawScript.trim()) {
    alert("정리할 대본을 입력해주세요.");
    return;
  }

  const cleaned = rawScript
    // WEBVTT 제거
    .replace(/WEBVTT/g, "")

    // SRT 번호 제거
    .replace(/^\d+\s*$/gm, "")

    // SRT 시간코드 제거
    .replace(/\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}.*/g, "")

    // VTT 시간코드 제거
    .replace(/\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}[,.]\d{3}.*/g, "")

    // 유튜브 대본 시간코드 제거: 0:00, 12:34, 1:02:33
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, "")

    // HTML 태그 제거
    .replace(/<[^>]*>/g, "")

    // 특수 메타 제거
    .replace(/^(NOTE|STYLE|REGION).*$/gm, "")

    // 줄 정리
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(" ")

    // 공백 정리
    .replace(/\s+/g, " ")
    .trim();

  cleanedScript.value = cleaned;
}

function copyCleanScript() {
  const cleanedScript = document.getElementById("cleanedScript");

  if (!cleanedScript.value.trim()) {
    alert("복사할 정리된 대본이 없습니다.");
    return;
  }

  navigator.clipboard.writeText(cleanedScript.value);
  alert("정리된 대본이 복사되었습니다.");
}

function downloadCleanScript() {
  const cleanedScript = document.getElementById("cleanedScript").value;

  if (!cleanedScript.trim()) {
    alert("다운로드할 대본이 없습니다.");
    return;
  }

  downloadTextFile("cleaned-script.txt", cleanedScript);
}

function makeSummaryPrompt() {
  const script = getAnalysisText();

  if (!script) return;

  const prompt = `
아래 유튜브 영상 대본을 분석해서 핵심 내용을 정리해줘.

요청사항:
1. 영상의 핵심 주제 요약
2. 주요 내용 5개 정리
3. 영상의 흐름 구조 분석
4. 시청자가 얻을 수 있는 인사이트 정리
5. 벤치마킹할 만한 포인트 정리

[영상 대본]
${script}
`.trim();

  document.getElementById("promptResult").value = prompt;
}

function makeShortsPrompt() {
  const script = getAnalysisText();

  if (!script) return;

  const prompt = `
아래 유튜브 영상 대본을 바탕으로 쇼츠로 만들기 좋은 소재를 뽑아줘.

요청사항:
1. 쇼츠 소재 10개 추천
2. 각 소재별 후킹 문장 작성
3. 30초~60초 쇼츠 구성안 작성
4. 자막으로 쓰기 좋은 핵심 문장 추천
5. 조회수를 기대할 수 있는 포인트 설명

[영상 대본]
${script}
`.trim();

  document.getElementById("promptResult").value = prompt;
}

function makeTitlePrompt() {
  const script = getAnalysisText();

  if (!script) return;

  const prompt = `
아래 유튜브 영상 대본을 분석해서 클릭을 유도할 수 있는 제목을 추천해줘.

요청사항:
1. 궁금증 유발형 제목 10개
2. 충격/반전형 제목 10개
3. 정보 전달형 제목 10개
4. 짧고 강한 제목 10개
5. 가장 추천하는 제목 TOP 5와 이유

[영상 대본]
${script}
`.trim();

  document.getElementById("promptResult").value = prompt;
}

function makeThumbnailPrompt() {
  const script = getAnalysisText();

  if (!script) return;

  const prompt = `
아래 유튜브 영상 대본을 분석해서 썸네일 문구를 추천해줘.

요청사항:
1. 5글자 이내 강한 문구 10개
2. 8글자 이내 궁금증 유발 문구 10개
3. 감정 자극형 문구 10개
4. 썸네일 메인 문구와 보조 문구 조합 10개
5. 가장 추천하는 조합 TOP 5와 이유

[영상 대본]
${script}
`.trim();

  document.getElementById("promptResult").value = prompt;
}

function getAnalysisText() {
  const cleanedScript = document.getElementById("cleanedScript").value.trim();
  const rawScript = document.getElementById("rawScript").value.trim();

  const script = cleanedScript || rawScript;

  if (!script) {
    alert("먼저 대본을 입력하거나 정리해주세요.");
    return null;
  }

  return script;
}

function copyPrompt() {
  const promptResult = document.getElementById("promptResult");

  if (!promptResult.value.trim()) {
    alert("복사할 프롬프트가 없습니다.");
    return;
  }

  navigator.clipboard.writeText(promptResult.value);
  alert("프롬프트가 복사되었습니다.");
}

function downloadAnalysis() {
  const title = document.getElementById("extensionTitle").textContent || "영상 제목 없음";
  const channel = document.getElementById("extensionChannel").textContent || "채널명 없음";
  const url = document.getElementById("extensionUrl").textContent || "";
  const script = document.getElementById("cleanedScript").value || document.getElementById("rawScript").value;
  const prompt = document.getElementById("promptResult").value;

  if (!script.trim() && !prompt.trim()) {
    alert("다운로드할 분석 자료가 없습니다.");
    return;
  }

  const content = `
[유튜브 콘텐츠 분석 자료]

영상 제목:
${title}

채널명:
${channel}

영상 주소:
${url}

----------------------------

[정리된 대본]

${script}

----------------------------

[생성된 프롬프트]

${prompt}
`.trim();

  downloadTextFile("youtube-analysis.txt", content);
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}