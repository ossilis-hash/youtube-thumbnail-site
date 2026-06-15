window.addEventListener("DOMContentLoaded", () => {
  // 1단계: URL 파라미터가 있으면 우선적으로 빠르게 화면에 가인식 시킴
  loadExtensionData();
  // 2단계: 로컬 스토리지에 최종 동기화된 마스터 데이터가 배치되었는지 점검 후 로드
  loadStoredAnalyzerData();
});

// 확장 프로그램이 웹사이트 내부 스토리지를 강제 업데이트 완료했을 때 터지는 커커스텀 이벤트 리스너
window.addEventListener("youtubeAnalyzerDataLoaded", () => {
  loadStoredAnalyzerData();
});

// URL 주소창 뒤에 붙어오는 기본 메타 데이터를 파싱하여 바인딩하는 함수
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

  const finalThumbnailUrl =
    thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  if (extensionThumbnail) extensionThumbnail.src = finalThumbnailUrl;
  if (extensionTitle) extensionTitle.textContent = title || "제목 없음";
  if (extensionChannel) extensionChannel.textContent = channelName || "채널명 확인 안 됨";
  if (extensionUrl) extensionUrl.textContent = url || `https://www.youtube.com/watch?v=${videoId}`;

  if (noDataMessage) noDataMessage.style.display = "none";
  if (extensionResult) extensionResult.style.display = "block";
}

// 확장 프로그램 마스터 객체(대본 텍스트 포함)를 로컬 스토리지에서 복사해 오는 메인 데이터 허브 함수
function loadStoredAnalyzerData() {
  const savedData = localStorage.getItem("youtubeAnalyzerData");

  if (!savedData) {
    return;
  }

  let data;
  try {
    data = JSON.parse(savedData);
  } catch (error) {
    console.error("저장된 데이터를 읽는 중 오류가 발생했습니다.", error);
    return;
  }

  const noDataMessage = document.getElementById("noDataMessage");
  const extensionResult = document.getElementById("extensionResult");
  const extensionThumbnail = document.getElementById("extensionThumbnail");
  const extensionTitle = document.getElementById("extensionTitle");
  const extensionChannel = document.getElementById("extensionChannel");
  const extensionUrl = document.getElementById("extensionUrl");
  const rawScript = document.getElementById("rawScript");

  // 데이터 유효성 검증 바인딩
  if (extensionThumbnail) {
    if (data.thumbnailUrl) {
      extensionThumbnail.src = data.thumbnailUrl;
    } else if (data.videoId) {
      extensionThumbnail.src = `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`;
    }
  }

  if (extensionTitle) extensionTitle.textContent = data.title || "제목 없음";
  if (extensionChannel) extensionChannel.textContent = data.channelName || "채널명 확인 안 됨";
  if (extensionUrl) extensionUrl.textContent = data.url || "";

  // 확장 프로그램이 수집한 원본 대본 텍스트를 대본 입력박스(rawScript)에 완전 동기화 자동 주입
  if (data.transcript && rawScript) {
    rawScript.value = data.transcript;
    
    // 사용자의 번거로움을 덜기 위해 데이터가 주입되자마자 대본 정리(cleanScript) 자동 트리거 가동
    cleanScript();
  }

  if (noDataMessage) noDataMessage.style.display = "none";
  if (extensionResult) extensionResult.style.display = "block";
}

// 추출된 대본 텍스트의 불필요한 노이즈 문자를 걷어내는 정제 프로세스
function cleanScript() {
  const rawScript = document.getElementById("rawScript").value;
  const cleanedScript = document.getElementById("cleanedScript");

  if (!rawScript.trim()) {
    alert("정리할 대본을 입력해주세요.");
    return;
  }

  const cleaned = rawScript
    .replace(/WEBVTT/g, "") // WEBVTT 헤더 제거
    .replace(/^\d+\s*$/gm, "") // SRT 숫자 넘버링 제거
    .replace(/\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}.*/g, "") // SRT 고정 밀리초 규격 제거
    .replace(/\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}[,.]\d{3}.*/g, "") // VTT 시간 스트림 규격 제거
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, "") // 유튜브 일반 자막 타임 코드 싹 제거
    .replace(/<[^>]*>/g, "") // HTML 텍스트 노이즈 태그 클렌징
    .replace(/^(NOTE|STYLE|REGION).*$/gm, "") // 메타 지시어 탈락
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join(" ")
    .replace(/\s+/g, " ") // 연달아 발생한 이중 공백 병합 정리
    .trim();

  if (cleanedScript) {
    cleanedScript.value = cleaned;
  }
}

function copyCleanScript() {
  const cleanedScript = document.getElementById("cleanedScript");

  if (!cleanedScript || !cleanedScript.value.trim()) {
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

// 분석 도구: 프롬프트 자동화 생성 프레임워크 섹션
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
  const cleanedScript = document.getElementById("cleanedScript")?.value.trim() || "";
  const rawScript = document.getElementById("rawScript")?.value.trim() || "";

  const script = cleanedScript || rawScript;

  if (!script) {
    alert("먼저 대본을 입력하거나 정리해주세요.");
    return null;
  }

  return script;
}

function copyPrompt() {
  const promptResult = document.getElementById("promptResult");

  if (!promptResult || !promptResult.value.trim()) {
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