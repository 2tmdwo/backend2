const express = require('express');  // Express.js 모듈을 불러옵니다.
const dotenv = require('dotenv');    // 환경 변수를 관리하기 위한 dotenv 모듈을 불러옵니다.
const OpenAI = require('openai');    // OpenAI API를 사용하기 위한 모듈을 불러옵니다.
const cors = require('cors');        // CORS(Cross-Origin Resource Sharing)를 설정하기 위한 모듈을 불러옵니다.

dotenv.config();  // .env 파일에 정의된 환경 변수를 불러옵니다.
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;  // .env 파일에서 OpenAI API 키를 가져옵니다.

if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is missing from .env file');  // API 키가 누락된 경우 오류를 발생시킵니다.
}

const app = express();  // Express 애플리케이션 객체를 생성합니다.
const port = process.env.PORT || 3000;  // 서버가 실행될 포트를 설정합니다. 환경 변수에 설정된 포트를 사용하거나 기본적으로 3000번 포트를 사용합니다.

app.use(cors());  // CORS 설정을 사용합니다. 모든 도메인에서의 요청을 허용합니다.
app.use(express.json());  // JSON 형식의 요청 본문을 자동으로 파싱하도록 설정합니다.
app.use(express.urlencoded({ extended: true }));  // URL 인코딩된 데이터의 파싱을 허용합니다.

const openai = new OpenAI({
    apiKey: OPENAI_API_KEY  // OpenAI 클라이언트를 API 키로 초기화합니다.
});

// POST 요청을 처리하는 라우트를 설정합니다.
app.post('/rewrite', async (req, res) => {
    const userInput = req.body.text;  // 클라이언트로부터 전달된 텍스트를 가져옵니다.

    try {
        // OpenAI API를 호출하여 입력된 텍스트를 리라이팅합니다.
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 500,  // 최대 500개의 토큰을 생성하도록 제한합니다.
            messages: [
                {"role": "system", "content": `너는 지금부터 직업인으로 한국어 교정 교열을 보는 사람이야. 너의 역할은 다음과 같아, 오자, 탈자, 비문법적 표현, 띄어쓰기, 맞춤법 실수를 발견하고 새롭게 리라이팅해줘야해. \n\n${userInput}\n\n---]n\n 이제 2번째 단계야. 너는 이제 잘나가는 대형 광고대행사의 프로카피라이터야. 프롬프트에 쓰여진 것들을 SNS및 공식홈페이지에 올라갈 내용이라고 생각하면 돼. 그렇기 때문에 하나의 톤으로 세련되고, 매너있는 방식으로 다시 리라이팅해줘야해.`},  // 시스템 메시지: 교정자 역할 설정
                {"role": "user", "content": userInput}  // 사용자가 입력한 텍스트
            ],
        });

        // 리라이팅된 텍스트를 클라이언트에게 JSON 형식으로 반환합니다.
        res.json({ rewrittenText: completion.choices[0].message.content });
    } catch (error) {
        console.error('Error processing request:', error.message);  // 오류 발생 시 콘솔에 로그를 남깁니다.
        res.status(500).send('Error processing request');  // 서버 오류가 발생하면 500 상태 코드를 반환합니다.
    }
});

// 서버를 지정된 포트에서 실행합니다.
app.listen(port, () => {
    console.log(`Server running on port ${port}`);  // 서버가 성공적으로 실행되면 콘솔에 메시지를 출력합니다.
});
//올라가라좀